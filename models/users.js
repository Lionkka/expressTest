"use strict";
const usersDB = require('../users.json');

const getAllUsers = function () {
    return deletePassFromData(usersDB);
};

const getUserById = function (id) {
    let userData = usersDB.filter((item) => item.id === id);
    if(userData) userData = deletePassFromData(userData);
    return userData[0];
};
const getUserByEmail = function (email) {
    let userData = usersDB.filter((item) => item.email === email);
    return userData[0];
};
const getUserByNickname = function (nickname) {
    let userData = usersDB.filter((item) => item.nickname === nickname);
    return userData[0];
};

function deletePassFromData(data) {
    return data.map(function (item) {
        delete item.password;
        return item
    })
}


module.exports.getAllUsers = getAllUsers;
module.exports.getUserById = getUserById;
module.exports.getUserByEmail = getUserByEmail;
module.exports.getUserByNickname = getUserByNickname;