/// <reference path="../../../typings/tsd.d.ts" />
"use strict";
var nodeUuid = require('node-uuid');
var ejs = require('ejs');
var userModel_1 = require('../model/userModel');
var credentials_1 = require('../config/credentials');
var tokenGenerator_1 = require('../config/tokenGenerator');
var fireHandler = require('./fireHandler');
var postmark_1 = require('../config/postmark');
var appconfig = credentials_1.credentials.product;
var verificationEmailTemplate = '';
function userSignup(event, context) {
    var emailReg = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailReg.test(event.email) || (typeof event.userID !== 'string') || event.userID.length < 3 || event.userID.length > 20) {
        context.succeed({
            statusCode: 0,
            statusDesc: "email address Or userID is invalid."
        });
    }
    userModel_1.User.findOne({ $or: [{ email: event.email }, { userID: event.userID }] }, function (err, user) {
        if (user) {
            if (user.email === event.email) {
                context.succeed({
                    statusCode: 2,
                    statusDesc: "user already exists with this email address."
                });
            }
            else {
                context.succeed({
                    statusCode: 3,
                    statusDesc: "user already exists with this userID."
                });
            }
        }
        else {
            createUser(event, context);
        }
    });
    function createUser(event, context) {
        //create a user object to store in database
        var userObj = {
            userID: event.userID,
            email: event.email,
            password: event.password,
            firstName: event.firstName,
            lastName: event.lastName,
            contactNumber: '',
            profession: '',
            desc: '',
            uuid: nodeUuid.v1(),
            status: 0
        };
        fireHandler.addUser(userObj, function (err, firebaseObj) {
            if (err) {
                context.succeed({
                    statusCode: 0,
                    statusDesc: "error occurred while saving user details."
                });
            }
            else {
                var timestamp = new Date(firebaseObj["date-created"]);
                userObj.dateCreated = timestamp.toISOString();
                userObj.devices = {
                    android: [],
                    iphone: [],
                    windowsPhone: []
                };
                var user = new userModel_1.User(userObj);
                user.save(function (error, user) {
                    if (error) {
                        //add code here to delete entry from firebase
                        context.succeed({
                            statusCode: 0,
                            statusDesc: "error occurred while saving user details."
                        });
                    }
                    else {
                        context.succeed({
                            uid: user.userID,
                            statusCode: 1,
                            statusDesc: "signed up successfully."
                        });
                        //send a verification email to new user.
                        sendVerificationEmail(userObj);
                    }
                });
            }
        });
    }
    function sendVerificationEmail(user) {
        var template = ejs.render(verificationEmailTemplate, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: user.uuid,
            baseUrl: appconfig.BASEURL,
            domain: appconfig.DOMAIN,
            supportEmail: appconfig.SUPPORT
        });
        var payload = {
            "To": user.email,
            "From": appconfig.SUPPORT,
            "Subject": 'Verify your ' + appconfig.TITLE + ' membership',
            "HtmlBody": template
        };
        postmark_1.client.sendEmail(payload, function (err, data) {
            if (err) {
                console.log('email sent error: ' + user.email);
                return console.error(err.message);
            }
        });
    }
}
exports.userSignup = userSignup;
function userSignin(event, context) {
    userModel_1.User.findOne({
        email: event.email
    }, function (err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        }
        else if (user) {
            if (user.password === event.password) {
                //checking pending request
                if (process.env.NODE_ENV == "production") {
                    if (user.status == 0) {
                        context.succeed({
                            statusCode: 0,
                            statusDesc: "Before signin please verify your email address!"
                        });
                    }
                } //checking pending request
                updateLastLogin(context, user);
            }
            else {
                context.succeed({
                    statusCode: 0,
                    statusDesc: "invalid password."
                });
            }
        }
        else {
            context.succeed({
                statusCode: 0,
                statusDesc: "user with this email does not exist."
            });
        }
    });
    function updateLastLogin(context, user) {
        var currentDate = new Date(), token = getToken(currentDate, user);
        userModel_1.User.findOneAndUpdate({
            email: user.email
        }, {
            $set: {
                lastLogin: currentDate.toISOString(),
                lastGenerated: user.lastGenerated,
                token: token
            }
        }, function (err, user) {
            var userObj;
            if (err) {
                context.succeed({
                    statusCode: 0,
                    statusDesc: "error occurred."
                });
            }
            else {
                userObj = getUserObjForResponse(user);
                userObj.token = token;
                context.succeed({
                    statusCode: 1,
                    statusDesc: "signed in successfully.",
                    user: userObj
                });
            }
        });
    }
    function getToken(currentDate, user) {
        var token;
        if (user.lastGenerated) {
            var lastGeneratedDate = new Date(user.lastGenerated);
            var hours = Math.abs(currentDate - lastGeneratedDate) / 36e5;
            token = hours <= 24 ? user.token : createNewToken(user);
        }
        else {
            token = createNewToken(user);
        }
        return token;
    }
    function createNewToken(user) {
        //storing the Date for generated token, to validate the token for next 24 hrs.
        user.lastGenerated = (new Date()).toISOString();
        return tokenGenerator_1.tokenGenerator.createToken({
            uid: user.userID,
            data: getUserObjForResponse(user)
        }, {
            debug: true
        });
    }
    function getUserObjForResponse(user) {
        return {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            lastLogin: user.lastLogin,
            status: user.status,
            userID: user.userID
        };
    }
}
exports.userSignin = userSignin;
//# sourceMappingURL=userController.js.map