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
			User.findById(blog.author, function(err, user) {
				if (err) {
					res.status(500).json(err);
					return;
				}
				if (req.headers && req.headers.authorization) {
				    var parts = req.headers.authorization.split(' ');
				    if (parts.length == 2) {
				        var scheme = parts[0];
				        var credentials = parts[1];
				        if (/^JWT/i.test(scheme)) {
				            var token = credentials;
				            if (user.JWT == token) {
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
						}
						else {
							res.status(401).json("Invalid token");
						}
					}
					else {
						res.status(401).json("Invalid token");
					}
				}
				else {
					res.status(401).json("Invalid token");
				}
			})
		}
		else {
			res.status(400).json('The input is not valid');
		}
	})
}