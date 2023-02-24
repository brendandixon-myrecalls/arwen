const axios = require('axios');
const axiosRetry = require('axios-retry');
const moment = require('moment');
const loader = require('./loader');
const _ = require('lodash');

const c = require('./Constants');

const FIELDS = [
    'make',
    'model',
    'year',
]

class Vehicle {
    constructor(vehicle) {
        let v = vehicle ? vehicle : {};

        this.make = v.make || v.mk || '';
        this.model = v.model || v.mo || '';
        this.year = v.year || v.yr || 0;
    }

    get isValid() {
        return !_.isEmpty(this.make) && !_.isEmpty(this.model) && this.year > 0
    }

    get description() {
        if (!this.isValid) {
            return '';
        }
        return `${this.year} ${this.make} ${this.model}`;
    }

    get vkey() {
        if (!this.make || !this.model || !this.year) {
            return '';
        }
        const make = _.lowerCase(_.trim(this.make));
        const model = _.lowerCase(_.trim(this.model));
        const year = _.lowerCase(_.trim(this.year.toString()));
        return `${make}|${model}|${year}`
    }

    asJSON(...fields) {
        return loader.asJSON(fields, FIELDS, this);
    }

    toJSON(...fields) {
        return loader.toJSON('vehicles', fields, FIELDS, this);
    }

    toString() {
        return `${this.year} ${this.make} ${this.model}`;
    }
}

function retrieveVehicleCampaigns(vh) {
    if (!vh.isValid) {
        return [];
    }

    axiosRetry(axios, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay
    });

    return axios({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `https://webapi.nhtsa.gov/api/Recalls/vehicle/modelyear/${vh.year}/make/${vh.make}/model/${vh.model}?format=json`,
    })
        .then(response => response.data || {})
        .catch(error => {
            console.log(error)
            return [];
        })
        .then(data => {
            return _.map((data['Results'] || []), result => result['NHTSACampaignNumber'])
        });
}

function create(vehicle={}) {
    return loader.loadSingle(vehicle, Vehicle);
}

function load(json) {
    return loader.load(json, Vehicle);
}

module.exports.create = create;
module.exports.load = load;
module.exports.retrieveVehicleCampaigns = retrieveVehicleCampaigns;
module.exports.FIELDS = FIELDS;
