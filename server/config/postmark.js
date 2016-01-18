'use strict';

var postmark = require('postmark');
var credentials = require("./credentials.js");

var client = new postmark.Client(credentials.postmark.SERVERAPIKEY);

module.exports = client;
