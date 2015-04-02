var Blog = require('../models/Blog');
var User = require('../models/User');
var apiRoute = require('../routes/api');

exports.getBlog = function(req,res) {


	Blog.findById(req.params.blog_id,function(err,blog) {
		if (err)
			res.send(err);

		res.json(blog);
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
}