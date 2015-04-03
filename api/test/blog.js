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
var assert = require('chai').assert;


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
                assert.property(rsp.body, 'message');
                assert.include(rsp.body.message, 'Cast to ObjectId failed for value');
            })
            .end(done);
    });

    // ToDo:
    // Add more tests here when the other APIs are available.
    // For instance:
    //1. create a new blog -> then publish it
    //2. get unpublished blogs -> publish an existing unpublished blog
});
