const axios = require('axios');
const axiosRetry = require('axios-retry');
const moment = require('moment');
const util = require('util');
const _ = require('lodash');

const loader = require('./loader');
const c = require('./Constants');
const vh = require('./Vehicle');
const vr = require('./VehicleRecall');

const FIELDS = [
    'id',
    'vin',
    'campaigns',
]

const VIN_LETTER_CODE = {
    'A': 1,
    'B': 2,
    'C': 3,
    'D': 4,
    'E': 5,
    'F': 6,
    'G': 7,
    'H': 8,

    'J': 1,
    'K': 2,
    'L': 3,
    'M': 4,
    'N': 5,

    'P': 7,

    'R': 9,

    'S': 2,
    'T': 3,
    'U': 4,
    'V': 5,
    'W': 6,
    'X': 7,
    'Y': 8,
    'Z': 9
};

const VIN_POSITION_WEIGHT = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
const VIN_LENGTH = 17;
const VIN_VALID_CHARACTERS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

class Vin {
    constructor(vin, recalls = []) {
        let v = vin ? vin : {};

        this.id = v.id || null;

        this._vin = v.vin || '';

        this._vehicle = vh.load(v.vehicle) || vh.create();

        this.reviewed = v.reviewed || v.rv || false;

        this.recalls = recalls;
        this.campaigns = v.campaigns || v.cp || [];

        let updatedAt = v.updatedAt || v.updated_at || v.ut;
        this.updatedAt = (updatedAt
            ? moment(updatedAt).utc()
            : c.DISTANT_PAST);

        let updateAllowedOn = v.updateAllowedOn || v.update_allowed_on;
        this.updateAllowedOn = (updateAllowedOn
            ? moment(updateAllowedOn).utc()
            : c.DISTANT_PAST);
    }

    get isValid() {
        return isVinValid(this.vin) && this.vehicle.isValid;
    }

    get isVinValid() {
        return isVinValid(this.vin);
    }

    get make() {
        return (this._vehicle || {}).make || '';
    }

    get model() {
        return (this._vehicle || {}).model || '';
    }

    get year() {
        return (this._vehicle || {}).year || 0;
    }

    get updateAllowed() {
        return this.updateAllowedOn <= moment().utc().endOf('day');
    }

    get vehicle() {
        return this._vehicle;
    }

    set vehicle(vehicle) {
        this._vehicle = vehicle || vh.create();
        this.recalls = [];
    }

    get vin() {
        return this._vin;
    }

    set vin(vin) {
        this._vin = vin;
        this._vehicle = null;
        this.recalls = [];
    }

    get vkey() {
        return this.vehicle.vkey;
    }

    isCampaignResolved(campaignId) {
        return (this.campaigns || []).includes(campaignId);
    }

    asJSON(...fields) {
        let json = loader.asJSON(fields, FIELDS, this);
        json['vehicle'] = this.vehicle.asJSON();
        return json;
    }

    toJSON(...fields) {
        return loader.toJSON('vins', fields, FIELDS, this);
    }

    compare(that) {
        if (this.id < that.id) {
            return -1;
        }
        if (this.id > that.id) {
            return 1;
        }
        return 0;
    }
}

function isVinValid(vin = null) {
    if (_.isEmpty(vin) || vin.constructor != String || vin.length != VIN_LENGTH)
        return false;

    let values = [...vin.toUpperCase()].map(v => (v.match(/[A-Z]{1}/) ? VIN_LETTER_CODE[v] : parseInt(v)));

    values.unshift(0);
    const remainder = values.reduce((sum, value, i) => sum + (value * VIN_POSITION_WEIGHT[i - 1])) % 11;

    return vin[8] == (remainder == 10 ? 'X' : remainder.toString());
}

function retrieveVehicleFromVin(vin) {
    if (!isVinValid(vin)) {
        return {};
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
            url: `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
        })
        .then(response => response.data || {})
        .catch(error => {
            console.log(error)
            return vh.create();
        })
        .then(data => {
            const results = (data['Results'] || []);

            let vehicle = vh.create();
            for (let i=0; i < results.length && !vehicle.isValid; i++) {
                const item = results[i];
                switch (item['VariableId']) {
                    case 26: vehicle.make = item['Value']; break;
                    case 28: vehicle.model = item['Value']; break;
                    case 29: vehicle.year = parseInt(item['Value']); break;
                }
            }

            return vehicle;
        });
}

function validDigit(digit) {
    return VIN_VALID_CHARACTERS.includes(digit || '');
}

function create(vin = {}) {
    return loader.loadSingle(vin, Vin);
}

function load(json, recalls) {
    let vins = loader.load(json, Vin);

    if (recalls) {
        recalls = _.castArray(vr.load(recalls, vr.VehicleRecall));
        _.castArray(vins).forEach(vin => vin.recalls = recalls.filter(r => r.isForVehicle(vin.vehicle)) || []);
    }

    return vins;
}

module.exports.create = create;
module.exports.isVinValid = isVinValid;
module.exports.retrieveVehicleFromVin = retrieveVehicleFromVin;
module.exports.validDigit = validDigit;
module.exports.load = load;
module.exports.FIELDS = FIELDS;
module.exports.VIN_LENGTH = VIN_LENGTH;
