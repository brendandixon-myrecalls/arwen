const FeedParser = require('feedparser');
const stream = require('stream');

const logger = require('../Common/logger');
const recall = require('./ParsedRecall');

class ParserError extends Error {
    constructor(message, error = null) {
        super(message);
        this._internal_error = error;
    }

    get internal_error() {
        return this._internal_error;
    }
}

class Parser {
    constructor(feed, stream) {
        this._feed = feed;
        this._fCompleted = false;
        this._recalls = [];
        this._stream = stream;
    }

    fetchRecalls() {
        if (this._fCompleted) {
            return this._recalls;
        }
        else {
            return new Promise((resolve, reject) => {
                let self = this;
                let feedparser = new FeedParser();
                feedparser
                    // FeedParser can fail to emit the 'end' event; capture both 'drain' and 'end'
                    .on('drain', () => {
                        while (feedparser.read()) { }
                        self._complete(resolve, reject);
                    })
                    .on('end', () => {
                        self._complete(resolve, reject);
                    })
                    .on('error', (error) => {
                        self._fCompleted = true;
                        logger.error(`Feed parsing failed -- ${error.stack}`);
                        reject(new ParserError('Feed parsing failed', error));
                    })
                    .on('readable', () => {
                        let s;
                        while ((s = feedparser.read())) {
                            self._recalls.push(recall.create(
                                self._feed.name,
                                self._feed.source,
                                self._feed.categories, s));
                        }
                    });

                this._stream.pipe(feedparser);
            });
        }
    }

    _complete(resolve, reject) {
        if (!this._fCompleted) {
            try {
                this._fCompleted = true;
                this._recalls.sort((recall1, recall2) => recall2.compare(recall1));
                let cRecalls = this._recalls.length;

                // Some feeds (such as those published by the NHTSA) will emit multiple recalls for the
                // same recall (as identified by the Press Release link).
                // Combine all those into a single recall.
                for (let i = 0; i < this._recalls.length - 1; i++) {
                    let j = i + 1;
                    while (j < this._recalls.length && this._recalls[i].compare(this._recalls[j]) === 0) {
                        j++;
                    }
                    if (j - i > 1) {
                        this._recalls[i].combine(this._recalls.slice(i + 1, j));
                        this._recalls.splice(i + 1, j - i - 1);
                    }
                }
                if (cRecalls !== this._recalls.length) {
                    logger.verbose(`Combined and removed ${cRecalls - this._recalls.length} recalls`);
                }
                resolve(this._recalls);
            }
            catch (error) {
                reject(error);
            }
        }
    }
}

function extractRecalls(feed, data) {
    return Promise.resolve()
        .then(() => {
            feed.content = data;
            feed.extension = 'xml';

            let input = new stream.Readable();
            input.push(data);
            input.push(null);
            return (new Parser(feed, input))
                .fetchRecalls();
        });
}

module.exports.extractRecalls = extractRecalls;
