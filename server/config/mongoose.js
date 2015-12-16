/**
 * Created by Shahzad on 12/25/2014.
 */

'use strict';

var mongoose = require('mongoose');
var credentials = require("./credentials.js");

module.exports = function() {

    //connecting to local DB Server
    //var db  = mongoose.connect('mongodb://localhost/panacloudwow');

    //Using heroku:MongoLab Addon
    var db = mongoose.connect(credentials.mongoDB.URI);
    require('../app/models/user.js');

    return db;
};
