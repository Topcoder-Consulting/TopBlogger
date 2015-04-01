/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the user model.
 *
 * @version 1.0
 * @author kiri4a
 */
"use strict";

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var User = new mongoose.Schema({
    handle: {
        type: String,
        required: true
    },
    JWT: {
        type: String
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
