/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger app blog test suite.
 *
 * @version 1.0
 * @author kiri4a and other
 */
"use strict";

var request = require('supertest');
var app = require('../app');
var tests_config = require('./config/tests_config');
var chaiAssert = require('chai').assert;
var assert = require('assert');
var Blog = require('../models/Blog');
var Comment = require('../models/Comment');
var User = require('../models/User');
var UserVoteBlog = require('../models/UserVoteBlog');

var UserViewBlog = require('../models/UserViewBlog');

describe('Getting Blog test', function () {
  it('should return 200 response while accessing api', function (done) {
    request(app)
      .get('/api/blogs/4280209828')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err) {
        if (err) {
          throw err;
        }
        done();
      });
  });
});

describe('Publishing Blog test', function () {
  it('should require user authentication', function (done) {
    request(app)
      .post('/api/blogs/999/publish')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('should return 404 response for not existing blog_id', function (done) {
    request(app)
      .post('/api/blogs/999/publish')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(404)
      .expect(function (rsp) {
        chaiAssert.property(rsp.body, 'message');
        chaiAssert.include(rsp.body.message, 'Cast to ObjectId failed for value');
      })
      .end(done);
  });

  // ToDo:
  // Add more tests here when the other APIs are available.
  // For instance:
  //1. create a new blog -> then publish it
  //2. get unpublished blogs -> publish an existing unpublished blog
});

describe('Liking blog comment', function() {
  var testUser, testUser2, testComment, testBlog;

  before(function(callback) {
    User.remove({
      $or: [ {
        username: 'kiko'
      }, {
        username: 'test2'
      }]
    }, function(err) {
      if (err) throw err;

      var testUser = new User({
        handle: 'kiri4a',
        JWT: tests_config.JWT,
        username: 'kiko'
      });

      testUser.save(function(err) {
        if (err) throw err;

        testUser2 = new User({
          handle: 'test2',
          JWT: tests_config.JWT2,
          username: 'test2'
        });

        testUser2.save(function(err) {
          if (err) throw err;

          testComment = new Comment({
            author: testUser,
            content: 'content',
            lastUpdatedDate: (new Date()).getTime(),
            numOfDislikes: 0,
            numOfLikes: 0,
            postedDate: (new Date()).getTime()
          });

          testBlog = new Blog({
            author: testUser,
            title: 'Test Title',
            content: 'Test content',
            isPublished: false,
            createdDate: (new Date()).getTime(),
            lastUpdatedDate: (new Date()).getTime(),
            slug: 'test-title',
            comments: [
              testComment
            ]
          });

          testBlog.save(callback);
        });
      });
    });
  });

  it('should return 200 when liking someone else\'s comment', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/like')
      .set('Authorization', 'JWT '+ tests_config.JWT2)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        Blog.findById(testBlog._id, function(err, blog) {
          if (err) {
            throw err;
          }

          assert.strictEqual(1, blog.comments[0].numOfLikes);
          assert.deepEqual(testUser2._id, blog.comments[0].likeUsers[0]);

          callback();
        });
      });
  });

  it('should return 403 when liking own comment', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/like')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect(403)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        callback();
      });
  });

  it('should return 403 when liking comment twice', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/like')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect(403)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        callback();
      });
  });

  it('should return 401 when no authorization is given', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/like')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        callback();
      });
  });
});

