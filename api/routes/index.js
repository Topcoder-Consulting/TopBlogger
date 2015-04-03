/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger home page controller.
 *
 * @version 1.0
 * @author kiri4a
 */
"use strict";

var express = require('express');
var router = express.Router();
var Blog = require('../models/Blog');
var User = require('../models/User');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express',
        user: req.user
    });
});

/* adds some data */
router.get('/tmp/load', function (req, res) {

  /*
  var jeffdonthemic = new User({
    handle: 'jeffdonthemic'
  });
  jeffdonthemic.save(function(err,result){
    if(err) console.log(err);
    if(!err) console.log(result); 
  });

  var b1 = new Blog({
    author: jeffdonthemic,
    title: 'Blog Title #1',
    content: 'This is my first blog content',
    isPublished: false,
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    slug: 'slug1'
  });
  b1.save(function(err, result){
    if (err) console.log(err);
    if (!err) console.log('Inserted ' + b1.title);
  })

  var b2 = new Blog({
    author: jeffdonthemic,
    title: 'Blog Title #2',
    content: 'This is my second blog content',
    isPublished: false,
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    slug: 'slug2'
  });
  b2.save(function(err, result){
    if (err) console.log(err);
    if (!err) console.log('Inserted ' + b2.title);
  })

  var b3 = new Blog({
    author: jeffdonthemic,
    title: 'Blog Title #3',
    content: 'This is my third blog content',
    isPublished: false,
    createdDate: (new Date).getTime(),
    lastUpdatedDate: (new Date).getTime(),
    slug: 'slug3'
  });
  b3.save(function(err, result){
    if (err) console.log(err);
    if (!err) console.log('Inserted ' + b3.title);
  })
  */ 
  require('../test/loadTestBlogs').loadBlogs();

  res.json({message: "data loaded"});
});

module.exports = router;
