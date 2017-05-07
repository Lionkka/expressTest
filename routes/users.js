var express = require('express');
var router = express.Router();
var usersDB = require('../users.json');

router.get('/', function(req, res) {
    var allUsers = deletePassFromData(usersDB);
    res.json({
        message: allUsers
    });
});
router.get('/:id', function(req, res) {
    var userID = req.params.id;
    var userData = usersDB.filter((item)=> item.id ===  userID);
    userData = deletePassFromData(userData)[0];
    res.json({
        message: userData
    });
});
router.delete('/:id', function(req, res) {
    var userID = req.params.id;

    res.json({
        message: 'User '+ userID +' has been deleted'
    });
});

router.patch('/:id', function(req, res) {
    var userID = req.params.id;
    var newData = JSON.parse(req.query.data);
    var userData = usersDB.filter((item)=> item.id ===  userID);
    userData = deletePassFromData(userData)[0];
    for (var prop in newData) {
        userData[prop] = newData[prop];
    }

    res.json({
        message: userData
    });
});
router.post('/', function(req, res) {
    var newData = JSON.parse(req.body.data);
    usersDB.push(newData);
    console.log(usersDB);
    res.json({
        message: newData
    });
});

function deletePassFromData(data){
    return data.map(function (item) { delete item.password;  return item})
}

module.exports = router;