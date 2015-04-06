/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger API publish Blog controller.
 *
 * @version 1.0
 * @author kiri4a and other
 */

var Blog = require('../models/Blog');
var Comment = require('../models/Comment');
var UserViewBlog = require('../models/UserViewBlog')
/**
 * This method will get blog by Id.
 *
 * @api GET /blogs/:blog_id
 * @param {Object} req
 * @param {Object} res
 */
exports.getBlog = function (req, res) {
    Blog.findById(req.params.blog_id, function (err, blog) {
        if (err)
            res.send(err);

        res.json(blog);
    });
};

/**
 * This method will publish a unpublished blog.
 * It can only be done by the author of blog.
 *
 * @api POST /blogs/:blog_id/publish
 * @param {Object} req
 * @param {Object} res
 */
exports.publishBlog = function (req, res) {
    var blog_id = req.params.blog_id;
    var user = req.user;

    Blog.findById(blog_id, function (err, blog) {
        if (err) {
            res.status(404).json(err);
        } else {
            if (user._id.equals(blog.author)) {
                // If the blog is already published just respond with 200 and the payload.
                if (blog.isPublished) {
                    res.json(blog);
                } else {
                    // Publish it and respond with payload.
                    blog.isPublished = true;
                    blog.publishedDate = (new Date()).getTime();
                    blog.save(function (err) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.json(blog);
                        }
                    });
                }
            } else {
                // The user is not allowed to perform the update on the resource.
                res.status(403).json({
                    message: 'The user is not allowed to perform the update on the resource'
                });
            }
        }
    });
};

exports.likeBlogComment = function(req, res, next) {
    Blog.findOne({
        _id: req.params.blogId
    }, function(err, blog) {
        if (err) {
            next(err);
            return;
        }
        else if (!blog) {
            res.status(400).json({
                error: 'Blog does not exist.'
            });
            return;
        }

        var i = 0;

        for (iLength = blog.comments.length; i < iLength; ++i)
        {
            if (blog.comments[i]._id.equals(req.params.commentId))
            {
                break;
            }
        }

        if (i === blog.comments.length)
        {
            res.status(400).json({
                error: 'Comment does not exist'
            });
            return;
        }

        var comment = blog.comments[i];

        if (comment.author.equals(req.user._id)) {
            res.status(403).json({
                error: 'User is not allowed to like own post.'
            });
            return;
        }

        for (var i = 0, iLength = comment.likeUsers.length; i < iLength; ++i) {
            if (req.user._id.equals(comment.likeUsers[i])) {
                res.status(403).json({
                    error: 'User already liked this comment.'
                });
                return;
            }
        }

        comment.numOfLikes++;
        comment.likeUsers.push(req.user._id);
        blog.save(function(err) {
            if (err) {
                next(err);
                return;
            }

            res.end();
        });

    });
};

/**
 * This method will mark a blog as viewed by current user.
 * A blog can be marked as viewed by the same user for at most once.
 * The current user should not be the author of blog.
 *
 * @api POST /blogs/:blog_id/view
 * @param {Object} req
 * @param {Object} res
 */
exports.markBlogAsViewed = function (req, res) {
    var blog_id = req.params.blog_id;
    var user = req.user;

    Blog.findById(blog_id, function (err, blog) {
        if (err) {
            res.status(404).json(err);
        } else {
            if (!user._id.equals(blog.author)) {
                UserViewBlog.findOne({user:user._id, blog:blog_id}, function(err, userViewBlog) {
                    if(userViewBlog) {
                        res.status(403).json({
                            message: 'The user is not allowed to perform the update on the resource'
                            });
                    } else {
                        var newUserViewBlog = new UserViewBlog({
                            user: user._id,
                            blog: blog_id,
                            timeStamp: (new Date).getTime()
                        });
                        newUserViewBlog.save(function(err) {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                res.json(newUserViewBlog);
                            }
                        })
                    }
                });                
            } else {
                // The user is not allowed to perform the update on the resource.
                res.status(403).json({
                    message: 'The user is not allowed to perform the update on the resource'
                });
            }
        }
    });
};
