const _ = require('lodash');

function load(json, component) {
    json = json || {};

    if (json.constructor === ArrayBuffer || json.constructor === String) {
        json = JSON.parse(json)
    }

    if (json.constructor == Array) {
        return json.map(data => loadSingle(data, component));
    }
    else {
        return loadSingle(json, component);
    }
}

function loadSingle(json, component) {
    let attributes = json;
    if (json['attributes']) {
        attributes = json['attributes'];
        attributes.id = json['id'];
    }
    return new component(attributes)
}

function asJSON(fields, knownFields, o) {
    if (fields.length <= 0) {
        fields = knownFields;
    }

    return _.pick(o, _.intersection(fields, knownFields));
}

function toJSON(name, fields, knownFields, o) {
    if (fields.length <= 0) {
        fields = knownFields;
    }

    let data = o.asJSON(...fields);
    let json = {
        data: {
            type: name,
            attributes: _.pickBy(data, (v, k) => k != 'id'),
        }
    };

    if (data['id']) {
        json['id'] = data['id'];
    }

    return json;
}

module.exports.load = load;
module.exports.loadSingle = loadSingle;
module.exports.asJSON = asJSON;
module.exports.toJSON = toJSON;
