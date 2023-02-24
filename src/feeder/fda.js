const moment = require('moment-timezone');
const _ = require('lodash');

const constants = require('../Common/Constants');
const logger = require('../Common/logger');
const reader = require('./reader');
const recall = require('./ParsedRecall');

const FDA_BASE_URL = 'https://www.fda.gov';
const MINIMUM_TO_EVALUATE = 50;

///////////////////////////////////////////////////////////////////////////////////
//
// NOTE:
// - This code is used ONLY to parse the JSON the FDA web pages rely on
//
///////////////////////////////////////////////////////////////////////////////////

const reTitle = /<meta\s+property="og:title"\s+content="([^"]*)".*\/>/;
const reDescription = /<meta\s+name="dcterms.description"\s+content="([^"]*)".*\/>/;
const rePublicationDate = /<meta\s+property="article:published_time"\s+content="([^"]*)".*\/>/;

async function extractItems(host, json, items = [], iItem = 0, nEvaluated = 0) {
    if (json.length <= iItem)
        return items;

    let item = json[iItem];
    if (item.publicationDate < moment().startOf('year'))
        return items;

    return Promise.resolve()
        .then(() => {
            if (!_.isEmpty(item.path)) {
                item.link = (item.path[0] == '/'
                    ? FDA_BASE_URL + item.path
                    : FDA_BASE_URL + '/' + item.path);
                item.canonicalId = recall.linkToId(item.link);
                return host.doesRecallExist(item.canonicalId);
            }
            else {
                logger.error(`Malformed FDA JSON: Path missing from ${JSON.stringify(item)}`);
                return false;
            }
        })
        .then(fExists => {
            if (!fExists) {
                items.push(item);
            }
            return extractItems(host, json, items, iItem+1, nEvaluated+1);
        });
}

async function itemsToRecalls(feed, items, recalls = [], iItem = 0) {
    if (items.length <= iItem)
        return recalls;

    const item = items[iItem];
    return reader.loadUrl(item.link)
        .then(html => {
            item.title = (html.match(reTitle) || [])[1];
            item.description = (html.match(reDescription) || [])[1];
            recalls.push(recall.create(feed.name, feed.source, feed.categories, item));
        })
        .catch(error => {
            logger.error(`Failed to retrieve FDA recall ${item.link}: ${error}`);
        })
        .then(() => itemsToRecalls(feed, items, recalls, iItem+1))
}

function extractRecalls(host, feed, json) {
    return Promise.resolve()
        .then(() => {
            logger.info(`FDA returned ${json.length} items`);
            json.forEach(r => {
                const pd = (!_.isEmpty(r['field_change_date_2'])
                    ? r['field_change_date_2']
                    : r['field_company_announcement_date']);
                r.publicationDate = moment.tz(pd, 'MM/DD/YYYY', constants.EASTERN_TIMEZONE);
            })
            json.sort((r1, r2) => (r1.publicationDate > r2.publicationDate
                ? -1
                : (r1.publicationDate < r2.publicationDate
                    ? 1
                    : 0)));
            return extractItems(host, json);
        })
        .then(items => {
            logger.info(`Found ${items.length} new FDA items`);
            if (items.length > 20) {
                logger.warn(`FDA JSON returned too many new items - ignoring all items`);
                return [];
            }
            return itemsToRecalls(feed, items)
                .then(recalls => {
                    feed.content = JSON.stringify(items);
                    feed.extension = 'json';
                    return recalls;
                })
        });
}

module.exports.extractRecalls = extractRecalls;
