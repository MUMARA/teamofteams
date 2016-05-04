/// <reference path="../../../typings/tsd.d.ts" />
"use strict";
var mongoose = require("mongoose");
var credentials_1 = require('../config/credentials');
mongoose.connect(credentials_1.credentials.mongoDB.URI);
var userSchema = new mongoose.Schema({
    userID: {
        type: String,
        index: true
    },
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    contactNumber: String,
    profession: String,
    desc: String,
    uuid: String,
    status: Number,
    lastLogin: String,
    lastGenerated: String,
    token: String,
    devices: {
        android: Array,
        iphone: Array,
        windowsPhone: Array
    },
    'profile-image': String,
    dateCreated: String
});
exports.User = mongoose.model('User', userSchema);
//# sourceMappingURL=userModel.js.map