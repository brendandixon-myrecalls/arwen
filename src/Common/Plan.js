const loader = require('./loader');
const moment = require('moment');
const _ = require('lodash');

const cp = require('./Coupon');

const FIELDS = [
    'id',
    'name',
    'amount',
    'interval',
    'recalls',
    'vins'
]

const PLANS = {
    both: {
        category: null,
        features: [
            'Notification of recalls from the CSPC, FDA, NHTSA, and USDA',
            'Notification of recalls for 2 vehicles'
        ],
        title: 'Full Protection Plan',
    },

    recalls: {
        category: 'food',
        features: ['Notification of recalls from the CSPC, FDA, NHTSA, and USDA'],
        title: 'Recall Aware',
    },

    vehicles: {
        category: 'vehicles',
        features: ['Notification of recalls for 2 vehicles'],
        title: 'Vehicle Guard',
    }
}

class Plan {
    constructor(plan) {
        let p = plan ? plan : {};

        this.id = p.id || null;

        this.name = p.name || '';
        this.amount = p.amount || 0;
        this.interval = p.interval || '';

        this.recalls = p.recalls || false;
        this.vins = p.vins || 0;

        this.coupon = null;

        this._description = PLANS[(this.isForRecalls && this.isForVehicles
            ? 'both'
            : (this.isForRecalls
                ? 'recalls'
                : 'vehicles'))];
    }

    get duration() {
        return moment().duration(1, this.interval+'s');
    }

    get hasDiscount() {
        return !_.isEmpty(this.coupon);
    }

    get isForRecalls() {
        return this.recalls;
    }

    get isForVehicles() {
        return this.vins && this.vins > 0;
    }

    get category() {
        return this._description.category;
    }

    get discountPrice() {
        return (this.hasDiscount
            ? this.coupon.applyDiscount(this.price)
            : this.price);
    }

    get features() {
        return this._description.features;
    }

    get price() {
        return (this.amount > 0
            ? this.amount / 100.0
            : 0.0);
    }

    get title() {
        return this._description.title;
    }

    asJSON(...fields) {
        return loader.asJSON(fields, FIELDS, this);
    }

    toJSON(...fields) {
        return loader.toJSON('plans', fields, FIELDS, this);
    }
}

function load(json, coupons) {
    let plans = loader.load(json, Plan);

    if (!_.isEmpty(coupons)) {
        coupons = _.castArray(cp.load(coupons, cp.Coupon));
        if (_.isArray(plans)) {
            _.forEach(plans, p => p.coupon = coupons[0]);
        }
        else {
            plans.coupon = coupons[0];
        }
    }

    return plans;
}

module.exports.load = load;
module.exports.FIELDS = FIELDS;
