const logsController = require('../../controllers/logs');

module.exports = (app, persistence) => {
    const ctrl = logsController(persistence);

    app.get('/logs/', ctrl.getLogsPaginated);

};