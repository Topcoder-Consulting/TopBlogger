/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */

/**
 *  This service provides methods to manage blogs.
 *
 * @version 1.0
 * @author mhykol
 */

"use strict";

var async = require('async');
var slugify = require('slugify');

var Blog = require('../models/Blog');
var User = require('../models/User');
var Tag = require('../models/Tag');
var tagService = require('../services/TagService');


/**
 * Creates a new blog.
 * @param {Object} blog to create in json format
 * @param {Function} callback the callback function it is given the following parameters
 *    1) error - execution errors encountered (if any)
 *    2) block - the created blog
 */
exports.createBlog = function(blog, callback) {

    if (typeof blog.author === 'undefined') {
        blog.author = {
            "_id": "",
            "handle": ""
        };
    }
    if (typeof blog.tags === 'undefined') {
        blog.tags = [];
    }

    async.waterfall([
        function (cb) {
            // Check for new tags then add
            async.each(blog.tags, function(tag, cb) {
                if (typeof tag._id === 'undefined') {
                    tagService.createTag(tag.name, function(err, t) {
                        if (!err) {
                            tag._id = t._id.toString();;
                            cb();
                        } else {
                            cb(err, blog);
                        }
                    })
                }
            }, function(err) {
                cb(null, blog);
            });
        },
        function(blogInput, cb) {
            var blog = new Blog({
                "title": blogInput.title,
                "slug": slugify(blogInput.title),
                "publishedDate": blogInput.publishedDate,
                "createdDate": blogInput.createdDate,
                "lastUpdatedDate": blogInput.lastUpdatedDate,
                "content": blogInput.content,
                "isPublished": blogInput.isPublished,
                "numOfViews": 0,
                "numOfUpVotes": 0,
                "numOfDownVotes": 0
            });

            var author = new User({
                "_id": blogInput.author._id,
                "handle": blogInput.author.handle
            });
            blog.author = author;

            var tags = [];
            for (var i = 0; i < blogInput.tags.length; i++) {
                var t = blogInput.tags[i]
                var tag = new Tag({
                    "_id": t._id,
                    "name": t.name
                });
                blog.tags.push(tag);
            }

            blog.save(function (err) {
                callback(err, blog);
            });
        }
    ], callback);

}
