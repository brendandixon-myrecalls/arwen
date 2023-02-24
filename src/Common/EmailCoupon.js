const _ = require('lodash');

const loader = require('./loader');

const cp = require('./Coupon');

const FIELDS = [
    'id',
    'email',
    'couponId',
]

class EmailCoupon {
    constructor(emailCoupon) {
        let ec = emailCoupon ? emailCoupon : {};

        this.id = ec.id || null;

        this.email = ec.email || '';
        this.couponId = ec.couponId || null;

        this.coupon = null;
    }

    asJSON(...fields) {
        return loader.asJSON(fields, FIELDS, this);
    }

    toJSON(...fields) {
        return loader.toJSON('emailCoupons', fields, FIELDS, this);
    }
}

function create(coupon = {}) {
    return loader.loadSingle(coupon, EmailCoupon)
}

function load(json, coupons) {
    let emailCoupons = loader.load(json, EmailCoupon);

    if (!_.isEmpty(coupons)) {
        coupons = _.castArray(cp.load(coupons, cp.Coupon));
        if (_.isArray(emailCoupons)) {
            _.forEach(emailCoupons, ec => ec.coupon = coupons[0]);
        }
        else {
            emailCoupons.coupon = coupons[0];
        }
    }

    return emailCoupons;
}

module.exports.create = create;
module.exports.load = load;
module.exports.FIELDS = FIELDS;
