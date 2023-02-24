const moment = require('moment');
const _ = require('lodash');

// Note:
// - Force dates to align with Recall Host values
module.exports.DISTANT_PAST = moment('0000-01-01T00:00:00Z').add(2, 'weeks');
module.exports.FAR_FUTURE = moment('9999-12-31T00:00:00Z').subtract(2, 'weeks');
module.exports.GRACE_PERIOD = moment.duration(2, 'weeks');

module.exports.EASTERN_TIMEZONE = 'America/New_York';

allLabelsOf = (set) => set.map(o => o.label);
module.exports.allLabelsOf = allLabelsOf;

allValuesOf = (set) => set.map(o => o.value);
module.exports.allValuesOf = allValuesOf;

module.exports.labelFor = (v, set) => {
    return (set.find(s => s.value == v) || {}).label;
};

function reduceByLabel(...arrays) {
    const all = _.concat(...arrays)
        .sort((a, b) => {
            return (a.label > b.label
                ? 1
                : a.label < b.label
                    ? -1
                    : 0);
        });
    return _.sortedUniqBy(all, o => o.label);
}

module.exports.JWT_COOKIE = 'jwtCookie';

module.exports.AFFECTED = [
    { label: 'Children', value: 'children' },
    { label: 'Seniors', value: 'seniors' },
]

module.exports.AUDIENCE = [
    { label: 'Consumers', value: 'consumers' },
    { label: 'Professionals', value: 'professionals' }
]
module.exports.DEFAULT_AUDIENCE = ['consumers']

// See https://www.foodsafety.gov/poisoning/causes/allergens/index.html
module.exports.FOOD_ALLERGENS = [
    { label: 'Dairy', value: 'dairy' },
    { label: 'Eggs', value: 'eggs' },
    { label: 'Fish', value: 'fish' },
    { label: 'Shellfish', value: 'shellfish' },
    { label: 'Nuts', value: 'nuts' },
    { label: 'Soy', value: 'soy' },
    { label: 'Sulfites', value: 'sulfites' },
    { label: 'Wheat', value: 'wheat' },
]

// See https://www.fda.gov/food/resourcesforyou/consumers/ucm103263.htm
FOOD_CONTAMINANTS = [
    { label: 'E.coli', fullName: 'E.coli (Escherichia coli)', value: 'e.coli' },
    { label: 'Foreign Material', value: 'foreign' },
    { label: 'Lead', value: 'lead' },
    { label: 'Listeria', fullName: 'Listeria (Monocytogenes)', value: 'listeria' },
    { label: 'Salmonella', value: 'salmonella' },
    { label: 'Other', value: 'other' },
]
module.exports.FOOD_CONTAMINANTS = FOOD_CONTAMINANTS

PRODUCT_CONTAMINANTS = [
    { label: 'Foreign Material', value: 'foreign' },
    { label: 'Lead', value: 'lead' },
    { label: 'Other', value: 'other' },
]
module.exports.PRODUCT_CONTAMINANTS = PRODUCT_CONTAMINANTS

module.exports.ALL_CONTAMINANTS = reduceByLabel(FOOD_CONTAMINANTS, PRODUCT_CONTAMINANTS)

module.exports.CAN_HAVE_ALLERGENS_CATEGORIES = ['animals', 'drugs', 'food', 'personal']
module.exports.ACTS_AS_CONTAMINABLE_CATEGORIES = [
    'animals',
    'drugs',
    'food',
    'home',
    'medical',
    'personal',
    'toys'
]

