/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */

/**
 * Test suite for TopBlogger updateBlog api.
 *
 * @version 1.0
 * @author panoptimum
 */
'use strict';

var _ = require('lodash'),
    Promise = require('bluebird'),
    app = require('../app'),
    mongoose = require('mongoose'),
    request = require('supertest'),
    Blog = require('../models/Blog'),
    User = require('../models/User'),
    assert = require('chai').assert,
    jwt = require('jsonwebtoken'),
    config = require('../config/config');

Promise.promisifyAll(request.Test.prototype);
// Array of test users
var users = [],
    // Array of test blogs
    blogs = [];



/**
 * Connect to db.
 */
function connectDB() {
    mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/topblogger');
}

/**
 * Disconnect from db.
 */
function disconnectDB() {
    mongoose.disconnect();
}

/**
 * Create Test Users in DB
 * @param {Array<String>} handles - handles of users to be created.
 * @param {Array} users - package local variable to store the created users
 *                        in order of handles.
 * @return {Promise} promise of test user creation
 */
function createUsers(handles) {
    return Promise.all(
        _.map(
            handles,
            function (handle) {
                var user = new User({
                    handle: handle,
                    username: handle,
                    JWT: jwt.sign({
                        username: handle,
                        handle: handle
                    }, config.JWT_secret)
                });
                return user.saveAsync();
            }
        )
    ).then(
        function (saved) {
            _.forEach(
                _.map(saved, function (item) {return item[0]; }),
                function (user) {
                    users.push(user);
                }
            );
        }
    );
}

/**
 * Remove Test Users from DB
 * @param {Array<String>} handles - handles of test users to be removed
 * @param {Array} users - package local variable storing users to be emptied after removal.
 * @return {Promise} promise of user removal
 */
function removeUsers(handles) {
    return Promise.all(
        _.map(
            handles,
            function (handle) {
                return User.findOne(
                    {handle: handle}
                ).execAsync(
                ).then(
                    function (user) {
                        if (user) {
                            return user.removeAsync();
                        }
                        return;
                    }
                );
            }
        )
    ).then(
        function () {
            // empty array
            users.length = 0;
        }
    );
}


/**
 * Create Test Blogs in DB
 * @param {Array} entries - an array of the form [{title: 'some_title', author: user}]
 *                          where title is the blog title and author is a User document
 * @param {Array} blogs - package local array to store the created blogs.
 * @return {Promise} a promise to create the blogs.
 */
function createBlogs(entries) {
    return Promise.all(
        _.map(
            entries,
            function (entry) {
                var now = Date.now(),
                    blog = new Blog({
                        title: entry.title,
                        slug: entry.title + '-slug',
                        createdDate: now,
                        lastUpdatedDate: now,
                        author: entry.author._id,
                        content: entry.title,
                        isPublished: false
                    });
                return blog.saveAsync();
            }
        )
    ).then(
        function (saved) {
            _.forEach(
                _.map(saved, function (item) {return item[0]; }),
                function (user) {
                    blogs.push(user);
                }
            );
        }
    );
}

/**
 * Remove Test Blogs from DB
 * @param {Array<String>} titles - an array of unique titles of blogs to delete
 * @param {Array} blogs - package local array of created blogs to be emptied after removal
 * @return {Promise} - promise of blog removal
 */
function removeBlogs(titles) {
    return Promise.all(
        _.map(
            titles,
            function (title) {
                return Blog.findOne(
                    {
                        title: title
                    }
                ).execAsync(
                ).then(
                    function (blog) {
                        if (blog) {
                            return blog.removeAsync();
                        }
                        return;
                    }
                );
            }
        )
    ).then(
        function () {
            blogs.length = 0;
        }
    );
}