describe('Disliking blog comment', function() {
  var testUser, testUser2, testComment, testComment2, testBlog;

  before(function(callback) {
    User.remove({
      $or: [ {
        username: 'kiko'
      }, {
        username: 'test2'
      }]
    }, function(err) {
      if (err) throw err;

      testUser = new User({
        handle: 'kiri4a',
        JWT: tests_config.JWT,
        username: 'kiko'
      });

      testUser.save(function(err) {
        if (err) throw err;

        testUser2 = new User({
          handle: 'test2',
          JWT: tests_config.JWT2,
          username: 'test2'
        });

        testUser2.save(function(err) {
          if (err) throw err;

          testComment = new Comment({
            author: testUser,
            content: 'awesome comment',
            lastUpdatedDate: (new Date()).getTime(),
            numOfDislikes: 0,
            numOfLikes: 0,
            postedDate: (new Date()).getTime()
          });
		  
		  testComment2 = new Comment({
            author: testUser2,
            content: 'awesome comment 2',
            lastUpdatedDate: (new Date()).getTime(),
            numOfDislikes: 0,
            numOfLikes: 0,
            postedDate: (new Date()).getTime()
          });

          testBlog = new Blog({
            author: testUser,
            title: 'Test Title',
            content: 'Test content',
            isPublished: false,
            createdDate: (new Date()).getTime(),
            lastUpdatedDate: (new Date()).getTime(),
            slug: 'test-title',
            comments: [
              testComment,
			  testComment2
            ]
          });

          testBlog.save(callback);
        });
      });
    });
  });

  it('should return 200 when disliking someone else\'s comment', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/dislike')
      .set('Authorization', 'JWT '+ tests_config.JWT2)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        Blog.findById(testBlog._id, function(err, blog) {
          if (err) {
            throw err;
          }

          assert.strictEqual(1, blog.comments[0].numOfDislikes);
          assert.deepEqual(testUser2._id, blog.comments[0].dislikeUsers[0]);

          callback();
        });
      });
  });
  
  it('should return 200 when disliking someone else\'s already liked comment', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment2._id + '/like')
      .set('Authorization', 'JWT '+ tests_config.JWT)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
		request(app)
		  .post('/api/blogs/' + testBlog._id + '/comments/' + testComment2._id + '/dislike')
		  .set('Authorization', 'JWT '+ tests_config.JWT)
		  .expect(200)
		  .end(function(err, res) {
				Blog.findById(testBlog._id, function(err, blog) {
				  if (err) {
					throw err;
				  }

				  assert.strictEqual(1, blog.comments[1].numOfDislikes);
				  assert.strictEqual(0, blog.comments[1].numOfLikes);
				  chaiAssert.isUndefined(blog.comments[1].likeUsers[0]);
				  assert.deepEqual(testUser._id, blog.comments[1].dislikeUsers[0]);

				  callback();
				});
		  });
		
      });
  });

  it('should return 403 when disliking own comment', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/dislike')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect(403)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        callback();
      });
  });

  it('should return 403 when disliking comment twice', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/dislike')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect(403)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        callback();
      });
  });

  it('should return 401 when no authorization is given', function(callback) {
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/dislike')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        callback();
      });
  });
});


describe('Mark Blog As Viewed test', function () {
  var testUser, testBlog1, testBlog2;

  before(function(callback) {
    User.remove({
      $or: [ {
        username: 'kiko'
      }, {
        username: 'test2'
      }]
    }, function(err) {
      if (err) throw err;

      testUser = new User({
        handle: 'kiri4a',
        JWT: tests_config.JWT,
        username: 'kiko'
      });

      testUser.save(function(err) {
        if (err) throw err;

        var testUser2 = new User({
          handle: 'test2',
          JWT: tests_config.JWT2,
          username: 'test2'
        });

        testUser2.save(function(err) {
          if (err) throw err;

          testBlog1 = new Blog({
            author: testUser,
            title: 'Test Title 1',
            content: 'Test content 1',
            isPublished: false,
            createdDate: (new Date()).getTime(),
            lastUpdatedDate: (new Date()).getTime(),
            slug: 'test-title-1',
            comments: []
          });

          testBlog1.save(function(err) {
            if(err) throw err;

            testBlog2 = new Blog({
              author: testUser2,
              title: 'Test Title 2',
              content: 'Test content 2',
              isPublished: false,
              createdDate: (new Date()).getTime(),
              lastUpdatedDate: (new Date()).getTime(),
              slug: 'test-title-2',
              comments: []
            });

            testBlog2.save(callback);
          });


        });
      });
    });
  });

  it('should return 401 response when no authentication is given', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog2._id + '/view')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('should return 404 response for not existing blog_id', function (done) {
    request(app)
      .post('/api/blogs/999/view')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(404)
      .expect(function (res) {
        chaiAssert.property(res.body, 'message');
        chaiAssert.include(res.body.message, 'Cast to ObjectId failed for value');
      })
      .end(done);
  });

  it('should return 200 response for marking blog as viewed', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog2._id + '/view')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });


  it('should return 403 response for marking blog as viewed more than once', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog2._id +'/view')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(403)
      .end(done);
  });


  it('should return 403 response for marking blog as viewed by the author of blog', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog1._id +'/view')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(403)
      .end(done);
  });

});

