/**
 * Created by Shahzad on 12/26/2014.
 */

'use strict';

var tokenGenerator = require('../../config/firebase');

var mongoose = require('mongoose'),
    User = mongoose.model('User');

//to handle user sign-in.
exports.signIn = function(req, res) {
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            if (user.password === req.body.password) {
                
                //checking pending request
                if (process.env.NODE_ENV == "production") {
                    if (user.status == 'pending') {
                        res.send({
                            statusCode: 0,
                            statusDesc: "Before signin please verify your email address!"
                        });
                    }
                }//checking pending request

                updateLastLogin(res, user);
            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "invalid password."
                });
            }
        } else {
            res.send({
                statusCode: 0,
                statusDesc: "user with this email does not exist."
            });
        }
    });
};

//to update lastLogin property of user object in database.
function updateLastLogin(res, user) {
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
    }, function(err, user) {
        var userObj;
        if (err) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else {
            userObj = getUserObjForResponse(user);
            userObj.token = token;
            res.send({
                statusCode: 1,
                statusDesc: "signed in successfully.",
                user: userObj
            });
        }
    });
}

//gets a firebase-token.
function getToken(currentDate, user) {
    var token;

    if (user.lastGenerated) {
        var lastGeneratedDate = new Date(user.lastGenerated),
            hours = Math.abs(currentDate - lastGeneratedDate) / 36e5;

        token = hours <= 24 ? user.token : createNewToken(user);
    } else {
        token = createNewToken(user);
    }

    return token;
}

//creates a firebase-token, which expires within 24hrs.
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

//creates a user object with selected fields only, from the user model of DB .
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