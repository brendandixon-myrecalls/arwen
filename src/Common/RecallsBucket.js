const AWS = require('aws-sdk');
const moment = require('moment');

const logger = require('./logger');

const S3Bucket = 'my-recalls';
const S3FeedsFolder = 'feeds';
const S3FeedStatus = 'feedStatus.json';
const S3RecallsFolder = 'recalls';

class RecallsBucket {
    constructor(awsConfig) {
        AWS.config = new AWS.Config(awsConfig);
        this._s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    }

    get name() {
        return 'Bucket';
    }

    doesRecallExist(recall) {
        let key = this._keyFor(recall);
        return this._checkObject(key);
    }

    saveFeed(name, dateTime, content, extension = 'xml') {
        let key = `${S3FeedsFolder}/${name}-${dateTime.format('YYYY-MM-DDTHH:mm:ss[Z]')}.${extension}`;

        if (process.env.BUILD_MODE == 'development') {
            logger.warn(`In development mode -- Skipping save of feed ${name} to S3`);
            return Promise.resolve();
        }

        return this._checkObject(key)
            .then(fExists => {
                if (!fExists) {
                    return this._writeObject(key, content).then(() => {
                        logger.info(`Saved feed ${name} to bucket as ${key}`);
                        true}
                    );
                }
                logger.verbose(`Skipping save -- feed ${name} exists at ${key}`);
                return false;
            })
    }

    saveRecall(recall) {
        if (process.env.BUILD_MODE == 'development') {
            logger.warn(`In development mode -- Skipping save of recall ${recall.canonicalName} to S3`);
            return Promise.resolve();
        }

        let key = this._keyFor(recall);
        let data = JSON.stringify(recall.toJSON());
        return this._checkObject(key)
            .then(fExists => {
                if (!fExists) {
                    return this._writeObject(key, data);
                }
            })
    }

    saveVehicleRecall(recall) {
        return this.saveRecall(recall);
    }

    readStatus() {
        return this._checkObject(S3FeedStatus)
            .then(exists => {
                return (exists
                    ? this._readObject(S3FeedStatus)
                    : '{}');
            });
    }

    saveStatus(status) {
        if (process.env.BUILD_MODE == 'development') {
            logger.warn(`In development mode -- Skipping save of status ${JSON.stringify(status.toJSON())} to S3`);
            return Promise.resolve();
        }

        const data = JSON.stringify(status.toJSON());
        return this._writeObject(S3FeedStatus, data);
    }

    _checkObject(key) {
        return this._s3.headObject({
            Bucket: S3Bucket,
            Key: key
        }).promise()
            .then(() => true)
            .catch(() => false);
    }

    _keyFor(recall) {
        return `${S3RecallsFolder}/${recall.canonicalName}`
    }

    _readObject(key) {
        return this._s3.getObject({
            Bucket: S3Bucket,
            Key: key
        }).promise()
            .then(data => {
                return data.Body.toString('utf8');
            });
    }

    _writeObject(key, data) {
        return this._s3.putObject({
            Body: data,
            Bucket: S3Bucket,
            Key: key
        }).promise();
    }
}

module.exports.RecallsBucket = RecallsBucket
