const u = require('./User');

const MillisecondsInHour = 1000 * 60 * 60;

class Credentials {
    constructor(credentials = {}) {
        this._setCredentials(credentials);
    }

    get email() {
        return this._email;
    }

    get firstName() {
        return this._firstName;
    }

    get lastName() {
        return this._lastName;
    }

    get role() {
        return this._role;
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
        return this._role == 'admin';
    }

    get isMember() {
        return this._role == 'member';
    }

    get isWorker() {
        return this._role == 'worker';
    }

    get expiresAt() {
        return this._jwtExpiresAt || (new Date());
    }

    get isAuthenticated() {
        return this.hasToken && !!this._jwtValidated;
    }

    get hasEmail() {
        return this._email && this._email.length > 0;
    }

    get hasToken() {
        return this._tokenAppearsValid() && !this._tokenIsExpired();
    }

    get token() {
        return this._jwtToken;
    }

    set tokenValidated(fValidated = true) {
        this._jwtValidated = fValidated;
    }

    get userId() {
        return this._userId;
    }

    clear() {
        this.setEmail();
        this.setToken();
        this.setUser();
    }

    set(credentials={}) {
        this._setCredentials(credentials);
    }

    setEmail(credentials = {}) {
        this._email = credentials.email || null;
    }

    clearToken() {
        this.setToken();
    }

    setToken(credentials = {}) {
        this._jwtToken = credentials.jwtToken || null;
        this._jwtExpiresAt = (credentials.jwtExpiresAt
            ? new Date(credentials.jwtExpiresAt.toString())
            : null);
        this._jwtValidated = credentials.jwtValidated || false;
    }

    setUser(credentials = {}) {
        this._userId = credentials.userId || null;
        this._firstName = credentials.firstName || null;
        this._lastName = credentials.lastName || null;
        this._role = credentials.role || null;
    }

    toJSON() {
        return {
            jwtToken: this._jwtToken,
            jwtExpiresAt: this._jwtExpiresAt,
            userId: this.userId,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
        }
    }

    toString() {
        return this._email;
    }

    _setCredentials(credentials = {}) {
        this.setEmail(credentials);
        this.setToken(credentials);
        this.setUser(credentials);
    }

    _tokenAppearsValid() {
        return (!!this._jwtToken && this._jwtToken.length > 0);
    }

    _tokenExpiresSoon() {
        let d = new Date();
        d.setTime(d.getTime() + MillisecondsInHour);
        if (!this._jwtExpiresAt || this._jwtExpiresAt < d) {
            return true;
        }
        return false;
    }

    _tokenIsExpired() {
        return !this._jwtExpiresAt || this._jwtExpiresAt < (new Date());
    }
}

module.exports.Credentials = Credentials

let GuestCredentials = new Credentials();
GuestCredentials.setUser(u.Guest);
module.exports.GuestCredentials = GuestCredentials;
