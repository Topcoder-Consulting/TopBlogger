/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the TopBlogger API blog service.
 *
 * @version 1.0
 * @author jzh08 
 */
"use strict";

var mongoose = require('mongoose'); 
var Blog = require('../models/Blog');
var User = require('../models/User');
var Tag = require('../models/Tag');
var _ = require('underscore');


/**
 * Get user information by handle 
 * @param {String} handle The handle of a user to search 
 * @param {Function} callback The function to call when user information is fetched from database. 
 */ 
function getUserByHandle(handle, callback){
    if(!handle)
        return callback(null,null);
    User.find({handle:handle},function(err,users){
        if(err)
            callback(err);
        else if(users.length == 0)
            callback(null,null);
        else 
            callback(null,users[0]);        
    });     
}

/**
 * Get tags objects from database by tag names
 * @param {String} tagNames The tag names joined with ',', like 'java,python,javascript'
 * @param {Function} callback The function to call when tags are fetched from database. 
 */
function getTagByName(tagNames, callback){
    if(!tagNames) 
        return callback(null,null);
    Tag.find({name:{"$in":tagNames.split(',')}},function(err,tags){
        if(err)
            return callback(err);
        if(tags.length == 0) 
            return callback(null,null);
        callback(null,tags); 
    });  
}

function isNumber(str){
    var num = parseInt(str); 
    return _.isNumber(num) && !_.isNaN(num);
}

/**
 * Get blogs from database by user provided filters
 * @param {Object} filter Contains all the filter condition for blog search 
 * @param {Function} callback The function to call when blogs are retrieved from database 
 */ 
function getBlogs(filter,callback){
    
    //the currently supported query parameters 
    var supportedParams = [
        'handle','slug','tags','title','keyword',
        'publishedDateFrom','publishedDateTo','limit',
        'offset','sortBy','sortType'

    ];
    //validate parameter
    for(var key in filter){
        if(!_.contains(supportedParams,key))
            return callback({
                'code': 400,
                'message': 'unsupported parameter: ' + key
            });
    }

    var blogRes = {
        "total": 0,
        "totalPages": 0,
        "values": []
    };

    //query condition for blogs 
    var condition = {};

    getUserByHandle(filter.handle,function(err,user){

        if(filter.handle){
            if(!user)
                return callback(null,blogRes);
            condition['author'] = user;
        }

        getTagByName(filter.tags,function(err,tags){ 
        
        if(filter.tags){
            if(!tags)
                return callback(null,blogRes);
        	var tagIds = []; 
        	for(var i = 0; i < tags.length; i++){
        		tagIds.push(tags[i]._id);
        	}
            condition['tags._id'] = {"$in":tagIds};
        }
        //exact match of slug text
        if(filter.slug)
            condition.slug = filter.slug; 
        //regex match of title text
        if(filter.title) 
            condition.title = {'$regex': filter.title};

        //keyword can appear in title or content or tags
        if(filter.keyword){
            condition['$or'] = []; 
            condition['$or'].push({
                'title' : {'$regex' : filter.keyword }
            });
            condition['$or'].push({
                'content' : {'$regex' : filter.keyword }  
            });
            condition['$or'].push({
                'tags' : filter.keyword
            });
        }       

        //process publish date range and check validity
        if(filter.publishedDateFrom || filter.publishedDateTo){

            //check two parameter's validity
            if((filter.publishedDateFrom && !isNumber(filter.publishedDateFrom))
                || (filter.publishedDateTo && !isNumber(filter.publishedDateTo)))
                    return callback({
                        'code' : 400, 
                        'message' : 'publishedDateFrom and publishedDateTo should be valid number'
                    });
            if(filter.publishedDateFrom && filter.publishedDateTo){
                if(parseInt(filter.publishedDateFrom) > parseInt(filter.publishedDateTo)){
                    return callback({
                        'code' : 400,
                        'message' : 'invalid publishedDate range'
                    });
                }
            }

            condition.publishedDate = {}
            if(filter.publishedDateFrom)
                condition.publishedDate['$gt'] = parseInt(filter.publishedDateFrom);
            if(filter.publishedDateTo)
                condition.publishedDate['$lt'] = parseInt(filter.publishedDateTo);
        }

        var offset = 0; 
        var limit = 10; 
        if(filter.offset) {
            if(!isNumber(filter.offset) || filter.offset < 0)
                return callback({
                    'code': 400,
                    'message' : 'invalid offset value,should be a number greater than or equal to 0'
                });
            offset = filter.offset; 
        }
        if(filter.limit){ 
            if(!isNumber(filter.limit) || filter.limit < -1)
                return callback({
                    'code': 400,
                    'message' : 'invalid limit value' 
                });
            limit = filter.limit; 
        }

        //process sortBy and sortType parameter
        var allowedSortBys = ["publishedDate", "numOfComments", "numOfViews", "numOfUpVotes", "numOfDownVotes"]; 
        var sortBy = "publishedDate"; 
        if(filter.sortBy){
            if(! _.contains(allowedSortBys,filter.sortBy))
                return callback({
                    'code' : 400,
                    'message' : 'invalid sortBy, allowed sortBy are: ' + allowedSortBys.join(',') 
                });
            sortBy = filter.sortBy; 
        }
        var sortType = "desc"; 
        var allowedSortTypes = ['desc','asc']; 
        if(filter.sortType){
            if(! _.contains(allowedSortTypes,filter.sortType))
                return callback({
                    'code' : 400,
                    'message' : 'invalid sortType, valid sortTypes are: ' + allowedSortTypes.join(',')
                });

            sortType = filter.sortType; 
        }

        //return only published blogs
        condition.isPublished = true;

        //make a mongoose query
        var query = Blog.find(condition)
            .sort({sortBy:sortType})
            .populate('author','handle _id')
            .populate('tags','name _id')
            .populate('comments','author.handle author._id content _id lastUpdatedDate numOfDislikes numOfLikes postedDate');

        //if limit=-1, it does not make sense to skip pages
        if(limit != -1){
            query.limit(limit);
            query.skip(offset*limit);
        }

        //execute the query and process the errors
        try{
            query.exec(function(err,blogs){
                if(err)
                return callback({
                    'code' : 500,
                    'message' : 'query execution error' 
                });

            Blog.count(query._conditions,function(err,count){
                if(err)
                    return callback({
                    'code' : 500,
                    'message' : 'query execution error' 
                    });
                blogRes['total'] = count; 
                if(limit > 0)
                    blogRes['totalPages'] = count/limit;
                else if(limit == 0)         //need confirmation here!
                    blogRes['totalPages'] = 0;
                else if(limit == -1)
                    blogRes['totalPages'] = 1; 

                blogRes['values'] = blogs; 
            	callback(null,blogRes);
            });

            });// end query exec
        } catch (err){
            callback({
                'code' : 500,  
                'message': 'unknown internal error'
            });
        } 

        });// end of getTagByName
    });// end of getUserByHandle
}

module.exports = {
    getBlogs: getBlogs
}
