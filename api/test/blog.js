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
    var testUser, testComment, testBlog;

    before(function(callback) {
        User.remove({
            $or: [ {
                username: 'test'
            }, {
                username: 'test2'
            }]
        }, function(err) {
            if (err) throw err;

            var testUser = new User({
                handle: 'test',
                JWT: tests_config.JWT,
                username: 'test'
            });

            testUser.save(function(err) {
                if (err) throw err;

                var testUser2 = new User({
                    handle: 'test2',
                    JWT: tests_config.JWT,
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

    it("should return 200 when liking someone else's comment", function(callback) {
        request(app)
            .post('/api/blogs/' + testBlog._id + '/comments/' + testComment._id + '/like')
            .set('Authorization', 'JWT '+ tests_config.JWT)
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

describe('Create Blog', function() {

    it('should return 201 response for basic new blog creation', function(done) {
        request(app)
            .post('/api/blogs')
            .set('Content-Type', 'application/json')
            .set('Authorization','JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImdveWFycGl0IiwiaGFuZGxlIjoiZ295YWwuYXJwaXQuOTEiLCJpYXQiOjE0Mjc5MDkzMDJ9.islU8i8oX-x1H68OgtThquigmurGOFvw3W6L8gMMq8Y')
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
            .set('Authorization','JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImdveWFycGl0IiwiaGFuZGxlIjoiZ295YWwuYXJwaXQuOTEiLCJpYXQiOjE0Mjc5MDkzMDJ9.islU8i8oX-x1H68OgtThquigmurGOFvw3W6L8gMMq8Y')
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
