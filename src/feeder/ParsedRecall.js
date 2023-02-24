const moment = require('moment-timezone');
const path = require('path');
const _ = require('lodash');

const constants = require('../Common/Constants');
const recall = require('../Common/Recall');

const CAPTITAL_NAMES = [
    'BMW',
];
const REGEX_DESCRIPTION = /^.*Dated\:\s+(\w+\s+\d+,\s+\d+)\s(.*)$/;
const REGEX_TITLE = /^([^\(]+)\s+\(.*\)\s*$/;
const REGEX_NAMES = new RegExp(`(${CAPTITAL_NAMES.join('|')})`, 'ig');

class ParsedRecall extends recall.Recall {
    constructor(recall) {
        super(recall)
    }

    combine(recalls) {
        if (!recalls || recalls.length < 1) {
            return this;
        }

        let titles = [this.title];
        (recalls || []).forEach(recall => titles.push(recall.title));
        if (titles.length === 2) {
            this.title = titles.join(' and ');
        }
        else {
            this.title = titles.slice(0, -1).join(', ') + ', and ' + titles.slice(-1);
        }
        return this;
    }
}

class CPSCRecall extends ParsedRecall {
    constructor(recall) {
        super(recall);

        // Inject timezone into the provided date
        // - The feed parser assumes UTC. Inject by extracting date and re-parsing in the correct timezone
        this.publicationDate = moment.tz(this.publicationDate.format('MMM DD, YYYY'), 'MMM DD, YYYY', constants.EASTERN_TIMEZONE).utc();

        // If the title is missing, create a title from the URL
        if (!this.title && this.link) {
            this.title = path.basename(this.link).split('-').map(s => _.capitalize(s)).join(' ');
        }
    }
}

class FDARecall extends ParsedRecall {
    constructor(recall) {
        super(recall);

        // Rewrite the HTTP link to use HTTPS
        if ((this.link || '').startsWith('http:')) {
            this.link = `https${this.link.slice('http'.length)}`
        }
    }
}

class NHTSARecall extends ParsedRecall {
    constructor(recall) {
        super(recall);

        this.reportId = null;

        // If the description leads with a date,
        // move it from the description to the publication date
        let m = this.description.match(REGEX_DESCRIPTION);
        if (m) {
            this.description = m[2].trim();
            this.publicationDate = moment.tz(m[1], 'MMM DD, YYYY', constants.EASTERN_TIMEZONE).utc();
        }

        // If the title contains an embedded case identifier (e.g., ), remove it
        m = this.title.match(REGEX_TITLE);
        if (m) {
            this.title = m[1].trim().toLowerCase().split(' ').map(s => _.capitalize(s)).join(' ');
            this.reportId = m[2];
        }

        // Ensure correct name capitalization
        this.title = this.title.replace(REGEX_NAMES, (m, s) => s.toUpperCase());

        // Assume Nationwide distribution
        if ((this.distribution || []).length <= 0) {
            this.distribution = constants.STATES.map(option => option.value).sort()
        }

        // Assume carseats impact children with a possible health risk
        if ((this.categories || []).includes('carseats')) {
            if ((this.affected || []).length <= 0) {
                this.affected = ["children"]
            }
            if (!constants.RISK_VALUES.includes(this.risk)) {
                this.risk = "possible"
            }
        }

        // Otherwise, for tires and vehicles, assume no health risk
        else if (!constants.RISK_VALUES.includes(this.risk)) {
            this.risk = "none"
        }

        // Lastly, assume all NHTSA recalls have been reviewed and affect consumers
        this.state = 'reviewed';
        this.audience = ["consumers"];
    }
}

function create(name, source, categories, recall) {
    recall.feedName = name
    recall.feedSource = source
    recall.categories = categories

    switch (recall.feedSource) {
        case 'cpsc': return new CPSCRecall(recall);
        case 'fda': return new FDARecall(recall);
        case 'nhtsa': return new NHTSARecall(recall);
    }

    return new ParsedRecall(recall);
}

module.exports.create = create;
module.exports.linkToId = recall.linkToId;
