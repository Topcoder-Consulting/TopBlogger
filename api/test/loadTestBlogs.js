/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger API test GET /blogs database setup 
 *
 * @version 1.0
 * @author jzh08 
 */
"use strict";

var Blog = require('../models/Blog'); 
var User = require('../models/User'); 
var Tag  = require('../models/Tag'); 
var Comment = require('../models/Comment'); 
var mongoose = require('mongoose');

function loadBlogs(){

//mock users
var user1 = new User({
    handle: 'jzh01'
});
var user2 = new User({
    handle: 'jzh02'
});
var user3 = new User({
    handle: 'jzh03'
});
var user4 = new User({
    handle: 'jzh04'
});
user1.save(function(err){
    if(err)
        console.log('create user1 fail');
});
user2.save(function(err){
    if(err)
        console.log('create user2 fail');
});
user3.save(function(err){
    if(err)
        console.log('create user3 fail');
});
user4.save(function(err){
    if(err)
        console.log('create user4 fail');
});

//mock tags 
var javaTag = new Tag({
    name: 'java'
});
javaTag.save(function(err){
    if(err)
        console.log('create javaTag fail');
});
var cppTag = new Tag({
    name: 'c++'
});
cppTag.save(function(err){
    if(err)
        console.log('create cppTag fail');
});
var pythonTag = new Tag({
    name: 'python'
});
pythonTag.save(function(err){
    if(err)
        console.log('create pythonTag fail');
});
var jsTag = new Tag({
    name: 'js'
});
jsTag.save(function(err){
    if(err)
        console.log('create jsTag fail');
});
var blogTag = new Tag({
    name: 'blog'
});
blogTag.save(function(err){
    if(err)
        console.log('create blogTag fail');
});

Blog.remove(null,function(err,res){
    if(err)
        console.log("remove error"); 
    else 
        console.log(res);
});
User.remove(null,function(err,res){
    if(err)
        console.log("remove error"); 
    else 
        console.log(res);
});
Tag.remove(null,function(err,res){
    if(err)
        console.log("remove error"); 
    else 
        console.log(res);
});

//mock blogs
var blog1 = new Blog({
    author: user1,
    title: 'Blog Title 1',
    content: 'This is a java blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'java-slug',
    tags: [javaTag,blogTag]
});   

Blog.update({_id:blog1._id},{
    tags: [javaTag,blogTag]
},function(err){
    if(err)
        console.log(err);
});

blog1.save(function(err){
    if(err)
        console.log('create blog1 error' + JSON.stringify(err));
});

var blog2 = new Blog({
    author: user2,
    title: 'Blog Title 2',
    content: 'This is a c++ blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'cpp-slug',
    tags: [cppTag,blogTag]
});   

blog2.save(function(err){
    if(err)
        console.log('create blog2 error');
});
var blog3 = new Blog({
    author: user3,
    title: 'Blog Title 3',
    content: 'This is a python blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'python-slug',
    tags: [pythonTag,blogTag]
});   

blog3.save(function(err){
    if(err)
        console.log('create blog3 error');
});
var blog4 = new Blog({
    author: user4,
    title: 'Blog Title 4',
    content: 'This is a js blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'js-slug',
    tags: [jsTag,blogTag]
});   

blog4.save(function(err){
    if(err)
        console.log('create blog4 error');
});
var blog5 = new Blog({
    author: user1,
    title: 'Blog Title 5',
    content: 'This is a java blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'java-slug',
    tags: [javaTag,blogTag]
});   

blog5.save(function(err){
    if(err)
        console.log('create blog5 error');
});
var blog6 = new Blog({
    author: user2,
    title: 'Blog Title 6',
    content: 'This is a c++ blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'c++-slug',
    tags: [cppTag,blogTag]
});   

blog6.save(function(err){
    if(err)
        console.log('create blog6 error');
});
var blog7 = new Blog({
    author: user3,
    title: 'Blog Title 7',
    content: 'This is a python blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'python-slug',
    tags: [pythonTag,blogTag]
});   

blog7.save(function(err){
    if(err)
        console.log('create blog7 error');
});
var blog8 = new Blog({
    author: user4,
    title: 'Blog Title 8',
    content: 'This is a js blog',
    isPublished: true,      
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    publishedDate: (new Date).getTime(),
    slug: 'js-slug',
    tags: [jsTag,blogTag]
});   

blog8.save(function(err){
    if(err)
        console.log('create blog8 error');
});

}

module.exports = {
    loadBlogs: loadBlogs
};
