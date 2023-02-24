const axios = require('axios');
const axiosRetry = require('axios-retry');
const _ = require('lodash');

const cr = require('./Credentials');
const ec = require('./EmailCoupon');
const he = require('./HostError');
const pl = require('./Plan');
const pr = require('./Preference');
const r = require('./Recall');
const rs = require('./RecallsSummary');
const sb = require('./Subscription');
const u = require('./User');
const vr = require('./VehicleRecall');
const vi = require('./Vin');
const vs = require('./VehicleRecallsSummary');

const paths = {
    Confirm: 'confirm',
    Coupons: 'email_coupons',
    Plans: 'plans',
    Refresh: 'refresh',
    Recalls: 'recalls',
    Reset: 'reset',
    SignIn: 'signin',
    SignOut: 'signout',
    Token: 'tokens',
    User: 'users/:userId:',
    Users: 'users',
    UserPreference: 'users/:userId:/preference',
    UserSubscriptions: 'users/:userId:/subscriptions',
    UserVins: 'users/:userId:/vins',
    Validate: 'validate',
    VehicleRecalls: 'vehicle_recalls',
    Vins: 'vins',
}

class Host {
    constructor(apiUrl, keepAlive = false) {
        this._apiUrl = apiUrl;
        if (!this._apiUrl.endsWith('/')) {
            this._apiUrl += '/';
        }

        this._cancelTokenSource = axios.CancelToken.source();
        this._credentials = null;
        this._keepAlive = keepAlive;

        axiosRetry(axios, {
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay
        });

        this.cancelAll = this.cancelAll.bind(this);
        this.evaluateError = this.evaluateError.bind(this);

        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.validateCredentials = this.validateCredentials.bind(this);

        this.searchPlans = this.searchPlans.bind(this);

        this.createCoupon = this.createCoupon.bind(this);
        this.destroyCoupon = this.destroyCoupon.bind(this);
        this.readCoupon = this.readCoupon.bind(this);
        this.searchCoupons = this.searchCoupons.bind(this);

        this.doesRecallExist = this.doesRecallExist.bind(this);
        this.markRecallSent = this.markRecallSent.bind(this);
        this.markRecallsSent = this.markRecallsSent.bind(this);
        this.readRecall = this.readRecall.bind(this);
        this.readRecallByToken = this.readRecallByToken.bind(this);
        this.saveRecall = this.saveRecall.bind(this);
        this.searchRecalls = this.searchRecalls.bind(this);
        this.summaryRecalls = this.summaryRecalls.bind(this);
        this.updateRecall = this.updateRecall.bind(this);

        this.createUser = this.createUser.bind(this);
        this.doesUserExist = this.doesUserExist.bind(this);
        this.searchUsers = this.searchUsers.bind(this);
        this.readUser = this.readUser.bind(this);
        this.resetUserConfirmation = this.resetUserConfirmation.bind(this);
        this.resetUserPassword = this.resetUserPassword.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updateUserConfirmation = this.updateUserConfirmation.bind(this);
        this.updateUserPassword = this.updateUserPassword.bind(this);
        this.updateUsersStatus = this.updateUsersStatus.bind(this);

        this.readUserPreference = this.readUserPreference.bind(this);
        this.updateUserPreference = this.updateUserPreference.bind(this);

        this.cancelUserSubscription = this.cancelUserSubscription.bind(this);
        this.createUserSubscription = this.createUserSubscription.bind(this);
        this.readUserSubscription = this.readUserSubscription.bind(this);
        this.readUserSubscriptions = this.readUserSubscriptions.bind(this);

        this.readUserVin = this.readUserVin.bind(this);
        this.readUserVins = this.readUserVins.bind(this);
        this.updateUserVin = this.updateUserVin.bind(this);

        this.doesVehicleRecallExist = this.doesVehicleRecallExist.bind(this);
        this.doesVehicleRecallCampaignExist = this.doesVehicleRecallCampaignExist.bind(this);
        this.markVehicleRecallSent = this.markVehicleRecallSent.bind(this);
        this.markVehicleRecallsSent = this.markVehicleRecallsSent.bind(this);
        this.readVehicleRecall = this.readVehicleRecall.bind(this);
        this.saveVehicleRecall = this.saveVehicleRecall.bind(this);
        this.searchVehicleRecalls = this.searchVehicleRecalls.bind(this);
        this.summaryVehicleRecalls = this.summaryVehicleRecalls.bind(this);
        this.updateVehicleRecall = this.updateVehicleRecall.bind(this);

        this.markVinReviewed = this.markVinReviewed.bind(this);
        this.searchVinsUnreviewed = this.searchVinsUnreviewed.bind(this);
    }

