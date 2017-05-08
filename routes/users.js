var express = require('express');
var router = express.Router();
var usersDB = require('../users.json');

router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.patch('/:id', putchUser);
router.post('/', postUser);

function deletePassFromData(data){
    return data.map(function (item) { delete item.password;  return item})
}

function getUsers(req, res) {
    var allUsers = deletePassFromData(usersDB);
    res.json({
        message: allUsers
    });
}

function getUser(req, res) {
    var userID = req.params.id;
    var userData = usersDB.filter((item)=> item.id ===  userID);
    userData = deletePassFromData(userData)[0];
    res.json({
        message: userData
    });
}

function deleteUser(req, res) {
    var userID = req.params.id;

    res.json({
        message: 'User '+ userID +' has been deleted'
    });
}

function putchUser(req, res) {
    var userID = req.params.id;
    var newData = req.query;

    var userData = usersDB.filter((item)=> item.id ===  userID);
    userData = deletePassFromData(userData)[0];
    userData = Object.assign(userData, newData);
    console.log(newData,'\n', userData);
    res.json({
        message: userData
    });
}

function postUser(req, res) {
    console.log(req.body);
    var newData = req.body;
    usersDB.push(newData);
    res.json({
        message: newData
    });
}

module.exports = router;