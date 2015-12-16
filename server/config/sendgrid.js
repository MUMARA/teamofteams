/**
 * Created by Shahzad on 12/27/2014.
 */

'use strict';

var sendgrid = require('sendgrid');
var credentials = require("./credentials.js");

module.exports = sendgrid(credentials.sendgrid.USERNAME, credentials.sendgrid.PASSWORD);
