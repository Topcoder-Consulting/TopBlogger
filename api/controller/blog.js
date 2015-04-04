/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */

/**
 * This is the controller that exposes AJAX actions for blog.
 *
 * @version 1.0
 * @author albertwang, j3_guile
 */
"use strict";

var service = require('../services/BlogService');
var Blog = require('../models/Blog');

exports.getBlog = function(req,res) {
	Blog.findById(req.params.blog_id,function(err,blog) {
		if (err)
			res.send(err);

		res.json(blog);
	});
};

/**
 * Creates a new blog.
 *
 * @param {Object} req the expressJS request object
 * @param {Object} res the expressJS response object
 * @param {Function} callback the callback function it is given the following parameters
 *    1) error - execution errors encountered (if any)
 *    2) blog - the created object
 */
exports.createBlog = function(req, res, callback) {
	service.createBlog(req.body, function(err, blog) {
		callback(err, blog);
	});

}
