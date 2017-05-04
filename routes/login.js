var express = require('express');
var router = express.Router();
var usersDB = require('../users.json');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.post('/', function(req, res) {
    if(req.body.email === usersDB["1"].email && req.body.password === usersDB[1].password){
        let token = jwt.sign(usersDB["1"], process.env.secret,{
            expiresIn: 4000
        });
        res.json({
            success: true,
            token: token
        });
    }
    else {
        res.status(401).send('Wrong login or password');
    }


});

module.exports = router;
