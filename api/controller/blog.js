var Blog = require('../models/Blog');

exports.getBlog = function(req,res) {


	Blog.findById(req.params.blog_id,function(err,blog) {
		if (err)
			res.send(err);
		
		res.json(blog);
	});
};