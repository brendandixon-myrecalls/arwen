const fs = require('fs');
const moment = require('moment');
const util = require('util');
const _ = require('lodash');

const bucket = require('../Common/RecallsBucket');
const constants = require('../Common/Constants');
const lambda = require('../Common/lambda');
const logger = require('../Common/logger');
const rh = require('../Common/Host');
const vr = require('../Common/VehicleRecall');
const vv = require('../Common/Vehicles');

const fda = require('./fda');
const feedStatus = require('./feedStatus');
const options = require('./options');
const parser = require('./parser');
const reader = require('./reader');

process.on('exit', (code) => {
    logger.info(`Feeder Ending`);
})
process.on('uncaughtException', (ex) => {
    logger.error(`Unhandled Exception: ${ex.stack}`);
    process.exit(-1);
})

logger.on('finish', () => {
    process.exit(exitCode);
})

logger.info('Feeder Starting');
logger.info(`Options: ${JSON.stringify(options.all)}`);
if (options.help || options.feeds.length <= 0) {
    logger.info(options.usage);
    process.exit(options.help ? 0 : -1);
}

const MaximumAttempts = 3;
const FailureStatusCodes = [403, 404];

let exitCode = 0;
let feeds = options.feeds;

function isFeedUnavailable(error) {
    return error && error.response && FailureStatusCodes.includes(error.response.status);
}

function delay(seconds) {
    let setTimeoutPromise = util.promisify(setTimeout);
    return setTimeoutPromise(seconds*1000);
}

function saveRecalls(target, feed, recalls, results) {
    feed.saved = [];
    feed.skipped = [];
    feed.failures = [];

    let promises = recalls.map(recall => {
        return (recall.constructor == vr.VehicleRecall
                ? target.saveVehicleRecall(recall)
                : target.saveRecall(recall))
            .then(fSaved => {
                fSaved ? feed.saved.push(recall) : feed.skipped.push(recall);
            })
            .catch(e => {
                logger.error(`Saving Recall ${recall.canonicalId} failed - ${e}`);
                feed.failures.push(recall);
            })
    })

    return Promise.all(promises)
        .then(() => {
            results.saved += feed.saved.length;
            results.skipped += feed.skipped.length;
            results.errors += feed.failures.length;
            reportResults(feed, target);
            return feed.saved.length;
        });
}

function reportResults(feed, target) {
    let report = {
        name: feed.name,
        target: target.name,
        total: feed.recalls.length,
        saved: feed.saved.length,
        skipped: feed.skipped.length,
        failures: feed.failures.length
    }

    logger.info(JSON.stringify(report));
    if (feed.failures.length > 0) {
        report = {
            name: feed.name,
            failures: feed.failures.map(r => r.canonicalId)
        }
        logger.warn(JSON.stringify(report));
    }
}

function processFeed(host, feed, recallsBucket, summary, status) {
    logger.verbose(`Processing ${feed.name}`);
    return Promise.resolve()

        // Load the requested feed
        // - Piping the input stream to both a memory stream and the feed-parser
        //   causes feed-parser to miss end events *if* the input stream comes
        //   from the HTTP response. However, and oddly, if the input stream is locally
        //   created over a string, it all works.
        .then(() => {
            logger.verbose(`Retrieving ${feed.name} from ${feed.url}`);
            return reader.loadUrl(feed.url)
                .then(data => {
                    status.setRetrievedAt(feed.name);
                    return parser.extractRecalls(feed, data);
                    // return (feed.name == 'fda'
                    //     ? fda.extractRecalls(host, feed, data)
                    //     : parser.extractRecalls(feed, data));
                });
        })
        .then(recalls => {
            if (feed.name != 'vehicles') {
                return recalls;
            }

            let convert = [];
            let p = Promise.resolve();
            _.forEach(recalls, recall => {
                p = p.then(() => {
                    const campaignId = vv.extractCampaignIdFromLink(recall.link);
                    let pp = Promise.resolve();
                    if (!_.isEmpty(campaignId)) {
                        pp = pp.then(() => host.doesVehicleRecallCampaignExist(campaignId))
                            .then(fExists => {
                                if (!fExists) {
                                    convert.push(recall);
                                }
                                else {
                                    logger.verbose(`Vehicle Campaign ${campaignId} exists -- skipping conversion`)
                                }
                            })
                    }
                    return pp;
                });
            });
            return p.then(() => vv.convertRecalls(convert));
        })
        .then(recalls => {
            feed.recalls = recalls;
            summary.total += recalls.length;
        })

        // Write all new recalls to the Recalls Host and the feed to S3 (if recalls were saved)
        .then(() => {
            logger.verbose(`Writing ${feed.name} recalls to Recalls Host`);
            return saveRecalls(host, feed, feed.recalls, summary.host)
                .then(cSaved => {
                    if (cSaved > 0) {
                        const mostRecent = moment.utc()
                        status.setMostRecent(feed.name, mostRecent);
                        return recallsBucket.saveFeed(feed.name, mostRecent, feed.content, feed.extension);
                    }
                });
        })

        // Write saved Recalls to S3 (if the Recalls Host failed to write them)
        .then(() => {
            logger.verbose(`Writing ${feed.name} recalls to S3`);
            return saveRecalls(recallsBucket, feed, [...feed.saved], summary.bucket);
        })

        // Return success
        .then(() => true)

        // Return failure
        .catch(error => {
            if (!isFeedUnavailable(error)) {
                logger.warn(`Failed to process feed ${feed.name} -- ${error}`);
                logger.verbose(`Error stack from processing feed ${feed.name} -- ${error.stack}`);
            }
            feed.error = error;
            return false;
        });
}

