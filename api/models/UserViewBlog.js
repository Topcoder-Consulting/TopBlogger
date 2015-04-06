/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the user model.
 *
 * @version 1.0
 * @author lanchongyizu
 */
"use strict"

var mongoose = require('mongoose')
var User = require('../models/User')
var Blog = require('../models/Blog')

var UserViewBlog = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	blog: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Blog',
		required: true
	},
	timeStamp: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('UserViewBlog', UserViewBlog);