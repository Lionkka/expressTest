var express = require('express');
var router = express.Router();
var usersDB = require('../users.json');
var jwt = require('jsonwebtoken');
var checkAuth = require('../middleware/checkAuth');

router.post('/', function(req, res, next) {

    function failAuth(){
        res.status(401);
        next(new Error('Login or password incorrect'));
    }

    var clientLogin = req.body.email;
    var clientPassword = req.body.password;

    if(!clientLogin || !clientPassword){
        failAuth();
    }

    var clientObj = usersDB.filter((item)=> item.email ===  clientLogin)[0];
    if(!clientObj)
        failAuth();
    if(clientObj.password === clientPassword){

        var token = jwt.sign({
            id: clientObj.id
        }, process.env.secret,{
            expiresIn: 4000
        });
        res.json({
            message: {
                token: token
            }
        });
    }
    else {
        failAuth();
    }
});
router.get('/',checkAuth,  function(req, res, next) {
    var userID = jwt.decode(req.token).id;
    var userData = usersDB.filter((item)=> item.id ===  userID)[0];
    delete userData.password;

    res.json({
        message: userData
    });
});
module.exports = router;