const CATEGORIES = [
/* 0  */ { label: 'Animals', value: 'animals', icon: 'fal fa-dog', group: 'food' },
/* 1  */ { label: 'Commercial Products', value: 'commercial', icon: 'fal fa-industry-alt', group: 'other' },
/* 2  */ { label: 'Drugs and Supplements', value: 'drugs', icon: 'fal fa-pills', group: 'medical' },
/* 3  */ { label: 'Electronics', value: 'electronics', icon: 'fal fa-battery-bolt', group: 'other' },
/* 4  */ { label: 'Food', value: 'food', icon: 'fal fa-bread-loaf', group: 'food' },
/* 5  */ { label: 'Home Products', value: 'home', icon: 'fal fa-home-alt', group: 'home' },
/* 6  */ { label: 'Medical (Not Drugs)', value: 'medical', icon: 'fal fa-hospital', group: 'medical' },
/* 7  */ { label: 'Outdoor Products', value: 'outdoor', icon: 'fal fa-tractor', group: 'other' },
/* 8  */ { label: 'Personal Products', value: 'personal', icon: 'fal fa-restroom', group: 'home' },
/* 9  */ { label: 'Tires', value: 'tires', icon: 'fal fa-tire-flat', group: 'vehicles' },
/* 10 */ { label: 'Toys', value: 'toys', icon: 'fal fa-baseball', group: 'home' },
/* 11 */ { label: 'Vehicles', value: 'vehicles', icon: 'fal fa-cars', group: 'vehicles' },
]

CPSC_CATEGORIES = [0, 1, 2, 3, 5, 7, 8, 10].map(i => CATEGORIES[i])
FDA_CATEGORIES = [0, 2, 4, 6, 8].map(i => CATEGORIES[i])
MEDWATCH_CATEGORIES = [2, 6, 8].map(i => CATEGORIES[i])
NHTSA_CATEGORIES = [5].map(i => CATEGORIES[i])
NHTSA_VEHICLE_CATEGORIES = [9, 11].map(i => CATEGORIES[i])
USDA_CATEGORIES = [4].map(i => CATEGORIES[i])

CATEGORY_BUNDLES = [
    {
        label: 'Food',
        value: ['animals', 'food'],
        description: 'All food items'
    },
    {
        label: 'Home',
        value: ['electronics', 'home', 'outdoor', 'personal', 'toys'],
        description: 'Home, outdoor, and personal products, electronics, and toys' },
    {
        label: 'Medical',
        value: ['drugs', 'medical'],
        description: 'Drugs, medical devices, and supplements'
    },
    {
        label: 'Commercial / Industrial',
        value: ['commercial'],
        description: 'Commerical and Industrial products',
    }
]
module.exports.CATEGORY_BUNDLES = CATEGORY_BUNDLES;

module.exports.DEFAULT_CATEGORIES = _.union(
    CATEGORY_BUNDLES[0].value,
    CATEGORY_BUNDLES[1].value
)

module.exports.getCategoryGroup = (category) => {
    if (['animals', 'food'].includes(category)) {
        return 'food';
    }

    if (['home', 'outdoor', 'personal', 'toys'].includes(category)) {
        return 'home';
    }

    if (['drugs', 'medical'].includes(category)) {
        return 'medical';
    }

    if (['vehicles'].includes(category)) {
        return 'vehicles';
    }

    return 'other';
}
module.exports.getCategoryIcon = (category) => {
    const c = CATEGORIES.find(c => c.value === category);
    return (c
        ? c.icon
        : 'fal fa-question-square');
}
module.exports.getCategoryPalette = (categoryGroup) => {
    switch (categoryGroup) {
        // Green (most common category)
        case 'food': return {
            light: '#E8FAF6',
            main: '#17AF9B',
            text: '#FFFFFF',
        }

        // Orange
        case 'home': return {
            light: '#FFE9D3',
            main: '#FFA847',
            text: '#FFFFFF',
        }

        // Blue (primary)
        case 'medical': return {
            light: '#EAF0FF',
            main: '#729BFF',
            text: '#FFFFFF',
        }

        // Dark Blue
        case 'vehicles': return {
            light: '#729BFF',
            main: '#1D2948',
            text: '#FFFFFF',
            // light: '#FAD9D2',
            // main: '#ED684A',
            // text: '#FFFFFF',
        }

        // Purple
        default: return {
            light: '#F4E1F8',
            main: '#C57ED4',
            text: '#FFFFFF',
        }
    }
}
module.exports.getCategoryPreferred = (categories) => {
    if (_.isEmpty(categories)) {
        return '';
    }
    if (categories.length == 1) {
        return categories[0];
    }

    if (categories.includes('animals')) {
        return 'animals';
    }
    if (categories.includes('food')) {
        return 'food';
    }
    if (categories.includes('drugs')) {
        return 'drugs';
    }
    if (categories.includes('electronics')) {
        return 'electronics';
    }
    if (categories.includes('home')) {
        return 'home';
    }

    if (categories.includes('toys')) {
        return 'toys';
    }
    if (categories.includes('outdoor')) {
        return 'outdoor';
    }
    if (categories.includes('personal')) {
        return 'personal';
    }
    if (categories.includes('medical')) {
        return 'medical';
    }
    if (categories.includes('commercial')) {
        return 'commercial';
    }

    if (categories.includes('vehicles')) {
        return 'vehicles';
    }
    if (categories.includes('tires')) {
        return 'tires';
    }

    return categories[0];
}

