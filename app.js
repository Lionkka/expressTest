var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jsonwebtoken = require('jsonwebtoken');
var checkAuth = require('./middleware/checkAuth');

var session = require('./routes/session');
var users = require('./routes/users');

var app = express();

process.env.secret = 'hello';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/session', session);
app.use(checkAuth);
app.use('/users', users);

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
  if(!res.status)
      res.status(err.status || 500);

  res.json({
      message: err.message
  });
});

module.exports = app;

app.listen(3001, function () {
    console.log('listen');
});
