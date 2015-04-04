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
 * This method will get blog by Id.
 *
 * @author fxish
 *
 * @api USE /blogs/:blog_id/
 * @param {Object} req
 * @param {Object} res
 */
exports.getBlogService = function (req, res, next) {
    var blog_id = req.params.blog_id;
    Blog.findById(blog_id, function (err, blog) {
        if (err){
            res.status(400).json(err);
			return;
		}			
        req.blog = blog;
		next();
    });
};

/**
 * This method will get comment by Id.
 *
 * @author fxish
 *
 * @api USE /blogs/:blog_id/comments/:comment_id
 * @param {Object} req
 * @param {Object} res
 * @param   {Function} next
 */
exports.getCommentService = function (req, res, next) {
    var comment_id = req.params.comment_id;	
	if (req.blog){
		var comments = req.blog.comments;		
		for (var i=0;i<comments.length;++i){		
			if (comments[i]._id.equals(comment_id)){			
				req.comment = comments[i];
				next();	
				return;
			}
		}	
		res.status(400).json({
					error: 'The requested resource doesn\'t exists'
				});
	}else{
		res.status(400).json({
					error: 'The requested resource doesn\'t exists'
				});
	}
};


/**
 * This method will make a comment as disliked by current user.
 * The author of comment cannot mark the his/her comment as disliked.
 * The user can dislike a comment at most once.
 *
 * @author fxish
 *
 * @api POST /blogs/:blog_id/comments/:comment_id/dislike
 * @param {Object} req
 * @param {Object} res
 */
exports.dislikeComment = function (req, res) {
    var dislikeUsers = req.comment.dislikeUsers;
	var user = req.user;
	if (dislikeUsers===null||user===null){
		res.status(400).json({
            error: 'The requested resource doesn\'t exists'
        });
		return;
	}
	if (user._id.equals(req.comment.author)){
		res.status(403).json({
            error: 'The user is not allowed to perform the update on the resource.'
        });
		return;
	}
	for (var i=0;i<dislikeUsers.length;++i){
		if (user._id.equals(dislikeUsers[i])){
			res.status(403).json({
                error: 'The user is not allowed to perform the update on the resource.'
            });
			return;
			}}	
	dislikeUsers.push(user._id);
	req.comment.numOfDislikes=dislikeUsers.length;
	var query = { _id:req.params.blog_id};
	Blog.update(query,{comments:req.blog.comments},{},function (err, numberAffected, raw){
		if (err){
			res.status(400).json({
				error: 'The input is not valid'
			});
			return;
		}
	});
    res.json({
                message: "The blog is marked as disliked by current user."
            });	
};

