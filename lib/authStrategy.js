"use strict";
const LocalStrategy = require('passport-local').Strategy;
const AuthFacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const passport = require('passport');
const accesses = require('../accesses.json');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function (username, password, done) {

    let clientObj = User.getUserByEmail(username);
    if (clientObj && clientObj.password === password)
        done(null, clientObj);

    else
        done(new Error('Incorrect login or password'));
}));

passport.use(new BearerStrategy(
    function(token, done) {
        jwt.verify(token, 'hello', (err) => {
            err?done(new Error('Forbidden')):
                done(null, token);
        });
    }
));

passport.use('facebook', new AuthFacebookStrategy({
        clientID: accesses.facebook.clientID,
        clientSecret: accesses.facebook.clientSecret,
        callbackURL: 'http://localhost:3001/session/facebook/callback',
        profileFields: ['id', 'email']
    },
    (accessToken, refreshToken, profile, done) =>
        done(null, {id: profile.id, email: profile.emails[0].value})
));

passport.use(new TwitterStrategy({
        consumerKey: accesses.twitter.consumerKey,
        consumerSecret: accesses.twitter.consumerSecret,
        callbackURL: "http://localhost:3001/session/twitter/callback"
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
));

passport.use(new GoogleStrategy({
        clientID:     accesses.google.clienID,
        clientSecret: accesses.google.clientSecret,
        callbackURL: "http://localhost:3001/session/google/callback",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        done(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});


passport.deserializeUser(function (id, done) {
    let user = User.getUserById(id);
    user ? done(null, user) : done(new Error('Incorrect Login or password'));
});