describe('Up-vote Blog test', function () {
  var testUser, testBlog1, testBlog2;

  before(function(callback) {
    User.remove({
      $or: [ {
        username: 'kiko'
      }, {
        username: 'test2'
      }]
    }, function(err) {
      if (err) throw err;

      testUser = new User({
        handle: 'kiri4a',
        JWT: tests_config.JWT,
        username: 'kiko'
      });

      testUser.save(function(err) {
        if (err) throw err;

        var testUser2 = new User({
          handle: 'test2',
          JWT: tests_config.JWT2,
          username: 'test2'
        });

        testUser2.save(function(err) {
          if (err) throw err;

          testBlog1 = new Blog({
            author: testUser,
            title: 'Test Title 1',
            content: 'Test content 1',
            isPublished: false,
            createdDate: (new Date()).getTime(),
            lastUpdatedDate: (new Date()).getTime(),
            slug: 'test-title-1',
            comments: []
          });

          testBlog1.save(function(err) {
            if(err) throw err;

            testBlog2 = new Blog({
              author: testUser2,
              title: 'Test Title 2',
              content: 'Test content 2',
              isPublished: false,
              createdDate: (new Date()).getTime(),
              lastUpdatedDate: (new Date()).getTime(),
              slug: 'test-title-2',
              comments: []
            });

            testBlog2.save(callback);
          });


        });
      });
    });
  });

  it('should return 401 response when no authentication is given', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog2._id + '/upvote')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('should return 404 response for not existing blog_id', function (done) {
    request(app)
      .post('/api/blogs/999/upvote')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(404)
      .expect(function (res) {
        chaiAssert.property(res.body, 'message');
        chaiAssert.include(res.body.message, 'Cast to ObjectId failed for value');
      })
      .end(done);
  });

  it('should return 200 response for up-voting blog', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog2._id + '/upvote')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });

  it('should return 403 response for up-voting blog by the author of blog', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog1._id +'/upvote')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(403)
      .end(done);
  });

});

describe('Down-vote Blog test', function () {
  var testUser, testBlog1, testBlog2;

  before(function(callback) {
    User.remove({
      $or: [ {
        username: 'kiko'
      }, {
        username: 'test2'
      }]
    }, function(err) {
      if (err) throw err;

      testUser = new User({
        handle: 'kiri4a',
        JWT: tests_config.JWT,
        username: 'kiko'
      });

      testUser.save(function(err) {
        if (err) throw err;

        var testUser2 = new User({
          handle: 'test2',
          JWT: tests_config.JWT2,
          username: 'test2'
        });

        testUser2.save(function(err) {
          if (err) throw err;

          testBlog1 = new Blog({
            author: testUser,
            title: 'Test Title 1',
            content: 'Test content 1',
            isPublished: false,
            createdDate: (new Date()).getTime(),
            lastUpdatedDate: (new Date()).getTime(),
            slug: 'test-title-1',
            comments: []
          });

          testBlog1.save(function(err) {
            if(err) throw err;

            testBlog2 = new Blog({
              author: testUser2,
              title: 'Test Title 2',
              content: 'Test content 2',
              isPublished: false,
              createdDate: (new Date()).getTime(),
              lastUpdatedDate: (new Date()).getTime(),
              slug: 'test-title-2',
              comments: []
            });

            testBlog2.save(callback);
          });


        });
      });
    });
  });

  it('should return 401 response when no authentication is given', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog2._id + '/votes/downvote')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('should return 404 response for not existing blog_id', function (done) {
    request(app)
      .post('/api/blogs/999/votes/downvote')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(404)
      .expect(function (res) {
        chaiAssert.property(res.body, 'message');
        chaiAssert.include(res.body.message, 'Cast to ObjectId failed for value');
      })
      .end(done);
  });

  it('should return 200 response for down-voting blog', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog2._id + '/votes/downvote')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });

  it('should return 403 response for down-voting blog by the author of blog', function (done) {
    request(app)
      .post('/api/blogs/' + testBlog1._id +'/votes/downvote')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(403)
      .end(done);
  });
});