    get credentials() {
        return this._credentials;
    }

    set credentials(credentials={}) {
        this._credentials = credentials;
    }

    get name() {
        return 'Host';
    }

    cancelAll(message = null) {
        this._cancelTokenSource.cancel(message || 'Host operations canceled');
    }

    evaluateError(error, method, path) {
        if (axios.isCancel(error)) {
            console.log(`Host ${method} ${path} canceled`);
        }
        throw new he.HostError(error, method, path);
    }


    //----------------------------------------------------------------------------------------------------
    //
    // Authentication Methods
    //
    //----------------------------------------------------------------------------------------------------
    signIn(email, password = null) {
        if (!this._credentials) {
            this._credentials = new cr.Credentials();
        }
        this._credentials.setEmail({ email: email })

        const p = (this._credentials.hasToken
            ? this._validateAuthenticationToken()
            : Promise.reject());

        const url = this._makeUrl(paths.SignIn);

        return p.catch(() => {
            return axios(this._getAxiosOptions('post', url, {
                        data: {
                            email: this._credentials.email,
                            password: password
                        },
                        includeAuthorization: false,
                    }), { cancelToken: this._cancelTokenSource.token })
                .then(response => {
                    if (!response.data || !response.data['accessToken'] || !response.data['expiresAt']) {
                        throw new Error(`Host did not return an access token for ${this._credentials}`);
                    }

                    let jwtExpiresAt = new Date();
                    jwtExpiresAt.setTime(response.data.expiresAt * 1000);

                    this._credentials.set({
                        jwtToken: response.data.accessToken,
                        jwtExpiresAt: jwtExpiresAt,
                        jwtValidated: true,
                        userId: response.data.userId,
                        email: response.data.email,
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        role: response.data.role,
                    });

                    return true;
                })
                .catch(error => {
                    this.evaluateError(error, 'POST', url);
                });
        });
    }

    signOut(credentials = null) {
        if (credentials) {
            this._credentials = credentials;
        }

        if (!this._credentials) {
            return Promise.resolve();
        }

        if (!this._credentials.hasToken) {
            this._credentials.setToken();
            return Promise.resolve();
        }

        return axios(this._getAxiosOptions('delete', this._makeUrl(paths.SignOut)), { cancelToken: this._cancelTokenSource.token })
            // Note:
            // - Signout never fails to the caller
            // - Log the error and continue with clearing the token
            .catch((error) => {
                if (!axios.isCancel(error)) {
                    console.log(`ERROR: Host rejected sign-out - ${error}`);
                }
            })
            .then(() => {
                this._credentials.setToken();
                return true;
            });
    }

    validateCredentials(credentials = null) {
        if (credentials) {
            this._credentials = credentials;
        }
        return this._validateAuthenticationToken();
    }


    //----------------------------------------------------------------------------------------------------
    //
    // Coupon Methods
    //
    //----------------------------------------------------------------------------------------------------
    createCoupon(coupon) {
        return this._post(this._makeUrl(paths.Coupons), { data: { emailCoupon: coupon.toJSON() }, loader: ec.load });
    }

    destroyCoupon(id, params) {
        return this._delete(this._makeUrl(paths.Coupons, { id: id }), { params: params });
    }

    readCoupon(id, params) {
        return this._get(this._makeUrl(paths.Coupons, { id: id }), { params: params, loader: ec.load });
    }

    searchCoupons(params) {
        return this._get(this._makeUrl(paths.Coupons), { params: params, loader: ec.load });
    }

    //----------------------------------------------------------------------------------------------------
    //
    // Plan Methods
    //
    //----------------------------------------------------------------------------------------------------
    searchPlans(params) {
        return this._get(this._makeUrl(paths.Plans), { params: params, loader: pl.load });
    }


    //----------------------------------------------------------------------------------------------------
    //
    // Recall Methods
    //
    //----------------------------------------------------------------------------------------------------
    doesRecallExist(id) {
        return this._head(this._makeUrl(paths.Recalls, {id: id}));
    }

