var Blog = require('../models/Blog');
var Comment = require('../models/Comment');

exports.getBlog = function(req,res) {


	Blog.findById(req.params.blog_id,function(err,blog) {
		if (err)
			res.send(err);
		
		res.json(blog);
	});
};

exports.likeBlogComment = function(req, res, next) {
    Blog.findOne({
        _id: req.params.blogId,
        comments: req.params.commentId
    }, function(err, blog) {
        if (err) {
            next(err);
            return;
        }
        else if (!blog) {
            res.status(403).json({
                error: 'Blog does not exist.'
            });
            return;
        }

        Comment.findById(req.params.commentId, function(err, comment) {
            if (err) {
                next(err);
                return;
            }
            else if (!comment) {
                res.status(403).json({
                    error: 'Comment does not exist.'
                });
                return;
            }
            else if (comment.author.equals(req.user._id)) {
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
            comment.save(function(err) {
                if (err) {
                    next(err);
                    return;
                }

                res.end();
            });
        });
    });
};
