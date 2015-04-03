var assert = require('assert');
var request = require('supertest');
var app = require('../app');
var Blog = require('../models/Blog');
var Comment = require('../models/Comment');
var User = require('../models/User');

describe('Getting Blog test', function () {

    

    it('should return 200 response while accessing api', function (done) {
        request(app)
            .get('/api/blogs/4280209828')
            .set('Accept', 'application/json')
            .set('Authorization','JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImdveWFycGl0IiwiaGFuZGxlIjoiZ295YWwuYXJwaXQuOTEiLCJpYXQiOjE0Mjc5MDkzMDJ9.islU8i8oX-x1H68OgtThquigmurGOFvw3W6L8gMMq8Y')
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

            testUser = new User({
                handle: 'test',
                JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJoYW5kbGUiOiJ0ZXN0IiwiaWF0IjoxNDI4MDQxODUwfQ.p-MzDtdzopZ8sLj3ia23vIu51r9H9bey-KAogK6f9bo',
                username: 'test'
            });

            testUser.save(function(err) {
                if (err) throw err;

                testUser2 = new User({
                    handle: 'test2',
                    JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QyIiwiaGFuZGxlIjoidGVzdDIiLCJpYXQiOjE0MjgwNDQ2NTh9.9AOqM2DI8k2gruDt3KWt1VuZJZVESPdoWJEQ0aW2Zm0',
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
            .set('Authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QyIiwiaGFuZGxlIjoidGVzdDIiLCJpYXQiOjE0MjgwNDQ2NTh9.9AOqM2DI8k2gruDt3KWt1VuZJZVESPdoWJEQ0aW2Zm0')
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
            .set('Authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJoYW5kbGUiOiJ0ZXN0IiwiaWF0IjoxNDI4MDQxODUwfQ.p-MzDtdzopZ8sLj3ia23vIu51r9H9bey-KAogK6f9bo')
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
            .set('Authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QyIiwiaGFuZGxlIjoidGVzdDIiLCJpYXQiOjE0MjgwNDQ2NTh9.9AOqM2DI8k2gruDt3KWt1VuZJZVESPdoWJEQ0aW2Zm0')
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