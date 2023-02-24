const axios = require('axios');
const axiosRetry = require('axios-retry');
const moment = require('moment');
const _ = require('lodash');

const logger = require('../Common/logger');
const vh = require('./Vehicle');
const vr = require('./VehicleRecall');

const NHTSA_CAMPAIGN_ID_REGEX = /.*nhtsaId=([0-9A-Z]{9}).*/;
const NHTSA_DATE_REGEX = /.*Date\((\d{13})(\-\d{2}00)\).*/;

function convertRecalls(recalls) {
    let converted = [];
    let p = Promise.resolve();
    _.forEach((recalls || []), recall => {
        p = p.then(() => retrieveCampaign(recall))
            .then(c => {
                if (!_.isEmpty(c)) {
                    const vehicleRecall = vr.create(c);
                    if (vehicleRecall.isValid) {
                        converted.push(vehicleRecall);
                    }
                    else {
                        logger.warn(`VehicleRecall failed to convert recall ${recall.link}`);
                    }
                }
                return converted;
            });
    });
    return p.then(() => converted);
}

function extractCampaignIdFromLink(link = '') {
    const m = (link || '').match(NHTSA_CAMPAIGN_ID_REGEX);
    return (m || [])[1];
}

function retrieveCampaign(campaignId = '') {
    if (!_.isEmpty(campaignId) && !_.isString(campaignId)) {
        campaignId = extractCampaignIdFromLink(campaignId['link'] || '');
    }

    if (_.isEmpty(campaignId) || !_.isString(campaignId)) {
        return Promise.resolve({});
    }

    axiosRetry(axios, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay
    });

    return axios({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `https://webapi.nhtsa.gov/api/Recalls/vehicle/campaignnumber/${campaignId}?format=json`,
    })
        .then(response => response.data || {})
        .catch(error => {
            logger.warn(`Failed to retrieve Vehicle Campaign ${campaignId} - ${error}`);
            return {};
        })
        .then(data => {
            const results = (data['Results'] || []);

            if (results.length <= 0) {
                logger.info(`NHTSA returned no data for Vehicle Campaign ${campaignId}`);
                return {};
            }

            let campaign = {
                campaignId: campaignId,
                component: null,
                summary: null,
                consequence: null,
                remedy: null,
                publicationDate: null,
                vehicles: [],
            }

            for (let i = 0; i < results.length; i++) {
                const result = results[i];

                if (!campaign['component']) {
                    campaign['component'] = result['Component'];
                }
                if (!campaign['summary']) {
                    campaign['summary'] = result['Summary'];
                }
                // Note:
                // - The NHTSA campaign JSON misspells "consequence" as "conequence"
                if (!campaign['consequence']) {
                    campaign['consequence'] = result['Conequence'];
                }
                if (!campaign['remedy']) {
                    campaign['remedy'] = result['Remedy'];
                }
                if (!campaign['publicationDate']) {
                    const m = result['ReportReceivedDate'].match(NHTSA_DATE_REGEX);
                    if (m && m.length >= 2) {
                        const utcTime = parseInt(m[1]);
                        const hours = parseInt(m[2]) / 100;
                        campaign['publicationDate'] = moment.utc(utcTime).subtract(hours, 'hours');
                    }
                }

                const vehicle = vh.create({
                    make: result['Make'],
                    model: result['Model'],
                    year: parseInt(result['ModelYear'] || '0'),
                });
                if (vehicle.isValid) {
                    campaign['vehicles'].push(vehicle);
                }
            }

            return campaign;
        })
}

module.exports.convertRecalls = convertRecalls;
module.exports.extractCampaignIdFromLink = extractCampaignIdFromLink;
module.exports.retrieveCampaign = retrieveCampaign;