async function processFeeds() {
    exitCode = 0;

    summary = {
        exitCode: 0,
        total: 0,
        feeds: {
            success: 0,
            skipped: 0,
            errors: 0
        },
        bucket: {
            saved: 0,
            skipped: 0,
            errors: 0
        },
        host: {
            saved: 0,
            skipped: 0,
            errors: 0
        }
    }

    let host = new rh.Host(options.hostURL, true);
    let fSuccess = await (host.signIn(options.hostUser.email, options.hostUser.password)
                            .then((f) => f)
                            .catch((e) => {
                                logger.error(`Host failed login for ${options.hostUser.email}`)
                                return false;
                            }));

    if (fSuccess) {
        let recallsBucket = new bucket.RecallsBucket(options.awsConfig);
        let status = await (recallsBucket.readStatus()
            .then(status => feedStatus.load(status))
            .catch((e) => {
                logger.error(`Failed to read feedStatus: ${e}`);
                return feedStatus.load();
            }));
        logger.info(`FeedStatus: ${JSON.stringify(status.toJSON())}`);

        for (let feed of feeds) {
            let nAttempt = 0;
            let seconds = 1;

            fSuccess = false;

            status.ensureFeed(feed.name);
            do {
                nAttempt++;

                if (nAttempt > MaximumAttempts) {
                    break;
                }

                else if (nAttempt > 1) {
                    seconds *= nAttempt - 1;
                    logger.info(`Retry attempt ${nAttempt} to process feed ${feed.name} - Delaying ${seconds} seconds`);
                    await delay(seconds);
                }

                fSuccess = (await processFeed(host, feed, recallsBucket, summary, status));

                // If the request failed, retry only if the status code allows
                if (!fSuccess && isFeedUnavailable(feed.error)) {
                    break;
                }

            } while (!fSuccess);

            if (feed.error) {
                if (isFeedUnavailable(feed.error)) {
                    summary.feeds.skipped++;
                    logger.info(`Skipping Feed ${feed.name} due to HTTP status code ${feed.error.response.status}`);
                }
                else {
                    summary.feeds.errors++;
                    logger.error(`Failed to process feed ${feed.name} after ${nAttempt} attempts`);
                }
            }
            else {
                summary.feeds.success++;
            }
        }

        const staleFeeds = status.staleFeeds;
        if (staleFeeds) {
            logger.error(`One or more feeds are stale: ${JSON.stringify(staleFeeds)}`);
            status.resetStaleFeeds();
        }

        logger.info(`FeedStatus: ${JSON.stringify(status.toJSON())}`);
        await recallsBucket.saveStatus(status)
            .catch((e) => {
                logger.error(`Failed to write feedStatus: ${e}`);
            });
    }

    summary.exitCode =
    exitCode = (summary.bucket.errors > 0 || summary.host.errors > 0) ? -1 : 0;

    return summary;
}

exports.handler = lambda(processFeeds);
