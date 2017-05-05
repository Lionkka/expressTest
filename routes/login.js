var express = require('express');
var router = express.Router();
var usersDB = require('../users.json');
var jwt = require('jsonwebtoken');

router.post('/', function(req, res, next) {
    let errorText = '401: Unauthorized';
    let clientLogin = req.body.email;
    let clientPassword = req.body.password;

    if(!clientLogin || !clientPassword)
        next(new Error(errorText));

    let clientObj = usersDB.filter((item)=> item.email ===  clientLogin)[0];
    if(!clientObj)
        next(new Error(errorText));

    if(clientObj.password === clientPassword){

        let token = jwt.sign({
            id: clientObj.id
        }, process.env.secret,{
            expiresIn: 4000
        });
        res.json({
            success: true,
            message: {
                token: token
            }
        });
    }
    else {

        next(new Error(errorText));
    }


});

module.exports = router;
