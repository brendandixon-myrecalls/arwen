const loader = require('./loader');
const _ = require('lodash');

const FIELDS = [
    'id',
    'name',
    'duration',
    'amountOff',
    'percentOff'
]

class Coupon {
    constructor(coupon) {
        let c = coupon ? coupon : {};

        this.id = c.id || null;

        this.name = c.name || null;
        this.duration = c.duration || null;
        this.amountOff = c.amountOff || 0;
        this.percentOff = c.percentOff || 0;
    }

    applyDiscount(price) {
        if (this.percentOff) {
            price = price * (1.0 - this.percentOff);
        }
        else if (this.amountOff) {
            price = price - this.amountOff;
        }

        return _.round(_.max([0, price]), 2);
    }

    asJSON(...fields) {
        return loader.asJSON(fields, FIELDS, this);
    }

    toJSON(...fields) {
        return loader.toJSON('coupons', fields, FIELDS, this);
    }
}

function load(json) {
    return loader.load(json, Coupon);
}

module.exports.load = load;
module.exports.FIELDS = FIELDS;
module.exports.Coupon = Coupon;
