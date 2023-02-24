const moment = require('moment');

const c = require('../Common/Constants');
const logger = require('../Common/logger');
const h = require('../Common/Host');
const vh = require('../Common/Vehicle');
const vr = require('../Common/VehicleRecall');
const vm = require('./VehicleMail');
const vs = require('./VehicleSummaryMail');
const vv = require('../Common/Vehicles');

function recallMailBuilder(user, recall, context) {
    const category = recall.preferredCategory;
    const categoryGroup = c.getCategoryGroup(category);
    const color = c.getCategoryPalette(categoryGroup).main;

    const vins = user.vinsForVkeys(recall.vkeys);
    const link = recall.shareLink;
    const vehicle = (_.isArray(vins) && vins.length > 0) ? vins[0].vehicle.toString() : '';
    const description = _.truncate(context.entities.decode(recall.consequence || ''), { length: 100, separator: ' ' });

    return {
        subject: `${vehicle} Recall Alert`,
        text: vm.createBasicPlain(link, vehicle, description),
        html: vm.createBasicHTML(color, link, vehicle, description)
    }
}

function reviewVins(vins, context) {
    let p = Promise.resolve();
    let processed = 0;

    const host = context.host;
    let results = context.results;
    results.total += vins.length;

    _.forEach(vins, vin => {
        p = p.then(() => {
            logger.info(`Retrieving campaigns for ${vin.vehicle.vkey}`);
            return vh.retrieveVehicleCampaigns(vin.vehicle)
        })
            .then(campaignIds => {
                let pp = Promise.resolve();

                _.forEach(campaignIds, campaignId => {
                    pp = pp.then(() => {
                        logger.verbose(`Checking for campaign ${campaignId}`)
                        return host.doesVehicleRecallCampaignExist(campaignId);
                    })
                        .then(fExists => {
                            if (fExists) {
                                logger.verbose(`Vehicle recall for campaign ${campaignId} exists`)
                                return;
                            }

                            return Promise.resolve()
                                .then(() => {
                                    logger.verbose(`Retrieving campaign ${campaignId}`)
                                    return vv.retrieveCampaign(campaignId)
                                })
                                .then(campaign => {
                                    logger.verbose(`Saving vehicle recall for campaign ${campaignId}`)
                                    return host.saveVehicleRecall(vr.create(campaign));
                                });
                        })
                })

                return pp;
            })
            .then(() => host.markVinReviewed(vin.id))
            .then(() => {
                processed++;
                results.processed++;
            });
    });

    // Return the number of vins processed since they will no longer appear in the search
    return p.then(() => processed);
}

function summaryMailBuilder(monthDate, totalRecalls, totalAffectedVehicles, isImpacted) {
    return {
        subject: 'Monthly Vehicle Recall Alerts',
        text: vs.createBasicPlain(monthDate, totalRecalls, totalAffectedVehicles, isImpacted),
        html: vs.createBasicHTML(monthDate, totalRecalls, totalAffectedVehicles, isImpacted)
    }
}

exports.reviewVinsHandler = ((context) => {
    const host = context.host;
    let results = {
        total: 0,
        processed: 0,
    };

    return Promise.resolve()
        .then(() => {
            logger.info(`Processing unreviewed VINs`);
            context.results = results;
            return h.forEachPage(
                {},
                (params) => host.searchVinsUnreviewed(params),
                (vins) => reviewVins(vins, context))
        })
        .then(() => {
            logger.info(`Processed ${results.total} unreviewed VINs`);
            return results;
        });
});

exports.summaryHandler = ((summaryEmitter, context) => {
    const host = context.host;
    let results = {
        total: 0,
        users: 0,
        email: {
            sent: 0,
            errors: 0
        },
    };

    return Promise.resolve()
        .then(() => {
            logger.info(`Processing Monthly Vehicle Recall Alerts`);

            const startDate = moment().startOf('month').subtract(1, 'day').startOf('month');
            const endDate = moment(startDate).endOf('month');
            const mailType = `Monthly Vehicle Recall Alerts for ${startDate.format('MMMM YYYY')}`;

            context.mailType = mailType;
            context.results = results;

            return host.summaryVehicleRecalls({
                    after: startDate,
                    before: endDate,
                })
                .then(summary => {
                    results.total = summary.total;
                    return ({
                        impactedMail: summaryMailBuilder(startDate, summary.total, summary.totalAffectedVehicles, true),
                        notImpactedMail: summaryMailBuilder(startDate, summary.total, summary.totalAffectedVehicles, false),
                        impactedUsers: summary.impactedUsers
                    })
                })
                .then(summary => {
                    context.mailBuilder = (user) => (summary.impactedUsers.includes(user.id)
                        ? summary.impactedMail
                        : summary.notImpactedMail);
                    return summaryEmitter('vehicles', context);
                });
        })
        .then(() => {
            logger.info(`Sent Monthly Vehicle Recall Summary of ${results.total} recalls to ${results.users} users`);
            return results;
        });
});

exports.vehicleRecallHandler = ((alertEmitter, context) => {
    const host = context.host;
    let results = {
        total: 0,
        users: 0,
        processed: 0,
        email: {
            sent: 0,
            errors: 0
        },
    };

    return Promise.resolve()
        .then(() => {
            logger.info(`Processing unsent VehicleRecalls`);
            context.results = results;
            context.mailBuilder = (user, feed, recall) => recallMailBuilder(user, recall, context);
            context.markRecallSent = (id) => host.markVehicleRecallSent(id);
            return h.forEachPage(
                {
                    sort: 'asc',
                    state: 'reviewed',
                },
                (params) => host.searchVehicleRecalls(params),
                (recalls) => alertEmitter(recalls, context));
        })
        .then(() => {
            logger.info(`Processed ${results.total} vehicle recalls`);
            return results;
        });
});
