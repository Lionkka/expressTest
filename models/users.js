"use strict";
const usersDB = require('../users.json');

const getAllUsersData = function () {
    return deletePassFromData(usersDB);
};

const getUserDataById = function (id) {
    let userData = usersDB.filter((item) => item.id === id);
    userData = deletePassFromData(userData);
    return userData[0];
};

function deletePassFromData(data) {
    return data.map(function (item) {
        delete item.password;
        return item
    })
}


module.exports.getAllUsersData = getAllUsersData;
module.exports.getUserDataById = getUserDataById;