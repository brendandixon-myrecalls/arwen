const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const path = require('path');
const url = require('url');

const logger = require('../Common/logger');

const fd = require('./feed');
const allFeeds = require('../Common/feeds.json').map(f => Object.assign(new fd.Feed(), f));
const feedNames = allFeeds.map(feed => feed.name).join(', ');

let awsConfig = require('../../.aws/feeder.json');
let hostURLConfig = require('../../.aws/host.json');
let hostUsersConfig = require('../../.aws/host_users.json');

const inputOptions = [
    {
        name: 'names',
        type: String,
        typeLabel: 'One or more standard {underline feed-name}',
        description: 'Name of one or more feeds to retrieve (default {bold all feeds})',
        group: 'input',
        defaultOption: true
    },
    {
        name: 'feed-name',
        type: String,
        typeLabel: `{underline feed-name}`,
        description: 'Feed to load from bucket and retrieve',
        group: 'input'
    }
];

const miscOptions = [
    {
        name: 'environment',
        type: String,
        typeLabel: '{underline environment}',
        description: 'development, production, or test (default {bold development})'
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean
    }
];

const optionsList = [].concat(inputOptions, miscOptions);
const options = commandLineArgs(optionsList, { camelCase: true });

let valid = true;
const all = options._all;

let feeds = [];

if (!all.names) {
    all.names = process.env['FEEDER_FEED_NAMES'];
}

if (!all.names) {
    all.names = feedNames;
    feeds = allFeeds;
}
else {
    all.names = all.names.split(',');
    all.names.forEach(name => {
        feed = allFeeds.find(f => f.name === name);
        if (!feed) {
            logger.error(`--names must be one or more of ${names}`);
            valid = false;
        }
        else {
            feeds.push(feed);
        }
    });
}

if (valid) {
    if (!all.environment) {
        all.environment = process.env['NODE_ENV'] || 'development';
    }
}

if (valid) {
    feeds.forEach(feed => {
        try {
            feed.url = new url.URL(feed.url);
        }
        catch (error) {
            logger.error(`Feed ${feed.name} has in invalid URL -- ${feed.url}`);
            valid = false;
        }
    });
}

module.exports.all = all;
module.exports.awsConfig = awsConfig[all.environment];
module.exports.hostURL = hostURLConfig[process.env.HOST_MODE].url;
module.exports.hostUser = hostUsersConfig[process.env.HOST_MODE];
module.exports.environment = all.environment;
module.exports.feeds = valid ? feeds : [];
module.exports.help = all.help || false;
module.exports.usage = commandLineUsage([
    {
        header: 'Feeder',
        content: 'Read feeds and write recalls for processing'
    },
    {
        header: 'Input Options',
        optionList: inputOptions,
    },
    {
        optionList: miscOptions
    }
]);
