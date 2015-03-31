/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger app auth test suite.
 *
 * @version 1.0
 * @author kiri4a
 */
"use strict";

var request = require('supertest');
var app = require('../app');

describe('TopBlogger app API auth', function () {

    it('should expose api endpoint', function (done) {
        request(app)
            .get('/api')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('should return 401 for missing JWT token', function (done) {
        request(app)
            .get('/api/secret')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401, done);
    });

    it('should return 401 for empty JWT token', function (done) {
        request(app)
            .get('/api/secret')
            .set('Accept', 'application/json')
            .set('Authorization', '')
            .expect('Content-Type', /json/)
            .expect(401, done);
    });

    it('should return 401 for invalid JWT token', function (done) {
        request(app)
            .get('/api/secret')
            .set('Accept', 'application/json')
            .set('Authorization', 'asdasdasd')
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
});

describe('TopBlogger app WEB auth', function () {

    it('should expose /register', function (done) {
        request(app)
            .get('/register')
            .expect('Content-Type', /html/)
            .expect(200, done);
    });

    it('should expose /login', function (done) {
        request(app)
            .get('/login')
            .expect('Content-Type', /html/)
            .expect(200, done);
    });

    it('should expose /logout', function (done) {
        request(app)
            .get('/login')
            .expect('Content-Type', /html/)
            .expect(200, done);
    });

});
