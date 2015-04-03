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

}