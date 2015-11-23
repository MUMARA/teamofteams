/**
 * Created by Shahzad on 12/30/2014.
 */

'use strict';
var User  = require('mongoose').model('User'),
    util = require('./../helpers/util'),
    firebaseCtrl = require('./firebaseCtrl'),
    fireHandler = require("./fireHandler");

//to remove any user from the users collection
exports.removeUser = function( req, res ) {
    User.findOneAndRemove({
        userID : req.body.userID,
        password : req.body.password,
        token : req.body.token
    }, function( err, user ) {
        if ( err ) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if ( user ) {
            fireHandler.removeUser( user.userID, function( err ) {
               if ( err ) {
                   //TODO: handle the case - when user has been deleted from mongoDB but got an error from firebase.
                   res.send({
                       statusCode: 0,
                       statusDesc: "user has been removed from local Database but not from firebase."
                   });

               } else {
                   res.send({
                       statusCode: 1,
                       statusDesc: "user has been removed successfully."
                   });
               }
            });
        } else {
            res.send({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};

//to check userID availability.
exports.checkAvailability = function( req, res ) {
    User.findOne({
        userID : req.params.userID
    }, function( err, user ) {
        if ( err ) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if ( user ){
            res.send({
                statusCode: 2,
                statusDesc: "userID already exists."
            });
        } else {
            res.send({
                statusCode: 1,
                statusDesc: "userID is available for sign up."
            });
        }
    });
};

//to change password of a user
exports.changeUserPassword = function( req, res ) {
    var payload = req.body;

    if ( !( typeof payload.password === 'string' && payload.password.length >= 3 ) ) {
        res.send({
            statusCode: 0,
            statusDesc: "invalid new password."
        });

        return;
    }

    var userModel = User.findOne({
        userID: payload.userID,
        password: payload.password
    }, function ( err, user ) {
        if (err) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            userModel.update({ password: payload.newPassword }, function( error ) {
                if ( error ) {
                    res.send({
                        statusCode: 0,
                        statusDesc: "error occurred."
                    });
                } else {
                    res.send({
                        statusCode: 1,
                        statusDesc: "user password has been updated successfully."
                    });
                }
            })
        } else {
            res.send({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};
exports.checkUserPassword = function( req, res ) {
    var payload = req.body;

    if ( !( typeof payload.password === 'string' && payload.password.length >= 3 ) ) {
        res.send({
            statusCode: 0,
            statusDesc: "invalid new password."
        });

        return;
    }

    var userModel = User.findOne({
        userID: payload.userID,
        password: payload.password
    }, function ( err, user ) {
        if (err) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user !== null) {
                    res.send({
                        statusCode: 1,
                        statusDesc: "Password is correct"
                    });

        } else {
            res.send({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};

//to edit profile details of user. e.g firstName, lastName
exports.editUser = function( req, res ) {
    //payLoad ={
    // userID:req.body.userID,
    // token : req.body.token,
    // firstName : req.body.firstName,
    // lastName  : req.body.lastName,
    // }

    var dataToUpdate = {};
    var payload = req.body;

    //client should allow firstName and lastName with a length of 3.
    var validity = {
        firstName: typeof payload.firstName === 'string' && payload.firstName.length >= 3 ,
        lastName: typeof payload.lastName === 'string' && payload.lastName.length >= 3
    };

    if( !validity.firstName && !validity.lastName ) {
        res.send({
            statusCode: 0,
            statusDesc:'no or invalid fields provided to update.'
        });

        return;
    }

    var userModel = User.findOne({
        userID: payload.userID,
        token: payload.token
    }, function ( err, user ) {
        if (err) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if ( user ) {

            validity.firstName && ( dataToUpdate.firstName = payload.firstName );
            validity.lastName && ( dataToUpdate.lastName = payload.lastName );

            firebaseCtrl.asyncUpdateUser( payload.userID, dataToUpdate )
                .then(function(){
                    userModel.update( dataToUpdate, function( error ) {
                       if ( error ) {
                           res.send({
                               statusCode: 0,
                               statusDesc: "failed while saving to server."
                           });
                       } else {
                           res.send({
                               statusCode: 1,
                               statusDesc: "user profile has been updated successfully."
                           });
                       }
                    });
                }, function() {
                    res.send({
                        statusCode: 0,
                        statusDesc: "failed while saving to server."
                    });
                });
        } else {
            res.send({
                statusCode: 0,
                statusDesc: "invalid credentials."
            });
        }
    });
};
