require('./connection.js');

// Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var i18n = require('i18n');

// Controllers
var indexController = require('./routes/index');
var userController = require('./routes/users');
var loginController = require('./routes/login');
var bandsController = require('./routes/bands');
var genresController = require('./routes/genres');
var recordsController = require('./routes/records');

// Middleweares
var messages = require("./middlewares/messages");
var cookieLogin = require("./middlewares/cookie-login");

var app = express();

var ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

i18n.configure({
  locales: ['pt-BR', 'en'],
  directory: __dirname + '/locales'
});

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
  secret: "3feca1ac421afe25f6710d621e7eb000", 
  maxAge: ONE_WEEK,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(i18n.init);

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieLogin);
app.use(messages);

// Routes Configuration 
app.use('/', indexController);
app.use('/login', loginController);
app.use('/user', userController);
app.use('/bands', bandsController);
app.use('/genres', genresController);
app.use('/records', recordsController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
