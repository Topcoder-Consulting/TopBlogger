/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents set of TopBlogger user auth routes.
 *
 * @version 1.0
 * @author kiri4a
 */
"use strict";

var express = require('express');
var router = express.Router();
var User = require('../models/User');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/config');

// Register user form.
router.get('/register', function (req, res) {
    res.render('register');
});

// Registration.
router.post('/register', function (req, res, next) {
    User.register(new User({
        username: req.body.username,
        handle: req.body.handle,
        JWT: jwt.sign({
            username: req.body.username,
            handle: req.body.handle
        }, config.JWT_secret)
    }), req.body.password, function (err) {
        if (err) {
            console.log('error while user register!', err);
            return next(err);
        }

        res.redirect('/');
    });
});

// Login user form.
router.get('/login', function (req, res) {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

// Log in.
router.post('/login', passport.authenticate('local'), function (req, res) {
    res.redirect('/');
});

// Log out.
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
