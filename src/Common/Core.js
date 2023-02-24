const _ = require('lodash');

module.exports.toInteger = (id) => {
    id = id ? parseInt(id) : NaN
    if (id == NaN) {
        id = -1
    }
    if (id < 0) {
        id = null
    }
    return id
}

module.exports.formToJson = (id) => {
    let form = document.getElementById(id);
    let json = {};
    for (let o of (new FormData(form))) {
        json[o[0]] = o[1]
    }
    return json;
}

const WhiteSpace = new RegExp(/^\s$/i);
module.exports.limitTo = (text, maxLen, overflow = '&#8230') => {
    if (text.length <= maxLen) {
        return text;
    }
    else {
        let a = [...text];
        let i = maxLen;
        for (; i >= 0 && !WhiteSpace.test(a[i]); i--);
        return text.slice(0, i <= 0 ? maxLen : i) + overflow;
    }
}

module.exports.joinBy = (values, between = ',', final = 'and') => {
    if (!Array.isArray(values)) {
        values = [values]
    }
    if (values.length <= 0) {
        return ''
    }
    else if (values.length <= 1) {
        return values[0]
    }
    else if (values.length <= 2) {
        return values.join(` ${final} `)
    }
    return values.slice(0, -1).join(`${between} `) + `${between} ${final} ` + values.slice(-1);
}

module.exports.paramsFromQuery = (query) => {
    if (!query || query.length <= 1) {
        return {};
    }

    if (query.startsWith('?')) {
        query = query.slice(1);
    }

    return _.fromPairs(query.split('&').map(s => {
        const a = s.split('=');
        return (a.length <=1
            ? [a[0], true]
            : a);
    }));
}