    markRecallSent(id) {
        return this._put(this._makeUrl(paths.Recalls, { id: id, path: 'sent' }));
    }

    markRecallsSent() {
        return this._put(this._makeUrl(paths.Recalls, { path: 'sent' }));
    }

    readRecall(id, params) {
        return this._get(this._makeUrl(paths.Recalls, { id: id }), { params: params, loader: r.load });
    }

    readRecallByToken(token) {
        return this._get(this._makeUrl(paths.Token, { path: token }),
            { includeAuthorization: this._credentials && this._credentials.isAuthenticated, loader: r.load, redirectsAllowed: 1 }
        );
    }

    // Note:
    // - This method is named the same as that used to write Recalls to the S3 bucket; it allows calling
    //   code to not worry about the target, but just invoke the method
    // - This method implements a "soft" save; that is, it creates the Recall if necessary and returns
    //   if successful and false if the Recall already exists (i.e., the host returns an HTTP 303)
    saveRecall(recall) {
        return this._post(this._makeUrl(paths.Recalls), { data: { recall: recall.toJSON() }, loader: r.load })
            .catch(error => {
                if (he.IsHostError(error) && error.isSeeOther) {
                    return false;
                }
                throw error;
            })
    }

    searchRecalls(params) {
        return this._get(this._makeUrl(paths.Recalls), { params: params, loader: r.load });
    }

    summaryRecalls(params) {
        return this._get(this._makeUrl(paths.Recalls, { path: 'summary' }), { params: params, loader: rs.load });
    }

    updateRecall(recall, ...fields) {
        return this._put(this._makeUrl(paths.Recalls, { id: recall.canonicalId }),
            { data: { recall: recall.toJSON(...fields) }, loader: r.load }
        );
    }


    //----------------------------------------------------------------------------------------------------
    //
    // User Methods
    //
    //----------------------------------------------------------------------------------------------------
    createUser(user, params) {
        return this._post(this._makeUrl(paths.Users),
            { data: _.assign(params || {}, { user: user.toJSON(...u.FIELDS_WITH_PASSWORD) }), loader: u.load }
        );
    }

    doesUserExist(userId) {
        return this._head(this._makeUrl(paths.User, { userId: userId }));
    }

    searchUsers(params) {
        return this._get(this._makeUrl(paths.Users), { params: params, loader: u.load});
    }

    readUser(params = null, userId = null) {
        return this._get(this._makeUrl(paths.User, { userId: userId }), { params: params, loader: u.load});
    }

    resetUserConfirmation(params = null, userId = null) {
        return this._get(this._makeUrl(paths.Confirm, { userId: userId }), { params: params });
    }

    resetUserPassword(email, params) {
        return this._get(this._makeUrl(paths.Reset), { params: _.assign(params || {}, { email: email }) });
    }

    updateUser(user, ...fields) {
        return this._put(this._makeUrl(paths.User, { userId: user.id }),
            { data: { user: user.toJSON(...fields) }, loader: u.load }
        );
    }

    updateUserConfirmation(token) {
        return this._post(this._makeUrl(paths.Confirm), { params: { token: token } });
    }

    updateUserPassword(email, password, token) {
        return this._post(this._makeUrl(paths.Reset), { params: { email: email, password: password, token: token } });
    }

    updateUsersStatus(params) {
        return this._put(this._makeUrl(paths.Users, { path: 'status'}), { data: params });
    }


    //----------------------------------------------------------------------------------------------------
    //
    // User Preference Methods
    //
    //----------------------------------------------------------------------------------------------------
    readUserPreference(userId = null) {
        return this._get(this._makeUrl(paths.UserPreference, {userId: userId}), { loader: pr.load });
    }

    updateUserPreference(preference, userId = null) {
        return this._put(this._makeUrl(paths.UserPreference, { userId: userId }),
            { data: { preference: preference.toJSON() }, loader: pr.load}
        );
    }


    //----------------------------------------------------------------------------------------------------
    //
    // User Subscription Methods
    //
    //----------------------------------------------------------------------------------------------------
    cancelUserSubscription(id, userId = null) {
        return this._put(this._makeUrl(paths.UserSubscriptions, { userId: userId, id: id, path: 'cancel' }));
    }

