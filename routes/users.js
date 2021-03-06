"use strict";
const express = require('express');
const router = express.Router();
const usersModel = require('../models/users');

router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.patch('/:id', putchUser);
router.post('/', postUser);

function getUsers(req, res) {

    let allUsers = usersModel.getAllUsers();
    res.json({
        message: allUsers
    });
}
function getUser(req, res) {

    let userID = req.params.id;
    let userData = usersModel.getUserById(userID);
    res.json({
        message: userData
    });
}

function deleteUser(req, res) {
    let userID = req.params.id;

    res.json({
        message: 'User '+ userID +' has been deleted'
    });
}

function putchUser(req, res) {

    let userID = req.params.id;
    let newData = req.body;
    let userData = usersModel.getUserById(userID);
    userData = Object.assign(userData, newData);
    res.json({
        message: userData
    });
}

function postUser(req, res) {

    let newData = req.body;
    let users = usersModel.getAllUsers();
    users.push(newData);
    res.json({
        message: newData
    });
}

module.exports = router;