class Feed {
    constructor() {
        this.name = '';
        this.source = '';

        this.url = null;
        this.dataUrl = null;
        this.feedsUrl = null;

        this.categories = [];
        this.affected = [];
        this.distribution = [];

        this.error = null;
        this.saved = 0;
        this.skipped = 0;
        this.failures = [];
    }
}

module.exports.Feed = Feed;