module.exports.NORMAL_CATEGORIES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10].map(i => CATEGORIES[i]);

module.exports.VEHICLE_CATEGORIES = NHTSA_VEHICLE_CATEGORIES;
module.exports.VEHICLE_CATEGORY_VALUES = allValuesOf(NHTSA_VEHICLE_CATEGORIES);

const SOURCE_CATEGORIES = {
    'cpsc': CPSC_CATEGORIES,
    'fda': FDA_CATEGORIES,
    'medwatch': MEDWATCH_CATEGORIES,
    'usda': USDA_CATEGORIES,
    'nhtsa': NHTSA_CATEGORIES,
}

const NAMES = [
    'carseats',
    'cpsc',
    'fda',
    'medwatch',
    'tires',
    'usda',
    'vehicles'
]
module.exports.NAMES = NAMES;

const NONPUBLIC_NAMES = [
    'medwatch',
    'tires',
    'vehicles'
]

PUBLIC_NAMES = _.filter(NAMES, n => !NONPUBLIC_NAMES.includes(n))
module.exports.PUBLIC_NAMES = PUBLIC_NAMES;
module.exports.NONPUBLIC_NAMES = NONPUBLIC_NAMES;
module.exports.isPublicName = (name) => {
    return PUBLIC_NAMES.includes(name);
}

PUBLIC_NAMES = NAMES - NONPUBLIC_NAMES

const SOURCES = 
[
    { label: 'CPSC', value: 'cpsc' },
    { label: 'FDA', value: 'fda' },
    { label: 'MedWatch', value: 'medwatch' },
    { label: 'USDA', value: 'usda' },
    { label: 'NHTSA', value: 'nhtsa' },
]
module.exports.SOURCES = SOURCES;

PUBLIC_SOURCES = _.filter(SOURCES, s => s.value != 'medwatch')
module.exports.PUBLIC_SOURCES = PUBLIC_SOURCES;
module.exports.isPublicSource = (source) => {
    return !_.isEmpty(_.find(PUBLIC_SOURCES, (s) => s.value == source));
}

module.exports.getSourceCategories = (source) => {
    return SOURCE_CATEGORIES[source]
}
module.exports.getSourceLabel = (source) => {
    switch (source) {
        case 'cpsc': return 'CPSC';
        case 'fda': return 'FDA';
        case 'medwatch': return 'FDA';
        case 'usda': return 'USDA';
        case 'nhtsa': return 'NHTSA';
        default: return source;
    }
}

RISK = [
    { label: 'Probable', value: 'probable' },
    { label: 'Possible', value: 'possible' },
    { label: 'Minimal', value: 'none' }
]
module.exports.RISK = RISK
module.exports.RISK_VALUES = RISK.map(r => r.value)
module.exports.DEFAULT_RISK = ['probable', 'possible']


module.exports.COASTS = [
    { label: 'East Coast', value: ['ME', 'VT', 'NH', 'MA', 'RI', 'CT', 'NJ', 'DE', 'DC', 'VA', 'NC', 'SC', 'GA', 'FL', 'NY', 'PA'] },
    { label: 'West Coast', value: ['WA', 'OR', 'CA'] },
]

