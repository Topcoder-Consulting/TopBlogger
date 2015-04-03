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