    createUserSubscription(planId, token = null, userId = null) {
        return this._post(this._makeUrl(paths.UserSubscriptions, { userId: userId }),
            { data: { plan: planId, token: token }, loader: sb.load }
        );
    }

    readUserSubscription(id, userId = null) {
        return this._get(this._makeUrl(paths.UserSubscriptions, { userId: userId, id: id }), { loader: sb.load });
    }

    readUserSubscriptions(userId = null) {
        return this._get(this._makeUrl(paths.UserSubscriptions, { userId: userId }), { loader: sb.load });
    }


    //----------------------------------------------------------------------------------------------------
    //
    // User Vin Methods
    //
    //----------------------------------------------------------------------------------------------------
    readUserVin(id, params = {}, userId = null) {
        return this._get(this._makeUrl(paths.UserVins, { userId: userId, id: id }), { params: params, loader: vi.load });
    }

    readUserVins(params = {}, userId = null) {
        return this._get(this._makeUrl(paths.UserVins, { userId: userId }), { params: params, loader: vi.load });
    }

    updateUserVin(vin, params = {}, userId = null) {
        return this._put(this._makeUrl(paths.UserVins, { userId: userId, id: vin.id }),
            { data: { vin: vin.toJSON() }, params: params, loader: vi.load }
        );
    }


    //----------------------------------------------------------------------------------------------------
    //
    // VehicleRecall Methods
    //
    //----------------------------------------------------------------------------------------------------
    doesVehicleRecallExist(id) {
        return this._head(this._makeUrl(paths.VehicleRecalls, { id: id }));
    }

    doesVehicleRecallCampaignExist(campaignId) {
        return this._head(this._makeUrl(paths.VehicleRecalls, { path: campaignId }));
    }

    markVehicleRecallSent(id) {
        return this._put(this._makeUrl(paths.VehicleRecalls, { id: id, path: 'sent' }));
    }

    markVehicleRecallsSent() {
        return this._put(this._makeUrl(paths.VehicleRecalls, { path: 'sent' }));
    }

    readVehicleRecall(id, params) {
        return this._get(this._makeUrl(paths.VehicleRecalls, { id: id }), { params: params, loader: vr.load });
    }

    // Note:
    // - This method is named the same as that used to write VehicleRecalls to the S3 bucket; it allows calling
    //   code to not worry about the target, but just invoke the method
    // - This method implements a "soft" save; that is, it creates the Recall if necessary and returns
    //   if successful and false if the Recall already exists (i.e., the host returns an HTTP 303)
    saveVehicleRecall(recall) {
        return this._post(this._makeUrl(paths.VehicleRecalls),
                { data: { vehicleRecall: recall.toJSON() }, loader: vr.load }
            )
            .catch(error => {
                if (he.IsHostError(error) && error.isSeeOther) {
                    return false;
                }
                throw error;
            })
    }

    searchVehicleRecalls(params) {
        return this._get(this._makeUrl(paths.VehicleRecalls), { params: params, loader: vr.load });
    }

    summaryVehicleRecalls(params) {
        return this._get(this._makeUrl(paths.VehicleRecalls, { path: 'summary' }), { params: params, loader: vs.load });
    }

    updateVehicleRecall(recall, ...fields) {
        return this._put(this._makeUrl(paths.VehicleRecalls, { id: recall.id }),
            { data: { vehicleRecall: recall.toJSON(...fields) }, loader: vr.load }
        );
    }


    //----------------------------------------------------------------------------------------------------
    //
    // VINs Methods
    //
    //----------------------------------------------------------------------------------------------------
    markVinReviewed(id) {
        return this._put(this._makeUrl(paths.Vins, { id: id, path: 'reviewed' }));
    }

    searchVinsUnreviewed(params) {
        return this._get(this._makeUrl(paths.Vins, { path: 'unreviewed' }), { params: params, loader: vi.load });
    }

    //----------------------------------------------------------------------------------------------------
    //
    // API Methods
    //
    //----------------------------------------------------------------------------------------------------
    _delete(url) {
        return axios(this._getAxiosOptions('delete', url), { cancelToken: this._cancelTokenSource.token })
            .then(() => true)
            .catch(() => false);
    }

