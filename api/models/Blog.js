/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Represents the user model.
 *
 * @version 1.0
 * @author LOYEER
 */

var mongoose = require('mongoose');
var User = require('../models/User');
var Tag = require('../models/Tag');
var Comment = require('../models/Comment');

var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    publishedDate: {
        type: Number,
        required: false
    },
    createdDate: {
        type: Number,
        required: true
    },
    lastUpdatedDate: {
        type: Number,
        required: true
    },
    author: {
        type: [User.schema],
        required: true,
        meta: {
            _id: {
                type: Number,
                required: true,
                index: true,
                unique: true
            },
            handle: {
                type: String,
                required: true
            }
        }
    },
    tags: {
        type: [Tag.schema],
        meta: {
            _id: {
                type: Number,
                required: true,
                index: true,
                unique: true
            },
            name: {
                type: String,
                required: true
            }
        }
    },
    content: {
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        required: true
    },
    comments: {
        type: [Comment.schema],
        meta: {
            _id: {
                type: Number,
                required: true,
                index: true,
                unique: true
            },
            content: {
                type: String,
                required: true
            },
            postedDate: {
                type: Number,
                required: true
            },
            lastUpdatedDate: {
                type: Number,
                required: true
            },
            author: {
                type: User,
                required: true,
                meta: {
                    _id: {
                        type: Number,
                        required: true,
                        index: true,
                        unique: true
                    },
                    handle: {
                        type: String,
                        required: true
                    }
                }
            },
            numOfLikes: {
                type: Number,
                required: true,
                default: 0
            },
            numOfDislikes: {
                type: Number,
                required: true,
                default: 0
            },
            likeUsers: [ {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ],
            dislikeUsers: [ {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        }
    },
    numOfViews: {
        type: Number,
        required: true,
        default: 0
    },
    numOfUpVotes: {
        type: Number,
        required: true,
        default: 0
    },
    numOfDownVotes: {
        type: Number,
        required: true,
        default: 0
    },
});

module.exports = mongoose.model('Blog', blogSchema);
