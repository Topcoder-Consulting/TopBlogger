/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger API GET /blogs test suite.
 * Tests here use mocked blog and user data, so please load the test data before testing:
 * $ wget http://localhost:3000/tmp/load
 * This command will delete existing data in the database and load the mocked data. Be carefule about this! 
 *
 * @version 1.0
 * @author jzh08 
 */
"use strict";

var app = require('../app'); 
var request = require('supertest'); 
var assert = require('assert');
var expect = require('chai').expect;
var config = require('../config/config')

var JWTToken = config.JWTToken; 
var APIUrl = "/api/blogs"; 

describe('TopBlogger Node API GET /blogs Authorization and General Test', function () {
	it('should return 401 if JWTToken is missing', function (done) {
        request(app)
        	.get(APIUrl)
            .expect('Content-Type', /json/)
            .expect(401, done);
    });

    it('should return 200 if token is set correctly', function (done) {
        request(app)
        	.get(APIUrl)
            .set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200,done);
    });

    it('should return 400 if an unsupported parameter is provided', function (done) {
    	var param = 'sfsafda';
        request(app)
        	.get(APIUrl+'?tag='+param)
            .set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err,res) {
            	if(err)
            		done(err);
            	assert.equal(res.body.message,'unsupported parameter: '+param); 
            });
        param = "tag"; 
        request(app)
        	.get(APIUrl+'?tag='+param)
            .set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err,res) {
            	if(err)
            		done(err);
            	assert.equal(res.body.message,'unsupported parameter: '+param);
            	done();
            });
    });

    it('should return at most 10 blogs if no parameter set', function (done) {
        request(app)
        	.get(APIUrl)
            .set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
            	if(err) 
            		done(err);
           		assert.equal(res.body.total,8);
           		assert.equal(res.body.values.length,8);
           		done();
            });
    });
});

describe('TopBlogger Node API GET /blogs by handle', function () {

	it('should return 400 if provided an unsupported parameter name HANDLE', function (done) {
        request(app)
        	.get(APIUrl+'?HANDLE=jzh01')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.message,"unsupported parameter: HANDLE");
           		done();
            });
    });

	it('should return empty blogs list if the user handle does not exist', function (done) {
        request(app)
        	.get(APIUrl+'?handle=nonExistUser')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,0);
           		assert.equal(res.body.values.length,0);
           		done();
            });
    });

    it('should return 2 blogs if user handle is jzh01', function (done) {
        request(app)
        	.get(APIUrl+'?handle=jzh01')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		assert.equal(res.body.totalPages,2/10);
           		done();
            });
    });

    it('should return 1 blogs if limit is set to 1 and handle set to jzh01',function(done){
    	request(app)
    		.get(APIUrl+'?handle=jzh01&limit=1')
    		.set('Authorization','JWT ' + config.JWTToken)
			.expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,2); 
           		assert.equal(res.body.values.length,1);
           		done();
           	});
    });

});

describe('TopBlogger Node API GET /blogs by handle and slug', function () {

	it('should return empty blog list if slug does not exactly match any', function (done) {
        request(app)
        	.get(APIUrl+'?handle=jzh01&slug=randomslug-safasfda')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,0);
           		assert.equal(res.body.values.length,0);
           		done();
            });
    });

	it('should return 2 blogs if slug is set to java-slug and handle set to jzh01', function (done) {
        request(app)
        	.get(APIUrl+'?handle=jzh01&slug=java-slug')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		done();
            });
    });

});

describe('TopBlogger Node API GET /blogs by two or more tags', function () {

	it('should return empty blog list if no matched tags', function (done) {
        request(app)
        	.get(APIUrl+'?tags=NoTag,NewTag')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,0);
           		assert.equal(res.body.values.length,0);
           		done();
            });
    });

	it('should return 2 blogs if tags is set to one tag : java', function (done) {
        request(app)
        	.get(APIUrl+'?tags=java')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		done();
            });
    });

    it('should return 2 blogs if tags is set to one tag : python', function (done) {
        request(app)
        	.get(APIUrl+'?tags=python')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		done();
            });
    });

    it('should return 2 blogs if tags is set to one tag : js', function (done) {
        request(app)
        	.get(APIUrl+'?tags=js')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		done();
            });
    });

    it('should return 6 blogs if tags is set to 3 tags: java,python,js', function (done) {
        request(app)
        	.get(APIUrl+'?tags=js,python,java')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,6);
           		assert.equal(res.body.values.length,6);
           		done();
            });
    });

    it('should return 8 blogs if tags is set to one tag : blog', function (done) {
        request(app)
        	.get(APIUrl+'?tags=blog')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,8);
           		assert.equal(res.body.values.length,8);
           		done();
            });
    });

});


