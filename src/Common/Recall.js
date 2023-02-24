const crypto = require('crypto-js')
const moment = require('moment');
const _ = require('lodash');

const constants = require('./Constants');
const loader = require('./loader');

const REGEX_WHITESPACE = /\t|\n|\r/gi;

const FIELDS = [
    'id',
    'feedName',
    'feedSource',
    'title',
    'description',
    'link',
    'publicationDate',
    'state',
    'affected',
    'allergens',
    'audience',
    'categories',
    'contaminants',
    'distribution',
    'risk'
];

class Recall {
    constructor(recall) {
        recall = recall ? recall : {};

        this._id = recall.id || recall._id || null;

        this.feedName = recall.feedName || recall.feed_name || recall.name || recall.fn;
        this.feedSource = recall.feedSource || recall.feed_source || recall.source || recall.fs;
        this.title = (recall.title || recall.t || '').replace(REGEX_WHITESPACE, ' ');
        this.description = (recall.description || recall.d || '').replace(REGEX_WHITESPACE, ' ');
        this.link = recall.link || recall.l || '';

        let publicationDate = recall.publicationDate || recall.publication_date || recall.pubdate || recall.pd;
        this.publicationDate = (publicationDate
            ? moment(publicationDate).utc()
            : moment.utc());

        this.state = recall.state || recall.st || 'unreviewed';
        this.affected = recall.affected || recall.af || [];
        this.allergens = recall.allergens || recall.al || [];
        this.audience = recall.audience || recall.au || [];
        this.categories = recall.categories || recall.ct || [];
        this.contaminants = recall.contaminants || recall.co || [];
        this.distribution = recall.distribution || recall.db || [];
        this.risk = recall.risk || recall.ri || '';

        this.token = recall.token || null;
    }

    asJSON(...fields) {
        return loader.asJSON(fields, FIELDS, this);
    }

    toJSON(...fields) {
        return loader.toJSON('recalls', fields, FIELDS, this);
    }

    ownsToken(token) {
        return (this.token == token);
    }

    get actsAsContaminable() {
        return _.intersection(this.categories || [], constants.ACTS_AS_CONTAMINABLE_CATEGORIES).length > 0;
    }

    get canHaveAllergens() {
        return _.intersection(this.categories || [], constants.CAN_HAVE_ALLERGENS_CATEGORIES).length > 0;
    }

    get isHighRisk() {
        return this.risk == 'probable';
    }

    get needsReview() {
        return this.state == 'unreviewed';
    }

    get needsSending() {
        return this.state == 'reviewed';
    }

    get wasSent() {
        return this.state == 'sent';
    }

    get isValid() {
        return this.title.length > 0 && this.link.length > 0;
    }

    get id() {
        return this._id || this.canonicalId;
    }

    get canonicalId() {
        return linkToId(this.link);
    }

    get canonicalName() {
        return `${this.publicationDate.format('YYYY-MM-DDTHH-mm-ss[Z]')}-${this.feedName}-${this.canonicalId}`;
    }

    get preferredCategory() {
        return constants.getCategoryPreferred(this.categories);
    }

    get shareLink() {
        const BASE_URL = process.env.REACT_APP_URL || process.env.URL;
        return `${BASE_URL}recall/${this.token}`;
    }

    get type() {
        return 'Recall';
    }

    ensureRisk() {
        if (!this.risk || this.risk.length <= 0) {
            if (this.canHaveAllergens) {
                this.risk = 'possible'
            }
            else if (this.actsAsContaminable && this.contaminants.length > 0) {
                this.risk = 'possible'
            }
            else {
                this.risk = 'none'
            }
        }
    }

    compare(that) {
        // moments support direct inequality comparisons, but not equality.
        // However, two moments are the same if their difference is zero
        if (this.publicationDate.diff(that.publicationDate) != 0) {
            return this.publicationDate < that.publicationDate ? -1 : 1;
        }
        else if (this.canonicalId !== that.canonicalId) {
            let u1 = this.canonicalId;
            let u2 = that.canonicalId;
            return u1 < u2 ? -1 : 1;
        }
        else {
            return 0;
        }
    }
}

function linkToId(link) {
    return crypto.SHA256(link).toString();
}

function create(recall = {}) {
    return loader.loadSingle(recall, Recall)
}

function load(json) {
    return loader.load(json, Recall);
}

module.exports.linkToId = linkToId;
module.exports.create = create;
module.exports.load = load;
module.exports.Recall = Recall;
