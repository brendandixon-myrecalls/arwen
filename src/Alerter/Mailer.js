const AWS = require('aws-sdk');
const nm = require('nodemailer');
const _ = require('lodash');

const logger = require('../Common/logger');
const rl = require('./RateLimiter');

const environment = process.env['NODE_ENV']
const isDevelopment = (environment == 'development');
const isProduction = (environment == 'production');

const AwsConfig = require('../../.aws/alerter.json');
const awsConfig = AwsConfig[environment];
const SesConfig = require('../../.aws/ses.json');
const sesConfig = SesConfig[environment];


class Mailer {

    constructor() {
        let perSecondRate = 14;

        if (isProduction) {
            AWS.config = new AWS.Config(awsConfig);
            this._ses = new AWS.SES({ apiVersion: '2010-12-01' });

            perSecondRate = sesConfig['rate'];
            this._transport = nm.createTransport({
                SES: this._ses,
                sendingRate: perSecondRate
            });
        }
        // else if (isDevelopment) {
        //     this._transport = nm.createTransport({
        //         host: sesConfig['address'],
        //         port: sesConfig['port'],
        //         auth: {
        //             user: sesConfig['user'],
        //             pass: sesConfig['password']
        //         }
        //     });
        // }
        else {
            this._transport = {
                sendMail: (msg) => logger.info(JSON.stringify(msg)),
                verify: () => Promise.resolve(true)
            }
        }

        this._rateLimiter = rl.create(perSecondRate);
    }

    emit(user, mail) {
        const email = user.email;
        const msg = _.assign({
            from: 'alerts@myrecalls.today',
            replyTo: 'no_reply@myrecalls.today',
            to: email}, mail);
        return this._rateLimiter.waitIfNeeded()
            .then(() => this._transport.sendMail(msg));
    }

    _verify() {
        return this._transport.verify()
            .then(() => {
                logger.verbose(`Successfully verified email transport`);
                return this;
            })
            .catch(e => {
                console.log(e)
                throw new Error(`Unable to verify Mail transport - ${e}`)
            });
    }
}

module.exports.create = () => {
    return (new Mailer())._verify();
}
