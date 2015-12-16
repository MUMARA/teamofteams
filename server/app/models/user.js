/**
 * Created by Shahzad on 12/25/2014.
 */

'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = Schema({
    userID: {
        type: String,
        index: true
    },
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    uuid: String,
    status: Number,
    lastLogin: String,
    lastGenerated: String, //last token generated on login.
    token: String,
    devices: {
        android: Array,
        iphone: Array,
        windowsPhone: Array
    },
    'profile-image': String,
    dateCreated: String
});

mongoose.model('User', UserSchema);
