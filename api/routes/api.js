/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger API controller.
 *
 * @version 1.0
 * @author kiri4a
 */
"use strict";

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var User = require('../models/User');
var blogController = require('../controller/blog');

/**
 * Validates API JWT tokens.
 * Expects HTTP Authorization header to be set.
 * `Authorization: JWT <your token here>`
 *
 * @param   {Object} req
 * @param   {Object} res
 * @param   {Function} next
 */
var AuthChecker = function (req, res, next) {
    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            var scheme = parts[0];
            var credentials = parts[1];

            if (/^JWT/i.test(scheme)) {
                var token = credentials;
                var decoded;
                try {
                    decoded = jwt.verify(token, config.JWT_secret);
                    User.findOne({
                        username: decoded.username
                    }, function (err, user) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            req.user = user;
                            return next();
                        }
                    });

                } catch (e) {
                    res.status(401).json({
                        error: 'Invalid token'
                    });
                }
            } else {
                res.status(401).json({
                    error: 'Invalid token'
                });
            }
        } else {
            res.status(401).json({
                error: 'Invalid token'
            });
        }
    } else {
        res.status(401).json({
            error: 'Invalid token'
        });
    }
};

/* API root. */
router.get('/', function (req, res) {
    res.json({
        version: 1.0
    });
});

/* API endpoint which require auth. */
router.get('/secret', AuthChecker, function (req, res) {
    res.json({
        message: "SUCCESS!!"
    });
});
/*API endpoint which gets the blog id */

router.route('/blogs/:blog_id')
    .get(blogController.getBlog);

router.route('/blogs/:blog_id/comments')
    .post(blogController.addComments);

router.route('/blogs/:blog_id/comments/:commentId')
    .delete(blogController.deleteComments);

module.exports = router;
