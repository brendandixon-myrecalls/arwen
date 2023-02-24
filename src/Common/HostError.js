const cr = require('./Core');
const _ = require('lodash');

class HostError extends Error {
    constructor(error, method, url) {
        super(error);

        this.error = error;
        this.method = method;
        this.response = error.response;
        this.url = url;

        this._messages = [];
        if (this.response && this.response.data && this.response.data.errors) {
            this._messages = this.response.data.errors.map((e) => _.upperFirst(e.detail || e.title || ''));
        }

        if (this.isApplicationError || this.isServerError) {
            console.log(this.toString());
        }
    }

    get messages() { return this._messages.length > 0 ? this._messages : [this.error.message || 'Unknown HostError'] }

    get isFatal() { return this.isApplicationError || this.isServerError }

    get isApplicationError() { return !this.response; }
    get isBadRequest() { return this.isStatusCode(400); }
    get isConflict() { return this.isStatusCode(409); }
    get isForbidden() { return this.isStatusCode(403); }
    get isNotFound() { return this.isStatusCode(404); }
    get isSeeOther() { return this.isStatusCode(303); }
    get isServerError() { return this.response && this.response.status >= 500; }
    get isUnauthorized() { return this.isStatusCode(401); }

    isStatusCode(code) {
        return this.response && this.response.status == code;
    }

    toString() {
        return cr.joinBy(this.messages);
    }
}

module.exports.HostError = HostError;
module.exports.IsHostError = (e) => (e && e.constructor == HostError);
