const {
    success
} = require('../../responses');

module.exports = (app) => {
    app.get('/health', async (req, res) => {
        success(res, 'ok');
    });
};