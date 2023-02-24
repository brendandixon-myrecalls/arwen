const loader = require('./loader');
const moment = require('moment');
const _ = require('lodash');

const c = require('./Constants');
const p = require('./Plan');
const vi = require('./Vin');

const FIELDS = [
    'id',
    'startedOn',
    'renewsOn',
    'expiresOn',
    'planId',
    'recalls',
    'countVins',
]

class Subscription {
    constructor(subscription) {
        let s = subscription ? subscription : {};

        this.id = s.id || null;

        let startedOn = s.startedOn || s.started_on || s.so;
        this.startedOn = (startedOn
            ? moment(startedOn).utc()
            : c.DISTANT_PAST);

        let renewsOn = s.renewsOn || s.renews_on || s.ro;
        this.renewsOn = (renewsOn
            ? moment(renewsOn).utc()
            : c.DISTANT_PAST);

        let expiresOn = s.expiresOn || s.expires_on || s.xo;
        this.expiresOn = (expiresOn
            ? moment(expiresOn).utc()
            : c.DISTANT_PAST);

        this.planId = s.planId || null;
        this.plan = null;

        this.recalls = s.recalls || s.rc || false;
        this.countVins = s.countVins || s.cv || 0;

        let vins = (_.isArray(s.vins)
            ? s.vins
            : []);
        this.vins = _.map(vins, o => vi.load(o));
    }

    get isActive() {
        return moment() <= this.expiration;
    }

    get isInactive() {
        return !this.isActive;
    }

    get expiration() {
        return moment(this.expiresOn).add(c.GRACE_PERIOD);
    }

    get renewsSoon() {
        return this.renewsOn <= moment().add(1, 'M');
    }

    get willExpire() {
        return this.expiresOn <= this.renewsOn;
    }

    forPlan(plan) {
        if (plan.constructor == p.Plan) {
            plan = plan.id;
        }
        return this.planId == plan;
    }

    injectPlan(plans) {
        if (!_.isEmpty(plans)) {
            this.plan = _.find(_.castArray(plans), p => p.id == this.planId);
        }
        else {
            this.plan = null;
        }
    }

    asJSON(...fields) {
        let json = loader.asJSON(fields, FIELDS, this);
        json['vins'] = _.map((this.vins || []), o => o.asJSON());
        return json
    }

    toJSON(...fields) {
        return loader.toJSON('subscriptions', fields, FIELDS, this);
    }
}

function load(json) {
    return loader.load(json, Subscription);
}

module.exports.load = load;
module.exports.FIELDS = FIELDS;