    _get(url, options = {}) {
        return axios(this._getAxiosOptions('get', url, options), { cancelToken: this._cancelTokenSource.token })
            .then(response => {
                const body = response.data || {};
                const total = (body.meta || {}).total;
                const data = this._loadJson(body, options);
                return (_.isArray(data)
                    ? { total: total, data: data }
                    : data);
            })
            .catch(error => {
                this.evaluateError(error, 'GET', url);
            })
    }

    _head(url) {
        return axios(this._getAxiosOptions('head', url), { cancelToken: this._cancelTokenSource.token })
            .then(() => true)
            .catch(() => false);
    }

    _post(url, options = {}) {
        return axios(this._getAxiosOptions('post', url, options), { cancelToken: this._cancelTokenSource.token })
            .then(response => this._loadJson(response.data, options))
            .catch(error => {
                this.evaluateError(error, 'POST', url);
            });
    }

    _put(url, options = {}) {
        return axios(this._getAxiosOptions('put', url, options), { cancelToken: this._cancelTokenSource.token })
            .then(response => this._loadJson(response.data, options))
            .catch(error => {
                this.evaluateError(error, 'PUT', url);
            })
    }

    _validateAuthenticationToken() {
        if (!this._credentials) {
            return Promise.reject(new Error('No credentials were given to validate'));
        }

        if (!this._credentials.hasToken) {
            this._credentials.setToken();
            return Promise.reject(new Error('Credentials are invalid or expired'));
        }

        return this._head(this._makeUrl(paths.Validate))
            .then(isValid => {
                if (isValid) {
                    this._credentials.tokenValidated = true;
                }
                else {
                    this._credentials.setToken();
                }
                return isValid;
            });
    }


    //----------------------------------------------------------------------------------------------------
    //
    // Helper Methods
    //
    //----------------------------------------------------------------------------------------------------
    _getAxiosOptions(method, url, options = {}) {
        return {
            method: method,
            url: url,
            headers: this._getRequestHeaders(_.isBoolean(options.includeAuthorization) ? options.includeAuthorization : true),
            data: options.data || null,
            maxRedirects: options.redirectsAllowed || 0,
            params: options.params || {},
        };
    }

    _getRequestHeaders(includeAuthorization = true) {
        let headers = {
            'Content-Type': 'application/vnd.api+json',
        }
        if (this._keepAlive) {
            headers['Connection'] = 'keep-alive';
        }
        if (includeAuthorization && this._credentials.hasToken) {
            headers['Authorization'] = `Bearer ${this._credentials.token}`;
        }
        return headers;
    }

    _loadJson(json, options) {
        json = json || {};
        return (options.loader ? options.loader(json.data || {}, json.included) : true);
    }

    _makeUrl(basePath, params = {}) {
        if (!params.userId && this._credentials) {
            params.userId = this._credentials.userId;
        }

        let path = basePath;
        if (params.userId) {
            path = path.replace(/:userId:/, params.userId.toString());
        }

        if (params.id) {
            path = path.concat('/', params.id.toString());
        }

        if (params.path) {
            path = path.concat('/', params.path);
            if (params.pathId) {
                path = path.concat('/', params.pathId);
            }
        }

        return `${this._apiUrl}${path}`;
    }
}

module.exports.Host = Host

function _forEachPage(params, fetcher, handler, total) {
    if (!params['offset']) {
        params['offset'] = 0;
    }
    return fetcher(params)
        .then(results => {
            const collection = results.data;
            if (collection.length > 0) {
                total += collection.length;

                // Note:
                // - The handler can alter the effects of the paged query by changing the status of items;
                //   If it does so, it must inform this code by returning the number of items it  no longer
                //   expects the query to find. The code reduces the next offset by that number, which can never
                //   be greater than the length of the passed collection.
                //   This approach assumes the query contains a stable sort.
                return handler(collection)
                    .then((processed) => {
                        processed = Number.parseInt(processed);
                        if (Number.isNaN(processed)) {
                            processed = 0;
                        }
                        if (processed > collection.length) {
                            processed = collection.length;
                        }
                        params['offset'] += collection.length - processed;
                        return _forEachPage(params, fetcher, handler, total);
                    });
            }
            else {
                return total;
            }
        })
}

module.exports.forEachPage = (params, fetcher, handler = null) => {
    if (!handler) {
        handler = (c => c);
    }
    return _forEachPage(params, fetcher, handler, 0);
}
