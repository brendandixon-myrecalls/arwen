const axios = require('axios');
const axiosRetry = require('axios-retry');

function loadUrl(url) {
    axiosRetry(axios, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay
    });
    return axios({
            url: url.toString(),
            headers: {
                'Connection': 'keep-alive'
            }
        })
        .then(response => {
            return response.data;
        });
}

module.exports.loadUrl = loadUrl
