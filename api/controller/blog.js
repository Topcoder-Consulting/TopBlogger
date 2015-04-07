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
var UserViewBlog = require('../models/UserViewBlog');
var UserVoteBlog = require('../models/UserVoteBlog');
var User = require('../models/User');
var apiRoute = require('../routes/api');
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

exports.dislikeBlogComment = function (req, res, next)  {
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
                error: 'User is not allowed to dislike own post.'
            });
            return;
        }

        for (var i = 0, iLength = comment.dislikeUsers.length; i < iLength; ++i) {
            if (req.user._id.equals(comment.dislikeUsers[i])) {
                res.status(403).json({
                    error: 'User already disliked this comment.'
                });
                return;
            }
        }

        comment.numOfDislikes++;
        comment.dislikeUsers.push(req.user._id);

        /*check is user has already liked the comment. Remove that user entry from if he does*/
        for (var i = 0, iLength = comment.likeUsers.length; i < iLength; i++) {
            if (req.user._id.equals(comment.likeUsers[i])) {
                comment.numOfLikes--;
                comment.likeUsers.splice(i, 1);
            }
        }

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

/**
 * This method will up-vote a blog by current user.
 * A blog can be up-voted by the same user for at most once.
 * The author of blog cannot vote for the his/her blog.
 *
 * @api POST /blogs/{id}/upvote
 * @param {Object} req
 * @param {Object} res
 */
exports.upVoteBlog = function (req, res) {
    var blog_id = req.params.blog_id;
    var user = req.user;

    Blog.findById(blog_id, function (err, blog) {
        if (err) {
            res.status(404).json(err);
        } else {
            if (!user._id.equals(blog.author)) {
                UserVoteBlog.findOne({user:user._id, blog:blog_id}, function(err, userVoteBlog) {
                    if(userVoteBlog) {
                        userVoteBlog.upordown = 1;
                        userVoteBlog.timeStamp = (new Date).getTime();
                        userVoteBlog.save(function(err) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.json(userVoteBlog);
                            }
                        });
                    } else {
                        var newUserVoteBlog = new UserVoteBlog({
                            user: user._id,
                            blog: blog_id,
                            upordown: 1,
                            timeStamp: (new Date).getTime()
                        });
                        newUserVoteBlog.save(function(err) {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                res.json(newUserVoteBlog);
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

/**
 * This method will down-vote a blog by current user.
 * A blog can be down-voted by the same user for at most once.
 * The author of blog cannot vote for the his/her blog.
 *
 * @api POST /blogs/:blog_id/votes/downvote
 * @param {Object} req
 * @param {Object} res
 */
exports.downVoteBlog = function (req, res) {
    var blog_id = req.params.blog_id;
    var user = req.user;

    Blog.findById(blog_id, function (err, blog) {
        if (err) {
            res.status(404).json(err);
        } else {
            if (!user._id.equals(blog.author)) {
                UserVoteBlog.findOne({user:user._id, blog:blog_id}, function(err, userVoteBlog) {
                    if(userVoteBlog) {
                        userVoteBlog.upordown = -1;
                        userVoteBlog.timeStamp = (new Date).getTime();
                        userVoteBlog.save(function(err) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.json(userVoteBlog);
                            }
                        });
                    } else {
                        var newUserVoteBlog = new UserVoteBlog({
                            user: user._id,
                            blog: blog_id,
                            upordown: -1,
                            timeStamp: (new Date).getTime()
                        });
                        newUserVoteBlog.save(function(err) {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                res.json(newUserVoteBlog);
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

exports.deleteBlog = function(req, res) {
    Blog.findById(req.params.blog_id, function(err, blog) {
        if (err) {
            res.status(500).json(err);
            return;
        }

        if (blog != undefined) {
            apiRoute.AuthChecker(req, res, function() {
                if (req.user !== undefined) {
                    User.findById(blog.author, function(err, authorUser) {
                        if (err) {
                            res.status(500).json(err);
                            return;
                        }
                        if (req.user.JWT === authorUser.JWT) {
                            blog.remove(function(err, result) {
                                if (err) res.status(500).json(err);
                                if (!err) {
                                    res.json("Successfully deleted Blog with title: " + blog.title);
                                }
                            })
                        }
                        else {
                            res.status(403).json("The user is not allowed to perform the update on the resource.");
                        }
                    });
                }
                else {
                    res.status(401).json("Invalid token");
                }
            });
        }
        else {
            res.status(400).json('The input is not valid');
        }
    })
};

exports.addComments = function(req,res) {

   
    Blog.findById(req.params.blog_id,function(err,blog) {
        if (err) {
            res.send(err);
            return;
        }

        var comment = new Comment({
            author: req.user,
            content: req.body.contentText,
            lastUpdatedDate: (new Date).getTime(),
            postedDate: ( new Date).getTime()
        });

        blog.comments.push(comment);

        blog.save(function(err,result) {
            if ( err) {
            
                res.send(err);
                return;
            }
            if (!err) {
                res.json(blog);
            }
        });
    });
};

exports.deleteComments = function(req,res) {

    Blog.findById(req.params.blog_id,function(err,blog) {

        if (err) {
            res.send(err);
            return;
        }

        else if ( !blog) {
            res.status(400).json(
              {error:'Blog does not exist.'
              });
            return;
        }

        var i = 0;
        var flag = 0;
        var flag2 = 0;
        
        for ( i = 0; i < blog.comments.length; i++) {
            if ( blog.comments[i]._id.equals(req.params.commentId)) {
                flag2 = 1;

                if (blog.comments[i].author.equals(req.user._id)) {
                    blog.comments.remove(blog.comments[i]);
                    flag = 1;

                }
                else {
                    res.status(403).json({
                        error: 'User is not allowed to delete the comment'
                    });

                }
                break;
            }
        }

        if ( flag == 1) {
            blog.save(function(err){
                if (err)
                    res.send(err);
                else
                    res.json(blog);
            });
        }

        if ( flag2 == 0) {
            res.json({error :'Comment does not exist'});
        }

    });
};

exports.updateComment = function(req,res) {

    Blog.findById(req.params.blog_id,function(err,blog) {

        if (err) {
            res.send(err);
            return;
        }

        else if ( !blog) {
            res.status(400).json(
              {error:'Blog does not exist.'
              });
            return;
        }
        var flag = 0,flag2 =  0;

        for ( i = 0; i < blog.comments.length;i++) {
            if ( blog.comments[i]._id.equals(req.params.commentId)) {
                    flag2 = 1;
                if ( blog.comments[i].author.equals(req.user._id)) {

                        blog.comments[i].content = req.body.contentText;
                        blog.comments[i].lastUpdatedDate = (new Date).getTime();
                        flag = 1;
                        break;


                }
                else {
                     res.status(403).json({
                        error: 'User is not allowed to delete the comment'
                    });
                }
            }   

        }

        if ( flag == 1) {
            blog.save(function(err){
                if (err)
                    res.send(err);
                else
                    res.json(blog);
            });
        }

        if ( flag2 == 0) {
            res.json({error :'Comment does not exist'});
        }



    });
};