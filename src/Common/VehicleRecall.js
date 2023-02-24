const moment = require('moment');
const _ = require('lodash');

const loader = require('./loader');
const vh = require('./Vehicle');

const FIELDS = [
    'id',
    'campaignId',
    'publicationDate',
    'component',
    'summary',
    'consequence',
    'remedy',
    'state',
];

class VehicleRecall {
    constructor(recall) {
        recall = recall ? recall : {};

        this.id = recall.id || null;

        this.campaignId = recall.campaignId;

        let publicationDate = recall.publicationDate || '';
        this.publicationDate = (publicationDate
            ? moment(publicationDate).utc()
            : moment.utc());

        this.component = recall.component;
        this.summary = recall.summary;
        this.consequence = recall.consequence;
        this.remedy = recall.remedy;

        let vehicles = (_.isArray(recall.vehicles)
            ? recall.vehicles
            : []);
        this.vehicles = _.map(vehicles, o => vh.load(o));

        this.state = recall.state || 'reviewed';
    }

    get canonicalId() {
        return this.campaignId;
    }

    get feedSource() {
        return 'nhtsa';
    }

    get isValid() {
        return (_.isString(this.campaignId) &&
            _.isString(this.component) &&
            _.isString(this.summary) &&
            _.isString(this.consequence) &&
            _.isString(this.remedy) &&
            this.vehicles.length > 0);
    }

    get needsSending() {
        return this.state == 'reviewed';
    }

    get shouldSendMail() {
        return true;
    }

    get shouldSendText() {
        return false;
    }

    get link() {
        return `https://www.nhtsa.gov/recalls?nhtsaId=${this.campaignId}`
    }

    get preferredCategory() {
        return 'vehicles';
    }

    get vkeys() {
        return _.filter(_.map((this.vehicles || []), v => v.vkey), vkey => !_.isEmpty(vkey));
    }

    get wasSent() {
        return this.state == 'sent';
    }

    get shareLink() {
        const BASE_URL = process.env.REACT_APP_URL || process.env.URL;
        return `${BASE_URL}vehicles`;
    }

    get type() {
        return 'VehicleRecall';
    }

    isForVehicle(vehicle) {
        return (this.vehicles || []).find(v => v.vkey == vehicle.vkey) != null;
    }

    asJSON(...fields) {
        let json = loader.asJSON(fields, FIELDS, this);
        json['vehicles'] = _.map(this.vehicles, o => o.asJSON());
        return json;
    }

    toJSON(...fields) {
        return loader.toJSON('vehicleRecalls', fields, FIELDS, this);
    }

    compare(that) {
        return this.campaignId.localeCompare(that.compaignId);
    }
}

function create(recall = {}) {
    return loader.loadSingle(recall, VehicleRecall)
}

function load(json) {
    return loader.load(json, VehicleRecall);
}

module.exports.create = create;
module.exports.load = load;
module.exports.VehicleRecall = VehicleRecall;
