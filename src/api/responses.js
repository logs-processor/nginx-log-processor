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
const notFound = (res, code, message, context) => {
    res.status(404).send({
        error: {
            code: code,
            message: message ? message : 'not found',
            context
        }
    });
};
const unauthorized = (res, code, message, context) => {
    res.status(401).send({
        error: {
            code: code,
            message: message ? message : 'unauthorized',
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
const conflict = (res, message, context) => {
    res.status(409).send({
        error: {
            code: 409,
            message: message ? message : 'conflict',
            context
        }
    });
};
const serviceUnavailable = (res,code, message, context) => {
    res.status(503).send({
        error: {
            code: code,
            message: message ? message : 'service unavailable',
            context
        }
    });
};

module.exports = {
    success,
    badRequest,
    notFound,
    unauthorized,
    internalError,
    conflict,
    serviceUnavailable
};