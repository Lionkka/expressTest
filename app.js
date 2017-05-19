"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');

const session = require('./routes/session');
const users = require('./routes/users');
const parser = require('./routes/parser');

const app = express();

require('./lib/authStrategy');

app.use(passport.initialize());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use('/session', session);
app.use('/parser', parser);
app.use(passport.authenticate('bearer', { session: false }) );
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('404 Not Found');
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
