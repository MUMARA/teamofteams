/// <reference path="../../../typings/tsd.d.ts" />

import * as nodeUuid from 'node-uuid';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';

import {User, IUser} from '../model/userModel';
import {credentials} from '../config/credentials';
import {tokenGenerator} from '../config/tokenGenerator';
import {firebaseCtrl} from './firebaseCtrl';

import * as fireHandler from './fireHandler';

import {client} from '../config/postmark';

let appconfig = credentials.product;
let verificationEmailTemplate = '';
let passwordRecoveryEmailTemplate = '';


fs.readFile(path.resolve(__dirname + '/../views/verificationEmail.ejs'), function (err, template) {
    if (err) {
        console.log('file read error: ' + err);
    } else {
        console.log('file read succeed');
        verificationEmailTemplate = template + '';
    }
});

fs.readFile(path.resolve(__dirname + '/../views/passwordRecoveryEmail.ejs'), function(err, template) {
    if (err) {
        console.log('file read error: ' + err);
    } else {
        console.log('file read succeed');
        passwordRecoveryEmailTemplate = template + '';
    }
});

export function userSignup(event, context: Context) {

    var emailReg = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (!emailReg.test(event.email) || (typeof event.userID !== 'string') || event.userID.length < 3 || event.userID.length > 20) {
        context.succeed({
            statusCode: 0,
            statusDesc: "email address Or userID is invalid."
        });
    }

    User.findOne({ $or: [{ email: event.email }, { userID: event.userID }] }, function (err, user) {
        if (user) {
            if (user.email === event.email) {
                context.succeed({
                    statusCode: 2,
                    statusDesc: "user already exists with this email address."
                });
            } else {
                context.succeed({
                    statusCode: 3,
                    statusDesc: "user already exists with this userID."
                });
            }
        } else {
            createUser(event, context);
        }
    });

    function createUser(event, context: Context) {

        //create a user object to store in database
        var userObj: IUser = <any>{
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
            } else {
                let timestamp = new Date(firebaseObj["date-created"]);
                userObj.dateCreated = timestamp.toISOString();
                userObj.devices = <any>{
                    android: [],
                    iphone: [],
                    windowsPhone: []
                };

                let user: IUser = new User(userObj);
                user.save(function (error, user: IUser) {
                    if (error) {
                        //add code here to delete entry from firebase
                        context.succeed({
                            statusCode: 0,
                            statusDesc: "error occurred while saving user details."
                        });
                    } else {

                        //send a verification email to new user.
                        sendVerificationEmail(userObj, function (err?) {
                            if (err) {
                                context.succeed({
                                    statusCode: 0,
                                    statusDesc: err
                                });
                            } else {
                                context.succeed({
                                    uid: user.userID,
                                    statusCode: 1,
                                    statusDesc: "signed up successfully. Text Changed"
                                });
                            }
                        });


                    }
                });
            }
        });
    }

    function sendVerificationEmail(user: IUser, cb: Function) {
        console.log('started sending email')
        console.log(verificationEmailTemplate);
        var template = ejs.render(verificationEmailTemplate, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: user.uuid,
            baseUrl: appconfig.BASEURL,
            domain: appconfig.DOMAIN,
            supportEmail: appconfig.SUPPORT,
            api: 'https://wgco9m0sl1.execute-api.us-east-1.amazonaws.com/dev/verifyemail'
        });
        var payload = {
            "To": user.email,
            "From": appconfig.SUPPORT,
            "Subject": 'Verify your ' + appconfig.TITLE + ' membership',
            "HtmlBody": template
        };
        client.sendEmail(payload, function (err, data) {
            if (err) {
                console.log('email sent error: ' + user.email);
                console.error(err.message);
                cb(err.message);
            } else {
                cb();
            }
        });
    }
}

