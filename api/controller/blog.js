var Blog = require('../models/Blog');
var Comment = require('../models/Comment');
var User = require('../models/User');

exports.getBlog = function(req,res) {

	
	Blog.findById(req.params.blog_id,function(err,blog) {
		if (err)
			res.send(err);
		
		res.json(blog);
	});
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
      		lastUpdateedDate: (new Date).getTime(),
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
