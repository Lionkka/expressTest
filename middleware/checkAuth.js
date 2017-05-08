"use strict";
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

    if (req.headers.authorization) {

        let token = req.headers.authorization.split(/\bbearer\b\s*/)[1];

        jwt.verify(token, process.env.secret, (err) => {
            if (err) {
                res.status(403);
                next(new Error('Forbidden'));
            }
            else {
                req.token = token;
                next();
            }

        });
    }
    else {
        res.status(403);
        next(new Error('Forbidden'));
    }
};
