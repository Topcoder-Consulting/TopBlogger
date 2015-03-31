/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger app main file.
 *
 * @version 1.0
 * @author kiri4a
 */
"use strict";

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var user_auth_routes = require('./routes/user_auth');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/User');
var config = require('./config/config');


app.set('port', process.env.PORT || 3000);

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/topblogger');
mongoose.connection.on('error', function () {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    keys: config.Session_keys
}));

// Configure passport middleware.
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use account model for authentication.
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Register routes.
app.use('/', routes);
app.use('/users', users);
app.use('/', user_auth_routes);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
