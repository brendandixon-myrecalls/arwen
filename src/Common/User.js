const moment = require('moment');
const loader = require('./loader');
const _ = require('lodash');

const c = require('./Constants');
const pl = require('./Plan');
const pr = require('./Preference');
const sb = require('./Subscription');
const rc = require('./Recall');
const vr = require('./VehicleRecall');

const FIELDS = [
    'id',
    'firstName',
    'lastName',
    'email',
    'phone',
    'role',
]

const FIELDS_WITH_PASSWORD =[
    ...FIELDS,
    'password'
]

class User {
    constructor(user) {
        user = user ? user : {};

        this.id = user.id || user._id || null;

        this.firstName = user.firstName || user.first_name || user.fn || null;
        this.lastName = user.lastName || user.last_name || user.ln || null;
        this.email = user.email || user.em || null;
        this.phone = user.phone || user.ph || null;
        this.role = user.role || user.ro || null;

        // Note:
        // - Email and Phone confirmation fields are inbound only
        this.emailConfirmed = user.emailConfirmed || false;
        this.emailSuspended = user.emailSuspended || false;
        this.phoneConfirmed = user.phoneConfirmed || false;

        // Note:
        // - The password may be set through code, but not loaded
        this.password = null;

        this.preference = pr.load(user.preference);

        this.registered = user.registered || false;

        let subscriptions = (_.isArray(user.subscriptions)
            ? user.subscriptions
            : []);
        this.subscriptions = _.map(subscriptions, o => sb.load(o));
    }

    get fullName() {
        if (_.isEmpty(this.lastName)) {
            return this.firstName;
        }
        if (_.isEmpty(this.firstName)) {
            return this.lastName;
        }
        return `${this.firstName} ${this.lastName}`;
    }

    get countVins() {
        let countVins = 0;
        (this.subscriptions || []).forEach(s => {
            if (s.isActive && s.countVins > 0) {
                countVins += s.countVins;
            }
        });
        return countVins;
    }

    get hasValidPreferences() {
        return (
            !_.isEmpty(this.preference) &&
            (!this.hasRecallSubscription || this.preference.isValidForRecalls) &&
            (!this.hasVehicleSubscription || this.preference.isValidForVehicles)
        );
    }

    get isActive() {
        return (_.isArray(this.subscriptions) && (this.subscriptions.find(s => s.isActive) != null));
    }

    get isInactive() {
        return !this.isActive;
    }

    get isRegistered() {
        return this.registered;
    }

    get neverExpires() {
        return (_.isArray(this.subscriptions) && (this.subscriptions.find(s => s.neverExpires) != null));
    }

    get activeSubscriptions() {
        if (_.isEmpty(this.subscriptions) || !_.isArray(this.subscriptions)) {
            return [];
        }
        return _.filter(this.subscriptions, s => s.isActive);
    }

    get hasSubscription() {
        return !_.isEmpty(this.subscriptions);
    }

    get hasRecallSubscription() {
        if (this.actsAsWorker) {
            return true;
        }
        return (
            _.isArray(this.subscriptions) &&
            (this.subscriptions.find(s => s.isActive && s.recalls) != null)
        );
    }

    get hasVehicleSubscription() {
        return this.countVins > 0;
    }

    actsAsRole(role) {
        switch (role) {
            case 'member':
                return this.isMember || this.isAdmin || this.isWorker;
            case 'worker':
                return this.isAdmin || this.isWorker;
            case 'admin':
                return this.isAdmin;
            default:
                return false;
        }
    }

    get actsAsAdmin() {
        return this.actsAsRole('admin');
    }

    get actsAsMember() {
        return this.actsAsRole('member');
    }

    get actsAsWorker() {
        return this.actsAsRole('worker');
    }

    get isAdmin() {
        return this.role == 'admin';
    }

    get isMember() {
        return this.role == 'member';
    }

    get isWorker() {
        return this.role == 'worker';
    }

    get isGuest() {
        return this.email == 'guest@nomail.com';
    }

    get shouldTrack() {
        return this.isMember && !this.isGuest;
    }

    vinsForVkeys(vkeys) {
        if (!_.isArray(this.subscriptions) || this.subscriptions.length <= 0) {
            return [];
        }
        return _.compact(
            _.flatten(
                _.map(this.subscriptions,
                    s => _.map(s.vins, (v => vkeys.includes(v.vkey) ? v : null)))
            )
        );
    }

    asJSON(...fields) {
        const knownFields = (fields.length > 0 && fields.includes('password')
            ? FIELDS_WITH_PASSWORD
            : FIELDS);

        let json = loader.asJSON(fields, knownFields, this);

        json['preference'] = this.preference.asJSON();
        json['subscriptions'] = _.map(this.subscriptions, o => o.asJSON());

        return json;
    }

    toJSON(...fields) {
        const knownFields = (fields.length > 0 && fields.includes('password')
            ? FIELDS_WITH_PASSWORD
            : FIELDS);

        return loader.toJSON('users', fields, knownFields, this);
    }

    compare(that) {
        if (this.email !== that.email) {
            let u1 = this.email;
            let u2 = that.email;
            return u1 < u2 ? -1 : 1;
        }
        else {
            return 0;
        }
    }
}

function create(user = {}) {
    return loader.loadSingle(user, User);
}

function load(json, related) {
    let u = loader.load(json, User);

    if (related) {
        const coupon = _.filter(related, r => r.type == 'coupons')[0];
        const plans = pl.load(_.filter(related, r => r.type == 'plans'), coupon);

        u.subscriptions.forEach(s => s.injectPlan(plans));
    }

    return u;
}

module.exports.create = create;
module.exports.load = load;
module.exports.Guest = new User({ firstName: 'Guest', email: 'guest@nomail.com' });
module.exports.FIELDS = FIELDS;
module.exports.FIELDS_WITH_PASSWORD = FIELDS_WITH_PASSWORD;
