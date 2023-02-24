const entities = require('html-entities')
const _ = require('lodash');

const allFeeds = require('../Common/feeds.json');
const lambda = require('../Common/lambda');
const logger = require('../Common/logger');
const mailer = require('./Mailer');
const ah = require('./AdminHandler');
const h = require('../Common/Host');
const rh = require('./RecallHandler');
const vh = require('./VehicleHandler');
const vr = require('../Common/VehicleRecall');

const HostURLConfig = require('../../.aws/host.json');
const HostUsersConfig = require('../../.aws/host_users.json');

const KNOWN_MODES = [
    'reviewVins',
    'sendRecallAlerts',
    'sendRecallsSummary',
    'sendUserSummary',
    'sendVehicleRecallAlerts',
    'sendVehicleRecallsSummary',
]

const DEFAULT_MODES = {
    reviewVins: true,
    sendRecallAlerts: true,
    sendVehicleRecallAlerts: true,
}

process.on('exit', (code) => {
    logger.info(`Alerter Ending - Code ${code}`);
})
process.on('uncaughtException', (ex) => {
    logger.error(`Unhandled Exception: ${ex.stack}`);
    process.exit(-1);
})

let exitCode = 0;
logger.on('finish', () => {
    process.exit(exitCode);
})

function alertEmitter(recalls, context) {
    let p = Promise.resolve();
    let processed = 0;

    const host = context.host;

    let results = context.results;
    results.total += recalls.length;

    let allUsers = [];

    recalls.forEach(recall => {
        const feed = allFeeds.find(f => f.name == recall.feedName)
        const isVehicle = (recall.constructor == vr.VehicleRecall);

        const mailBuilder = (user) => context.mailBuilder(user, feed, recall);
        const mailType = `${recall.type} ${recall.id}`;
        const markRecallSent = context.markRecallSent;

        let recallUsers = []
        p = p.then(() => {
                const params = {
                        alert: 'true',
                        sort: 'created',
                        [isVehicle ? 'vehicle' : 'recall']: recall.id
                    };

                logger.info(`Sending alerts for ${mailType}`);
                return h.forEachPage(
                        params,
                        (params) => host.searchUsers(params),
                        (users) => {
                            recallUsers = _.concat(recallUsers, _.map(users, u => u.id))
                            return userEmitter(users, mailBuilder, context)
                        })
                    .then(() => {
                        allUsers = _.concat(allUsers, recallUsers);
                        logger.info(`Sent alerts to ${recallUsers.length} users for ${mailType}`)
                    })
            })
            .then(() => {
                processed++;
                results.processed++;
            })
            .then(() => {
                return markRecallSent(recall.id);
            })
            .then(() => {
                results.users = _.uniq(allUsers).length;
            })
            .catch((e) => {
                console.log(e);
                logger.warn(`Failed to mark ${mailType} as sent`);
            })
    });

    // Return the number of recalls processed since they will no longer appear in the search
    return p.then(() => processed);
}

function summaryEmitter(summaryType, context) {
    const host = context.host;
    const mailBuilder = (user) => context.mailBuilder(user);

    const params = {
        sort: 'created',
        summary: summaryType
    };

    return Promise.resolve()
        .then(() => {
            const mailType = context.mailType;
            logger.info(`Sending ${mailType}`);
            return h.forEachPage(
                params,
                (params) => host.searchUsers(params),
                (users) => {
                    context.results.users += users.length;
                    return userEmitter(users, mailBuilder, context)
                });
        });
}

function userEmitter(users, mailBuilder, context) {
    const host = context.host;
    const mailEmitter = context.mailEmitter;

    let p = Promise.resolve();
    let results = context.results;
    let errorUsers = [];
    let successUsers = [];

    users.forEach((user) => {
        const mail = mailBuilder(user);
        const mailType = context.mailType;

        // TODO: Emit to multiple users at once via BCC or will that not make it through Junk mail filters?
        // TODO: Add limited retry logic as an external helper class
        p = p.then(() => {
            return mailEmitter.emit(user, mail)
                .then((info) => {
                    results.email.sent++;
                    successUsers.push(user.id);
                    logger.verbose(`Sent ${mailType} mail to ${user.email} - ${info.messageId}`);
                })
                .catch((e) => {
                    results.email.errors++
                    errorUsers.push(user.id);
                    console.log(e)
                    logger.warn(`Failed sending ${mailType} alert to ${user.email} - ${JSON.stringify(e)}`);
                });
        })
    })

    p = p.then(() => {
        logger.verbose(`${errorUsers.length} user(s) had email errors`);
        return (_.isEmpty(errorUsers)
            ? true
            : context.updateUsersStatus({ users: errorUsers.join(','), emailError: 'true' }));
    })
    .then(() => {
        logger.verbose(`${successUsers.length} user(s) had successful email`);
        return (_.isEmpty(successUsers)
            ? true
            : context.updateUsersStatus({ users: successUsers.join(','), emailSuccess: 'true' }));
    });

    return p.then(() => 0);
}

async function main(modes) {
    logger.info('Alerter Starting');

    const unknownModes = _.difference(_.keys(modes), KNOWN_MODES);
    if (unknownModes.length > 0) {
        logger.error(`Unknown modes: ${unknownModes.join(', ')}`);
        return {
            exitCode: -1,
        }
    }

    if (_.isEmpty(modes)) {
        modes = DEFAULT_MODES;
        logger.verbose(`No modes supplied, using default modes`);
    }
    logger.info(`Modes: ${JSON.stringify(modes)}`);

    const host = new h.Host(HostURLConfig[process.env.HOST_MODE].url, true);
    let context = {
        entities: new entities.AllHtmlEntities(),
        host: host,
        mailBuilder: null,
        mailEmitter: null,
        updateUsersStatus: host.updateUsersStatus,
    }
    let results = {
        exitCode: 0,
    }

    let p = context.host.signIn(
            HostUsersConfig[process.env.HOST_MODE].email,
            HostUsersConfig[process.env.HOST_MODE].password)
        .then(() => mailer.create())
        .then(me => context.mailEmitter = me);

    if (modes.reviewVins) {
        p = p.then(() => {
            return vh.reviewVinsHandler(context)
                .then(r => {
                    results.vins = r;
                });
            });
    }

    if (modes.sendRecallAlerts) {
        p = p.then(() => {
            return rh.recallHandler(alertEmitter, context)
                .then(r => {
                    results.recalls = r;
                });
        });
    }

    if (modes.sendVehicleRecallAlerts) {
        p = p.then(() => {
            return vh.vehicleRecallHandler(alertEmitter, context)
                .then(r => {
                    results.vehicles = r;
                });
        });
    }

    if (modes.sendRecallsSummary) {
        p = p.then(() => {
            return rh.summaryHandler(summaryEmitter, context)
                .then(r => {
                    results.recallsSummary = r;
                });
        });
    }

    if (modes.sendVehicleRecallsSummary) {
        p = p.then(() => {
            return vh.summaryHandler(summaryEmitter, context)
                .then(r => {
                    results.vehicleRecallsSummary = r;
                });
        });
    }

    if (modes.sendUserSummary) {
        p = p.then(() => {
            return ah.summaryHandler(userEmitter, context)
                .then(r => {
                    results.userSummary = r;
                });
        });
    }

    return p.catch((e) => {
            results.exitCode = -1;
            console.log(e)
            logger.error(`Failed to process one or more items - ${e.stack}`);
            return 0;
        })
        .then(() => {
            return results;
        })
}

exports.handler = lambda(main);
