/// <reference path="../../../typings/tsd.d.ts" />

import * as mongoose from "mongoose";

import {credentials} from '../config/credentials';

mongoose.connect(credentials.mongoDB.URI);

let userSchema: mongoose.Schema = new mongoose.Schema({
    userID: {
        type: String,
        index: true
    },
    email : String,
    password : String,
    firstName : String,
    lastName: String,
    contactNumber: String,
    profession: String,
    desc: String,
    uuid : String,
    status : Number,
    lastLogin : String,
    lastGenerated : String, //last token generated on login.
    token : String,
    devices : {
        android : Array,
        iphone : Array,
        windowsPhone : Array
    },
    'profile-image': String,
    dateCreated: String
})

export interface IUser extends mongoose.Document {
    userID: String,
    email : String,
    password : String,
    firstName : String,
    lastName: String,
    contactNumber: String,
    profession: String,
    desc: String,
    uuid : String,
    status : Number,
    lastLogin : String,
    lastGenerated : String, //last token generated on login.
    token : String,
    devices : {
        android : [string],
        iphone : [string],
        windowsPhone : [string]
    },
    'profile-image': String,
    dateCreated: String
}

export let User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema);