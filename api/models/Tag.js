/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the user model.
 *
 * @version 1.0
 * @author jeffdonthemic
 */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Tag = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Tag', Tag);