describe('Deleting Blog test using POST /blogs/{id}', function () {

  var sampleUser1, sampleUser2, sampleBlog1;
  before(function(done) {
    sampleUser1 = new User({
      handle: 'a',
      JWT: tests_config.JWT
    });
    sampleUser1.save();
    sampleUser2 = new User({
      handle: 'b',
      JWT: tests_config.JWT2
    })
    sampleUser2.save();

    sampleBlog1 = new Blog({
      author: sampleUser1,
      title: 'Blog Title for test',
      content: 'This is a sample blog content for test',
      isPublished: false,
      createdDate: (new Date).getTime(),
      lastUpdatedDate: (new Date).getTime(),
      slug: 'slug1'
    });
    sampleBlog1.save(function() {
      done();
    });
  })

  it('should return 403 when user othen than author tries to delete a post', function(done) {
    request(app)
      .delete('/api/blogs/' + sampleBlog1._id)
      .set('Authorization', 'JWT ' + tests_config.JWT2)
      .expect('Content-Type', /json/)
      .expect(403)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('should return 401 when authorization is not provided', function(done) {
    request(app)
      .delete('/api/blogs/' + sampleBlog1._id)
      .expect('Content-Type', /json/)
      .expect(401)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('should return 200 response while deleting a blog', function (done) {
    request(app)
      .delete('/api/blogs/' + sampleBlog1._id)
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('should return 400 response when trying to delete a non existent blog post', function (done) {
    request(app)
      .delete('/api/blogs/' + sampleBlog1._id)
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });
});

describe('Getting Blog Api test', function () {

  var user,Blog1;
  before(function(done) {

    user = new User({
      handle: 'jeffdonthemic'
    });

    Blog1 = new Blog({
      author: user,
      title: 'Blog Title for test',
      content: 'This is a sample blog content for test',
      isPublished: false,
      createdDate: (new Date).getTime(),
      lastUpdatedDate: (new Date).getTime(),
      slug: 'slug1'
    });
    Blog1.save(function() {
      done();
    });
  });

  it('should return 200 response while accessing api', function (done) {
    request(app)
      .get('/api/blogs/4280209828')
      .set('Accept', 'application/json')
      .set('Authorization','JWT ' + tests_config.JWT)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err,res) {
        if (err) {
          throw err;
        }
        done();
      })
  });

  
});

/*
 Tests for creating new blog
 */
describe('Create Blog', function() {

    it('should return 201 response for basic new blog creation', function(done) {
        request(app)
            .post('/api/blogs')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'JWT ' + tests_config.JWT)
            .send({
                "title": "title 01",
                "slug": "slug 01",
                "publishedDate": 123456,
                "createdDate": 123456,
                "lastUpdatedDate": 123456,
                "content": "content 01",
                "isPublished": false,
                "author" : {
                    "_id": "551ee459b49473f52409f5ce",
                    "handle" : "user1"
                },
                "tags" : [
                    {
                        "name": "tag01"
                    },
                    {
                        "name": "tag02"
                    }
                    ]
            })
            .expect('Content-Type', /json/)
            .expect(201)
            .end(function(err,res) {
            	if (err) {
            		throw err;
            	}
           		done();
           	})
    })

    it('should return 400 response for invalid input', function(done) {
        request(app)
            .post('/api/blogs')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'JWT ' + tests_config.JWT)
            .send({
                "title": "title 01"
            })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err,res) {
            	if (err) {
            		throw err;
            	}
           		done();
           	})
    })

});

/*
 Testing function for Adding ,Updating and Deleting the comments
 */

describe('Test adding,updating,deleting the comments' , function() {
  
  var testUser, testUser2, testComment, testBlog;
  before(function(done) {
    User.remove({
      $or: [ {
        username: 'kiko'
      }, {
        username: 'test2'
      }]
    }, function(err) {
      if (err) throw err;

      var testUser = new User({
        handle: 'kiri4a',
        JWT: tests_config.JWT,
        username: 'kiko'
      });

      testUser.save(function(err) {
        if (err) throw err;

        testUser2 = new User({
          handle: 'test2',
          JWT: tests_config.JWT2,
          username: 'test2'
        });

        testUser2.save(function(err) {
          if (err) throw err;

          testComment = new Comment({
            author: testUser,
            content: 'content',
            lastUpdatedDate: (new Date()).getTime(),
            numOfDislikes: 0,
            numOfLikes: 0,
            postedDate: (new Date()).getTime()
          });

          testBlog = new Blog({
            author: testUser,
            title: 'Test for adding comment',
            content: 'Test for adding comment',
            isPublished: false,
            createdDate: (new Date()).getTime(),
            lastUpdatedDate: (new Date()).getTime(),
            slug: 'test-title',
            comments: [testComment]
          });

          testBlog.save(done);
        });
      });
    });
  });
  
  it('Check function for adding comments', function (done) {

    var isValidOrg = function(res) {
      var textCommented = res.body.comments[1].content;
      assert.equal(textCommented,'sggge')
    };
    request(app)
      .post('/api/blogs/' + testBlog._id + '/comments')
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .send({"contentText":"sggge"})
      .expect(200)
      .expect(isValidOrg)
      .end(done)
  });



  it('Check function for updating comments', function (done) {

    var isValidOrg = function(res) {
      var textCommented = res.body.comments[0].content;
      console.log("content is " + res.body.comments[0].content);
      assert.equal(textCommented,'UpdatedContent')
    };
    request(app)
      .put('/api/blogs/' + testBlog._id + '/comments/' + testBlog.comments[0]._id )
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .send({"contentText":"UpdatedContent"})
      .expect(200)
      .expect(isValidOrg)
      .end(done)
  });
  
  it('Testing for  the comment Id is deleted',function(done){
    
    var isValidOrg = function(res) {
      assert.equal(res.body.comments.length,1)
    };
    request(app)
      .delete('/api/blogs/' + testBlog._id +'/comments/' + testBlog.comments[0]._id)
      .set('Authorization', 'JWT ' + tests_config.JWT)
      .expect(200)
      .expect(isValidOrg)
      .end(done)
  })

});
