/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */

/**
 *  This service provides methods to manage tags.
 *
 * @version 1.0
 * @author mhykol
 */

"use strict";

var Tag = require('../models/Tag');

/**
 * Creates a new user.
 * @param {tagName}  name of tag
 * @param {Function} callback the callback function it is given the following parameters
 *    1) error - execution errors encountered (if any)
 *    2) tag - the created object
 */
exports.createTag = function(tagName, callback) {

    var tag = new Tag({ "name" : tagName });
    tag.save(function (err) {
        callback(null, tag);
    });

}
