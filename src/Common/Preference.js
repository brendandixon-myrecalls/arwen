const moment = require('moment');
const loader = require('./loader');
const _ = require('lodash');

const c = require('./Constants');

const FIELDS = [
    'alertByEmail',
    'alertByPhone',
    'sendSummaries',
    'alertForVins',
    'sendVinSummaries',
    'audience',
    'categories',
    'distribution',
    'risk',
]

class Preference {
    constructor(preference) {
        let p = preference ? preference : {};

        this.alertForVins = p.alertForVins || p.alert_for_vins || p.av || false;
        this.sendVinSummaries = p.sendVinSummaries || p.send_vin_summaries || p.sv || false;

        this.alertByEmail = p.alertByEmail || p.alert_by_email || p.ae || false;
        this.alertByPhone = p.alertByPhone || p.alert_by_phone || p.ap || false;
        this.sendSummaries = p.sendSummaries || p.send_summaries || p.ss || false;

        this.audience = p.audience || p.au || [];
        this.categories = p.categories || p.ct || [];
        this.distribution = p.distribution || p.db || [];
        this.risk = p.risk || p.ri || [];
    }

    get isValidForRecalls() {
        return (
            !_.isEmpty(this.audience) &&
            !_.isEmpty(this.categories) &&
            !_.isEmpty(this.distribution) &&
            !_.isEmpty(this.risk)
        );
    }

    get isValidForVehicles() {
        return true;
    }

    asJSON(...fields) {
        return loader.asJSON(fields, FIELDS, this);
    }

    toJSON(...fields) {
        return loader.toJSON('preferences', fields, FIELDS, this);
    }
}

function load(json) {
    return loader.load(json, Preference);
}

module.exports.load = load;
module.exports.FIELDS = FIELDS;
