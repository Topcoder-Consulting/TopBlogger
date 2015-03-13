var mongoose = require('mongoose');

var blogSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        index: true, 
        unique: true
    },
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
    lastUpdateedDate: {
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
    tags: {
        type: [Tag],
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
        type: [Comment],
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
            }
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
    }
});

module.exports = mongoose.model('Blog', blogSchema);
