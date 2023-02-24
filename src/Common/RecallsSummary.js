const loader = require('./loader');

class RecallsSummary {
    constructor(summary) {
        summary = summary ? summary : {}

        this.total = summary.total || 0;
        this.risk = summary.risk || {};
        this.categories = summary.categories || {};
    }
}

function load(json) {
    return loader.load(json, RecallsSummary);
}

module.exports.load = load;
