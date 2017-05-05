var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jsonwebtoken = require('jsonwebtoken');
var checkAuth = require('./middleware/checkAuth');

var login = require('./routes/login');
var secretPage = require('./routes/secret');

var app = express();

process.env.secret = 'hello';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', login);
app.use(checkAuth);
app.use('/secret', secretPage);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('404 Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
    console.log();
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
      success: false,
      message: err.message
  });
});

module.exports = app;

app.listen(3000, function () {
    console.log('listen 3000 port');
});
