const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = '';
    if(req.method ===  'GET'){
        token = req.query.token;
    }
    if(req.method ===  'POST'){
        token = req.body.token;
    }
    if(token){
        if( jwt.verify(token, process.env.secret,(err, decoded)=>{
            if(err){
                console.log('401');
                res.status(401).send('Forbidden');
            }

            else next();

            })){
        }
    }
    else {
        res.status(401).send('Forbidden');
    }
};
