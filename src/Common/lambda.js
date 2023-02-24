module.exports = fn => async function(event, context, callback) {
    if (!callback) {
        callback = (e, r) => true;
    }

    await fn(event, context)
        .then(results => {
            results = JSON.stringify(results);
            callback(null, {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: results
            });
            console.log(results);
        })
        .catch(error => callback(error));
}
