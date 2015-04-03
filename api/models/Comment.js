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

var User = require('../models/User');

var Comment = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    lastUpdatedDate: {
        type: Number,
        required: true
    },
    numOfDislikes: {
        type: Number,
        required: true,
        default: 0
    },
    numOfLikes: {
        type: Number,
        required: true,
        default: 0
    },
    postedDate: {
        type: Number,
        required: true
    },
    likeUsers: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    dislikeUsers: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

module.exports = mongoose.model('Comment', Comment);
