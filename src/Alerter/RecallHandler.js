const moment = require('moment');

const c = require('../Common/Constants');
const logger = require('../Common/logger');
const h = require('../Common/Host');
const rm = require('./RecallMail');
const rs = require('./RecallSummaryMail');

function recallMailBuilder(feed, recall, context) {
    const category = recall.preferredCategory;
    const categoryGroup = c.getCategoryGroup(category);
    const color = c.getCategoryPalette(categoryGroup).main;

    const link = recall.shareLink;
    const risk = c.labelFor(recall.risk || 'none', c.RISK);
    const source = feed.title;
    const title = context.entities.decode(recall.title || '');

    return {
        subject: `${feed.title} Recall Alert`,
        text: rm.createBasicPlain(link, risk, source, title),
        html: rm.createBasicHTML(color, link, risk, source, title)
    }
}

function summaryMailBuilder(startDate, endDate, recalls, context) {
    return {
        subject: 'Weekly Recall Alerts',
        text: rs.createBasicPlain(startDate, endDate, recalls, context.entities),
        html: rs.createBasicHTML(startDate, endDate, recalls, context.entities)
    }
}

exports.recallHandler = ((alertEmitter, context) => {
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

    context.mailBuilder = (user, feed, recall) => recallMailBuilder(feed, recall, context);
    context.markRecallSent = (id) => host.markRecallSent(id);
    context.results = results;

    return Promise.resolve()
        .then(() => {
            logger.info(`Processing unsent Recalls requiring alerts`);
            return h.forEachPage(
                {
                    names: c.PUBLIC_NAMES.join(','),
                    risk: 'probable,possible',
                    sort: 'asc',
                    state: 'reviewed',
                },
                (params) => host.searchRecalls(params),
                (recalls) => alertEmitter(recalls, context));
        })
        .then(() => {
            logger.info(`Marking remaining Recalls as sent`);
            return host.markRecallsSent();
        })
        .then(() => {
            logger.info(`Processed ${results.total} recalls`);
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
            logger.info(`Processing Weekly Recall Alerts`);

            const startDate = moment().startOf('week').subtract(1, 'day').startOf('week');
            const endDate = moment(startDate).endOf('week');
            const mailType = `Weekly Recall Alerts for ${startDate.format('ll')}-${endDate.format('ll')}`;

            context.mailType = mailType;
            context.results = results;
            let total = [];

            return h.forEachPage(
                {
                    after: startDate,
                    before: endDate,
                    names: c.PUBLIC_NAMES.join(','),
                    sort: 'asc',
                    state: 'sent',
                },
                (params) => host.searchRecalls(params),
                (recalls) => {
                    total.push(...recalls);
                    return Promise.resolve(0);
                })
                .then(() => {
                    const mail = summaryMailBuilder(startDate, endDate, total, context);
                    results.total = total.length;
                    context.mailBuilder = (user) => mail;
                    return summaryEmitter('recalls', context);
                });
        })
        .then(() => {
            logger.info(`Sent Weekly Recall Summary of ${results.total} recalls to ${results.users} users`);
            return results;
        });
});
