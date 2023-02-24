const loader = require('./loader');

class AlertSummary {
    constructor(summary) {
        summary = summary ? summary : {}

        this.totalSent = summary.totalSent || 0;
        this.totalByEmail = summary.totalByEmail || 0;
        this.totalByPhone = summary.totalByPhone || 0;
        this.risk = summary.risk || {};
        this.categories = summary.categories || {};
    }
}

function load(json) {
    return loader.load(json, AlertSummary);
}

module.exports.load = load;
