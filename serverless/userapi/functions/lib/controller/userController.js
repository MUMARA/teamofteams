/// <reference path="../../../typings/tsd.d.ts" />
var nodeUuid = require('node-uuid');
var ejs = require('ejs');
var userModel_1 = require('../model/userModel');
var credentials_1 = require('../config/credentials');
console.log('started1');
var fireHandler = require('./fireHandler');
console.log('started2');
var postmark_1 = require('../config/postmark');
console.log('started3');
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
//# sourceMappingURL=userController.js.map