describe('TopBlogger Node API GET /blogs by title', function () {

	it('should return empty blog list if no blog\'s title regex match the provided title', function (done) {
        request(app)
        	.get(APIUrl+'?title=averylongnonexistingtitle')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,0);
           		assert.equal(res.body.values.length,0);
           		done();
            });
    });

	it('should return 1 blog if title is : Title 1', function (done) {
        request(app)
        	.get(APIUrl+'?title=Title%201')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,1);
           		assert.equal(res.body.values.length,1);
           		done();
            });
    });

    it('should return 8 blogs if title is : Blog Title', function (done) {
        request(app)
        	.get(APIUrl+'?title=Blog%20Title')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,8);
           		assert.equal(res.body.values.length,8);
           		done();
            });
    });

});

describe('TopBlogger Node API GET /blogs by keyword', function () {
	it('should return empty blog list if the provided keyword match regex match no blog item\'s title, content and tags', function (done) {
        request(app)
        	.get(APIUrl+'?keyword=averylongkeywordthatmatchesnothing')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,0);
           		assert.equal(res.body.values.length,0);
           		done();
            });
    });

	it('should return 2 blogs if keyword is java', function (done) {
        request(app)
        	.get(APIUrl+'?keyword=java')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		done();
            });
    });

    it('should return 8 blogs if keyword is blog', function (done) {
        request(app)
        	.get(APIUrl+'?keyword=blog')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		if(err)
           			done(err);
           		assert.equal(res.body.total,8);
           		assert.equal(res.body.values.length,8);
           		done();
            });
    });

});

describe('TopBlogger Node API GET /blogs by publishedDate range', function () {

	it('should return 400 if input publishedDate is invalid number', function (done) {
        request(app)
        	.get(APIUrl+'?publishedDateFrom=from456&publishedDateTo=to123')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(400,done);
    });

	it('should return 400 if input publishedDate range is invalid', function (done) {
		var from = new Date(2015,3,3).getTime();
		var to = new Date(2015,3,2).getTime();
        request(app)
        	.get(APIUrl+'?publishedDateFrom='+from + '&publishedDateTo='+to)
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(400,done);
    });

    it('should return 2 blogs if input publishedDate range is 2000-01-01~2020-01-01 and handle=jzh03', function (done) {
		var from = new Date(2000,0,1).getTime();
		var to = new Date(2020,0,1).getTime();
        request(app)
        	.get(APIUrl+'?publishedDateFrom='+from + '&publishedDateTo='+to + '&handle=jzh03')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		done();
            });
    });
});

describe('TopBlogger Node API GET /blogs sortBy and sortType', function () {
	it('should return 400 if input sortBy is invalid', function (done) {
        request(app)
        	.get(APIUrl+'?sortBy=nonExistType')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(400,done);
    });

    it('should return 400 if input sortType is invalid', function (done) {
        request(app)
        	.get(APIUrl+'?sortType=ascdesc')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(400,done);
    });

    it('should return blogs in decrease order by publishedDate in default', function (done) {
        request(app)
        	.get(APIUrl+'?handle=jzh02')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
           		assert.equal(res.body.total,2);
           		assert.equal(res.body.values.length,2);
           		expect(res.body.values[0].publishedDate).to.be.above(res.body.values[1].publishedDate);
           		done();
            });
    });

    it('should return blogs in increase order if sortType set to asc', function (done) {
        request(app)
        	.get(APIUrl+'?sortType=asc&handle=jzh01')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
            	if(err)
            		done(err);
            	assert.equal(res.body.total,2);
            	assert.equal(res.body.values.length,2); 
            	expect(res.body.values[0].publishedDate).to.be.below(res.body.values[1].publishedDate);
            	done();
            });
    });

});

describe('TopBlogger Node API GET /blogs pagination', function () {
	it('should return all 8 blogs if limit is set to -1', function (done) {
        request(app)
        	.get(APIUrl+'?limit=-1')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
            	if(err)
            		done(err);
            	assert.equal(res.body.total,8); 
            	assert.equal(res.body.totalPages,1);
            	assert.equal(res.body.values.length,8);
            	done();
            });
    });

    it('should return 4 blogs if limit is set to 4, and totalPages is set to 2', function (done) {
        request(app)
        	.get(APIUrl+'?limit=4')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
            	if(err)
            		done(err);
            	assert.equal(res.body.total,8); 
            	assert.equal(res.body.totalPages,2);
            	assert.equal(res.body.values.length,4);
            	done();
            });
    });

    it('should return 2 java/python taged blog, with total 4 blogs divided into two pages if limit is set to 2', function (done) {
        request(app)
        	.get(APIUrl+'?limit=2&tags=java,python')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
            	if(err)
            		done(err);
            	assert.equal(res.body.total,4); 
            	assert.equal(res.body.totalPages,2);
            	assert.equal(res.body.values.length,2);
            	done();
            });
    });

     it('should work with complext query conditions', function (done) {
        request(app)
        	.get(APIUrl+'?limit=2&tags=java,python&sortType=asc&keyword&title=Blog')
        	.set('Authorization','JWT ' + config.JWTToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res){
            	if(err)
            		done(err);
            	assert.equal(res.body.total,4); 
            	assert.equal(res.body.totalPages,2);
            	assert.equal(res.body.values.length,2);
            	expect(res.body.values[0].publishedDate).to.be.below(res.body.values[1].publishedDate);
            	done();
            });
    });
});