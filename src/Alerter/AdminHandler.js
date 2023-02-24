const moment = require('moment');

const c = require('../Common/Constants');
const logger = require('../Common/logger');
const h = require('../Common/Host');
const us = require('./UserSummaryMail');

const ADMIN_USERS = [
    { email: 'brendandixon@me.com' }
]

function summaryMailBuilder(startDate, endDate, totalUsers, newUsers) {
    return {
        subject: 'Weekly User Summary',
        text: us.createBasicPlain(startDate, endDate, totalUsers, newUsers),
        html: us.createBasicHTML(startDate, endDate, totalUsers, newUsers)
    }
}

exports.summaryHandler = ((userEmitter, context) => {
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
            logger.info(`Processing Weekly User Summary`);

            const startDate = moment().startOf('week').subtract(1, 'day').startOf('week');
            const endDate = moment(startDate).endOf('week');
            const mailType = `Weekly User Summary for ${startDate.format('ll')}-${endDate.format('ll')}`;

            context.mailType = mailType;
            context.results = results;

            let totalUsers = 0;
            let newUsers = 0;

            return host.searchUsers()
                .then(r => {
                    totalUsers = r.total || 0;
                    return host.searchUsers({after: startDate, before: endDate});
                })
                .then(r => {
                    newUsers = r.total || 0;

                    const mail = summaryMailBuilder(startDate, endDate, totalUsers, newUsers);
                    const mailBuilder = (user) => mail;
                    context.mailBuilder = mailBuilder;

                    results.total = totalUsers;
                    results.users = ADMIN_USERS.length;

                    const updateUsersStatus = context.updateUsersStatus;
                    context.updateUsersStatus = () => true;
                    return userEmitter(ADMIN_USERS, mailBuilder, context)
                        .then(() => context.updateUsersStatus = updateUsersStatus);
                });
        })
        .then(() => {
            logger.info(`Sent Weekly User Summary of ${results.total} users to ${results.users} administrators`);
            return results;
        });
});
