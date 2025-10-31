const app = require('express')();
const router = require('express').Router();
const logs = require('./logs');
const health = require('./apiHealth');

module.exports = (config, persistence) => {
    app.use('/v1', router);


    health(router);
    logs(router, persistence.logs);

    return app;
};