export function userSignin(event, context: Context) {
    User.findOne({
        email: event.email
    }, function (err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
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
            } else {
                context.succeed({
                    statusCode: 0,
                    statusDesc: "invalid password."
                });
            }
        } else {
            context.succeed({
                statusCode: 0,
                statusDesc: "user with this email does not exist."
            });
        }
    });

    function updateLastLogin(context, user) {
        var currentDate = new Date(),
            token = getToken(currentDate, user);

        User.findOneAndUpdate({
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
                } else {
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
        } else {
            token = createNewToken(user);
        }

        return token;
    }

    function createNewToken(user) {
        //storing the Date for generated token, to validate the token for next 24 hrs.
        user.lastGenerated = (new Date()).toISOString();

        return tokenGenerator.createToken({
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

export function verifyEmail(event, context: Context) {

    //check for user with uuid similar to token
    User.findOneAndUpdate({
        uuid: event.uuid
    }, {
        $set: {
            status: 1
        }
    }, function(err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            fireHandler.updateUserStatus(user.userID, 1, function(err) {
                var template;

                if (err) {
                    context.succeed({
                        statusCode: 0,
                        statusDesc: "account verification failed. please try again."
                    });
                } else {
                    context.succeed({
                        location: appconfig.DOMAIN + ' signin' 
                    })
                }
            });
        } else {
            context.succeed({
                statusCode: 1,
                statusDesc: "account verification failed. invalid token."
            });
        }
    });
};

export function removeUser(event, context: Context) {
    User.findOneAndRemove({
        userID: event.userID,
        password: event.password,
        token: event.token
    }, function(err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            fireHandler.removeUser(user.userID, function(err) {
                if (err) {
                    //TODO: handle the case - when user has been deleted from mongoDB but got an error from firebase.
                    context.succeed({
                        statusCode: 0,
                        statusDesc: "user has been removed from local Database but not from firebase."
                    });
                } else {
                    context.succeed({
                        statusCode: 1,
                        statusDesc: "user has been removed successfully."
                    });
                }
            });
        } else {
            context.succeed({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};

export function checkAvailability(event, context: Context) {
    User.findOne({
        userID: event.userID
    }, function(err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            context.succeed({
                statusCode: 2,
                statusDesc: "userID already exists."
            });
        } else {
            context.succeed({
                statusCode: 1,
                statusDesc: "userID is available for sign up."
            });
        }
    });
};

export function changeUserPassword(event, context: Context) {
    var payload = event;

    if (!(typeof payload.password === 'string' && payload.password.length >= 3)) {
        context.succeed({
            statusCode: 0,
            statusDesc: "invalid new password."
        });
        return;
    }

    var userModel = User.findOne({
        userID: payload.userID,
        password: payload.password
    }, function(err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            userModel.update({
                password: payload.newPassword
            }, function(error) {
                if (error) {
                    context.succeed({
                        statusCode: 0,
                        statusDesc: "error occurred."
                    });
                } else {
                    context.succeed({
                        statusCode: 1,
                        statusDesc: "user password has been updated successfully."
                    });
                }
            })
        } else {
            context.succeed({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};

export function checkUserPassword(event, context: Context) {
    var payload = event;

    if (!(typeof payload.password === 'string' && payload.password.length >= 3)) {
        context.succeed({
            statusCode: 0,
            statusDesc: "invalid new password."
        });

        return;
    }

    var userModel = User.findOne({
        userID: payload.userID,
        password: payload.password
    }, function(err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user !== null) {
            context.succeed({
                statusCode: 1,
                statusDesc: "Password is correct"
            });

        } else {
            context.succeed({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};

export function editUser(event, context: Context) {
    //payLoad ={
    // userID:req.body.userID,
    // token : req.body.token,
    // firstName : req.body.firstName,
    // lastName  : req.body.lastName,
    // }

    var dataToUpdate = {
        firstName: '',
        lastName: ''
    };
    var payload = event.body;

    //client should allow firstName and lastName with a length of 3.
    var validity = {
        firstName: typeof payload.firstName === 'string' && payload.firstName.length >= 3,
        lastName: typeof payload.lastName === 'string' && payload.lastName.length >= 3
    };

    if (!validity.firstName && !validity.lastName) {
        context.succeed({
            statusCode: 0,
            statusDesc: 'no or invalid fields provided to update.'
        });

        return;
    }

    var userModel = User.findOne({
        userID: payload.userID,
        token: payload.token
    }, function(err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {

            validity.firstName && (dataToUpdate.firstName = payload.firstName);
            validity.lastName && (dataToUpdate.lastName = payload.lastName);

            firebaseCtrl.asyncUpdateUser(payload.userID, dataToUpdate)
                .then(function() {
                    userModel.update(dataToUpdate, function(error) {
                        if (error) {
                            context.succeed({
                                statusCode: 0,
                                statusDesc: "failed while saving to server."
                            });
                        } else {
                            context.succeed({
                                statusCode: 1,
                                statusDesc: "user profile has been updated successfully."
                            });
                        }
                    });
                }, function() {
                    context.succeed({
                        statusCode: 0,
                        statusDesc: "failed while saving to server."
                    });
                });
        } else {
            context.succeed({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};

export function forgotPassword(event, context: Context) {
    User.findOne({
        email: event.email
    }, function(err, user) {
        if (err) {
            context.succeed({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            sendPasswordRecoveryEmail(user);
            context.succeed({
                statusCode: 1,
                statusDesc: "you would receive an email with a password recovery link, shortly."
            });
        } else {
            context.succeed({
                statusCode: 0,
                statusDesc: "user with this email does not exist."
            });
        }
    });
    function sendPasswordRecoveryEmail(user) {
        var template = ejs.render(passwordRecoveryEmailTemplate, {
            user: user,
            app: appconfig
        });
        var payload = {
            "To": user.email,
            "From": appconfig.SUPPORT,
            "Subject": 'Account Recovery Email - "' + appconfig.TITLE,
            "HtmlBody": template,
        };
        client.sendEmail(payload,function(err, json) {
            if (err) {
                console.log('email sent error: ' + user.email);
                return console.error(err.message);
            }

            console.log('email sent success: ' + user.email);
            console.log(json);
        });
    }
}