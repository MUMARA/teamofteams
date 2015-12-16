/**
 * Created by Shahzad on 12/26/2014.
 */

'use strict';

var credentials = require("./credentials.js");
var FirebaseTokenGenerator = require("firebase-token-generator");

module.exports = new FirebaseTokenGenerator(credentials.firebase.SECRET);
