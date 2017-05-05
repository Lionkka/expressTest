const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

    if(req.headers.authorization){
        let token = req.headers.authorization
            .split(/\bbearer\b\s*/)[1];
        jwt.verify(token, process.env.secret,(err)=>{
            err ? next(err) : next();
        });
    }
    else {
        next(new Error('403: Forbidden'));
    }
};
