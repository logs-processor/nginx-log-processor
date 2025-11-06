const success = (res, data, message) => {
    res.send({
        payload: data
    });
};
const badRequest = (res, code, message, context) => {
    res.status(400).send({
        error: {
            code: code,
            message: message ? message : 'bad request',
            context
        }
    });
};
const internalError = (res, code, message, context) => {
    res.status(500).send({
        error: {
            code: code,
            message: message ? message : 'internal server error',
            context
        }
    });
};

module.exports = {
    success,
    badRequest,
    internalError,
};