const REGIONS = [
    { label: 'West', value: ['WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AK', 'HI'] },
    { label: 'Midwest', value: ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'IN', 'OH', 'MI'] },
    { label: 'Southwest', value: ['AZ', 'NM', 'TX', 'OK'] },
    { label: 'Northeast', value: ['NY', 'PA', 'MD', 'VT', 'ME', 'NH', 'MA', 'RI', 'CT', 'NJ', 'DE', 'DC'] },
    { label: 'Southeast', value: ['AR', 'LA', 'MS', 'AL', 'GA', 'FL', 'TN', 'KY', 'WV', 'VA', 'NC', 'SC'] },
]
module.exports.REGIONS = REGIONS;

module.exports.mapStatesToRegions = (states) => {
    const regions = REGIONS.map((region) => _.isEmpty(_.intersection(region.value, states)) ? null : region.label);
    return _.compact(_.uniq(regions));
}
module.exports.mapRegionsToStates = (regions) => {
    const states = regions.map(region => REGIONS.find(r => r.label == region));
    return _.compact(_.uniq(states));
}

const STATES = [
    { label: 'Alabama (AL)', value: 'AL' },
    { label: 'Alaska (AK)', value: 'AK' },
    { label: 'Arizona (AZ)', value: 'AZ' },
    { label: 'Arkansas (AR)', value: 'AR' },
    { label: 'California (CA)', value: 'CA' },
    { label: 'Colorado (CO)', value: 'CO' },
    { label: 'Connecticut (CT)', value: 'CT' },
    { label: 'Delware (DE)', value: 'DE' },
    { label: 'District of Columbia (DC)', value: 'DC' },
    { label: 'Florida (FL)', value: 'FL' },
    { label: 'Georgia (GA)', value: 'GA' },
    { label: 'Hawaii (HI)', value: 'HI' },
    { label: 'Idaho (ID)', value: 'ID' },
    { label: 'Illinois (IL)', value: 'IL' },
    { label: 'Indiana (IN)', value: 'IN' },
    { label: 'Iowa (IA)', value: 'IA' },
    { label: 'Kansas (KS)', value: 'KS' },
    { label: 'Kentucky (KY)', value: 'KY' },
    { label: 'Lousiana (LA)', value: 'LA' },
    { label: 'Maine (ME)', value: 'ME' },
    { label: 'Maryland (MD)', value: 'MD' },
    { label: 'Massachusetts (MA)', value: 'MA' },
    { label: 'Michigan (MI)', value: 'MI' },
    { label: 'Minnesota (MN)', value: 'MN' },
    { label: 'Mississippi (MS)', value: 'MS' },
    { label: 'Missouri (MO)', value: 'MO' },
    { label: 'Montana (MT)', value: 'MT' },
    { label: 'Nebraska (NE)', value: 'NE' },
    { label: 'Nevada (NV)', value: 'NV' },
    { label: 'New Hampshire (NH)', value: 'NH' },
    { label: 'New Jersey (NJ)', value: 'NJ' },
    { label: 'New Mexico (NM)', value: 'NM' },
    { label: 'New York (NY)', value: 'NY' },
    { label: 'North Carolina (NC)', value: 'NC' },
    { label: 'North Dakota (ND)', value: 'ND' },
    { label: 'Ohio (OH)', value: 'OH' },
    { label: 'Oklahoma (OK)', value: 'OK' },
    { label: 'Oregon (OR)', value: 'OR' },
    { label: 'Pennsylvania (PA)', value: 'PA' },
    { label: 'Rhode Island (RI)', value: 'RI' },
    { label: 'South Carolina (SC)', value: 'SC' },
    { label: 'South Dakota (SD)', value: 'SD' },
    { label: 'Tennessee (TN)', value: 'TN' },
    { label: 'Texas (TX)', value: 'TX' },
    { label: 'Utah (UT)', value: 'UT' },
    { label: 'Vermont (VT)', value: 'VT' },
    { label: 'Virginia (VA)', value: 'VA' },
    { label: 'Washington (WA)', value: 'WA' },
    { label: 'West Virginia (WV)', value: 'WV' },
    { label: 'Wisconsin (WI)', value: 'WI' },
    { label: 'Wyoming (WY)', value: 'WY' },
]
module.exports.STATES = STATES;
module.exports.DEFAULT_DISTRIBUTION = STATES.map(s => s.value);

module.exports.TERRITORIES = [
    { label: 'Territories', value: 'TT' }
]
