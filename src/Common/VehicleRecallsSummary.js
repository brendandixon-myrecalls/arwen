const _ = require('lodash');

const loader = require('./loader');

class VehicleRecallsSummary {
    constructor(summary) {
        summary = summary ? summary : {}

        this.total = summary.total || 0;
        this.totalAffectedVehicles = summary.totalAffectedVehicles || 0;
        this.impactedUsers = (_.isArray(summary.impactedUsers)
            ? summary.impactedUsers
            : []);
    }
}

function load(json) {
    return loader.load(json, VehicleRecallsSummary);
}

module.exports.load = load;
