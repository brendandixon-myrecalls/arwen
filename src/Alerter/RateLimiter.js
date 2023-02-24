const moment = require('moment');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

class RateLimiter {

    constructor(unitsPerSecond) {
        this._totalUnitsEmitted = 0;
        this._unitsPerSecond = unitsPerSecond;
        this._start = moment();
    }

    waitIfNeeded(unitsToEmit = 1) {
        this._totalUnitsEmitted += unitsToEmit;

        const unitPage = Math.ceil(this._totalUnitsEmitted / this._unitsPerSecond);
        const timePage = Math.ceil(moment.duration(moment().diff(this._start)).asSeconds());

        let p = Promise.resolve();
        if (unitPage > timePage) {
            p = p.then(() => {
                const delta = (unitPage - timePage) * 1000;
                return setTimeoutPromise(delta);
            });
        }

        return p;
    }
}

function create(unitsPerSecond) {
    return new RateLimiter(unitsPerSecond);
}

module.exports.create = create;
