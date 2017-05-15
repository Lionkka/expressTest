"use strict";
const express = require('express');
const router = express.Router();
const usersDB = require('../users.json');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/users');

router.post('/', authByLogin);
router.get('/', passport.authenticate('bearer', { session: false }), getCurrentUser);

router.get('/facebook', passport.authenticate('facebook', {failureRedirect: '/facebook', scope: ['email']}));
router.get('/facebook/callback', passport.authenticate('facebook',
    {failureRedirect: '/facebook/callback'}),
    (req, res, next) => socialAuth(req, res, next));

router.get('/twitter', passport.authenticate('twitter', {failureRedirect: '/twitter'}));
router.get('/twitter/callback', passport.authenticate('twitter',
    {failureRedirect: '/twitter/callback'}),
    (req, res, next) => socialAuth(req, res, next));

router.get('/google', passport.authenticate('google', { scope:
   ['profile','email'] }
));
router.get('/google/callback',  passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res, next) => socialAuth(req, res, next)
    );

function socialAuth(req, res, next) {
    let user = User.getUserByEmail(req.user.email);

    if(req.user.provider === 'twitter'){
        user = User.getUserByNickname(req.user.username);
    }
    if (user)
        res.json(getTokenMessage(user.id));
    else {
        res.status(401);
        next(new Error('User not in database'))
    }
}
function authByLogin(req, res, next) {
    if (!req.body.email || !req.body.password) {
        res.status(401);
        next(new Error('Login or password incorrect'))
    }
    else
        passport.authenticate('local',
            function (err, user) {
                if (err) {
                    res.status(401);
                    next(new Error('Login or password incorrect'))
                }
                else
                    res.json(getTokenMessage(user.id));
            }
        )(req, res, next);
}

function getCurrentUser(req, res, next) {
    let userID = jwt.decode(req.token).id;
    let userData = usersDB.filter((item) => item.id === userID)[0];
    delete userData.password;

    res.json({
        message: userData
    });
}

function getTokenMessage(userId) {
    let token = jwt.sign({
        id: userId
    }, process.env.secret, {
        expiresIn: 4000
    });
    return {
        message: {
            token: token
        }
    };
}
module.exports = router;