describe(
    'Update Blog API -- Unit tests',
    function () {
        // test users to be created
        var USERS = ['user1', 'user2'],
            // [[title, author]] of test blogs, where authore is index of author in package local `users'
            BLOGS = [['blog1', 0], ['blog2', 0], ['blog3', 1]],
            entries = _.map(
                BLOGS,
                function (entry) {
                    return {
                        title: entry[0],
                        author: users[entry[1]]
                    };
                }
            ),
            titles = _.pluck(entries, 'title');
        before(
            'Insert users into db.',
            function () {
                // connectDB();
                return removeUsers(USERS).then(_.partial(createUsers, USERS)).then(
                    function () {
                        entries = _.map(
                            BLOGS,
                            function (entry) {
                                return {
                                    title: entry[0],
                                    author: users[entry[1]]
                                };
                            }
                        );
                    }
                );
            }
        );

        after(
            'Remove users from db.',
            _.partial(removeUsers, USERS)
        );

        describe(
            'Invalid Requests',
            function () {
                beforeEach(
                    'Insert blogs into db.',
                    function () {
                        return removeBlogs(titles)
                            .then(_.partial(createBlogs, entries));
                    }
                );


                afterEach(
                    'Remove blogs from db.',
                    _.partial(removeBlogs, titles)
                );

                it(
                    'should require authorization.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/aaaaaaaaaaaaaaaaaaaaaaaa')
                            .send({content: 'content'})
                            .expect('Content-Type', /json/)
                            .expect(401)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        {error: 'Invalid token'},
                                        "invalid token"
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should require request data.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/aaaaaaaaaaaaaaaaaaaaaaaa')
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .send()
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        {error: 'No blog data provided.'},
                                        "No blog data."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that user updates only legal fields.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[0]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .send({foobar: 'abcdefg'})
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        { error: 'Illegal field detected in submitted data.' },
                                        "foobar is no legal blog field."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that title is string.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[0]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .set('Content-Type', 'application/json')
                            .send({title: [1]})
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        { error: 'Illegal field detected in submitted data.' },
                                        "title must be string."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that slug is string.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[0]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .set('Content-Type', 'application/json')
                            .send({slug: [1]})
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        { error: 'Illegal field detected in submitted data.' },
                                        "slug must be string."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that tags is array.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[0]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .set('Content-Type', 'application/json')
                            .send({tags: 'foobar'})
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        { error: 'Illegal field detected in submitted data.' },
                                        "tags must be array."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that content is string.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[0]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .set('Content-Type', 'application/json')
                            .send({content: [1]})
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        { error: 'Illegal field detected in submitted data.' },
                                        "Content must be string."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that blog id is object id.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + '$$$$$$$$$$$$$$$$$$$$$$$')
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .set('Content-Type', 'application/json')
                            .send({title: 'title'})
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        { error: 'Illegal format for parameter Blog ID.' },
                                        "Invalid blog id."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that document to be updated does exist.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + 'ffffffffffffffffffffffff')
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .set('Content-Type', 'application/json')
                            .send({title: "foobar"})
                            .expect('Content-Type', /json/)
                            .expect(404)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        { error: 'The requested resource does not exist.' },
                                        "No upsert allowed."
                                    );
                                    done();
                                }
                            );
                    }
                );


                it(
                    'should verify that user is author.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[2]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .send({content: 'abcdefg'})
                            .expect('Content-Type', /json/)
                            .expect(403)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        {
                                            error: 'The user is not allowed to perform the update on the resource.'
                                        },
                                        "User must be author."
                                    );
                                    done();
                                }
                            );
                    }
                );

                it(
                    'should verify that slug is unique per user.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[0]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .send({slug: blogs[1].slug})
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    assert.deepEqual(
                                        res.body,
                                        {
                                            error: 'The changed slug will not be unique per user anymore.'
                                        },
                                        "Slug must be unique per user."
                                    );
                                    done();
                                }
                            );
                    }
                );
            }
        );

        describe(
            'Valid Requests',
            function () {
                beforeEach(
                    'Insert blogs into db.',
                    function () {
                        return removeBlogs(titles)
                            .then(_.partial(createBlogs, entries));
                    }
                );
                afterEach(
                    'Remove blogs from db.',
                    function () {
                        _.partial(removeBlogs, titles);
                    }
                );

                it(
                    'should update the blog.',
                    function (done) {
                        request(app)
                            .put('/api/blogs/' + blogs[0]._id)
                            .set('Authorization', 'JWT ' + users[0].JWT)
                            .send({content: 'new content'})
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(
                                function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    Blog.findByIdAsync(blogs[0]._id)
                                        .then(
                                            function (data) {
                                                assert.equal(data.content, 'new content', 'updated in db');
                                                assert.equal(
                                                    res.body.content,
                                                    'new content',
                                                    'updated value returned to caller'
                                                );
                                                done();
                                            }
                                        );
                                }
                            );
                    }
                );
            }
        );
    }
);
