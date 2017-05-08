"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const jsonwebtoken = require('jsonwebtoken');
const checkAuth = require('./middleware/checkAuth');
const auth = require('./middleware/auth');
const passport = require('passport');
const LocalStrategy  = require('passport-local').Strategy;

const session = require('./routes/session');
const users = require('./routes/users');

const app = express();

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(username, password,done){
    let verifyObj = auth(username, password);

    if(!verifyObj)
        done(new Error('Incorrect'));
    else
        done(null, verifyObj);
}));

process.env.secret = 'hello';

//app.use(passport.initialize());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/session', session);
app.use(checkAuth);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('404 Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (!res.status)
        res.status(err.status || 500);

    res.json({
        error: err.message
    });
});

module.exports = app;

app.listen(3001, function () {
    console.log('listen');
});
