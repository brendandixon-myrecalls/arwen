const moment = require('moment');
const _ = require('lodash');

const constants = require('../Common/Constants');
const loader = require('../Common/loader');

const fd = require('./feed');
const allFeeds = require('../Common/feeds.json').map(f => Object.assign(new fd.Feed(), f));
const feedNames = allFeeds.map(feed => feed.name).join(', ');

class FeedStatus {
    constructor(status) {
        status = status ? status : {}

        this.status = {}
        for (const feedName in status) {
            if (!feedNames.includes(feedName)) {
                continue;
            }

            const feedStatus = status[feedName] || {};

            for (const field of ['mostRecent', 'retrievedAt', 'loggedAt']) {
                const dateTime = (feedStatus[field]
                    ? moment(feedStatus[field]).utc()
                    : moment.utc());

                    this.status[feedName] = this.status[feedName] || {};
                    this.status[feedName][field] = dateTime;
            }
        }

        this.oneDayAgo = moment.utc().add(-1, 'day');
    }

    get staleFeeds() {
        let stale = null;
        for (const feedName in this.status) {
            if (this._isStale(feedName)) {
                stale = stale || {};
                stale[feedName] = this.status[feedName];
            }
        }
        return stale;
    }

    ensureFeed(feedName) {
        if (this.status[feedName])
            return;
        this.status[feedName] = {};
        this.status[feedName]['mostRecent'] = constants.DISTANT_PAST;
        this.status[feedName]['retrievedAt'] = constants.DISTANT_PAST;
        this.status[feedName]['loggedAt'] = constants.DISTANT_PAST;
    }

    resetStaleFeeds(dateTime = moment.utc()) {
        for (const feedName in this.status) {
            if (this._isStale(feedName)) {
                this.status[feedName]['loggedAt'] = dateTime;
            }
        }
    }

    setMostRecent(feedName) {
        const feedStatus = this.status[feedName];
        feedStatus['mostRecent'] = feedStatus['mostRecent'] || moment.utc();
    }

    setRetrievedAt(feedName) {
        const feedStatus = this.status[feedName];
        feedStatus['retrievedAt'] = moment.utc();
        feedStatus['loggedAt'] = feedStatus['loggedAt'] || constants.DISTANT_PAST;
    }

    toJSON() {
       return _.cloneDeep(this.status);
    }

    _isStale(feedName) {
        const feedStatus = this.status[feedName];
        const retrievedAt = feedStatus['retrievedAt'] || constants.DISTANT_PAST;
        const loggedAt = feedStatus['loggedAt'] || constants.DISTANT_PAST;
        return retrievedAt < this.oneDayAgo && loggedAt < this.oneDayAgo.add(10, 'minutes');
    }
}

function load(json = null) {
    return loader.load(json || {}, FeedStatus);
}

module.exports.load = load;
module.exports.FeedStatus = FeedStatus;
