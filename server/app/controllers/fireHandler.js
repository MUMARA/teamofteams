/**
 * Created by ZiaKhan on 31/12/14.
 */

'use strict';

/*requires modules*/
var firebaseCtrl = require('./firebaseCtrl');
var tokenGenerator = require('../../config/firebase');
var credentials = require('../../config/credentials.js');
var Firebase = require('firebase');


//initialize firebase ctrl to cache refs and other stuff.
firebaseCtrl.init();

/*private variables*/
var myFirebaseRef = firebaseCtrl.getRefMain();
var usersRef = firebaseCtrl.getRefUsers();
var authenticatedFirebase = false;
var authDateFirebase = null;

/*exports*/
exports.authenticate = authenticate;

//listens for auth event. when auth expires or initially, get server authenticated with firebase.
myFirebaseRef.onAuth(function(auth) {
    if (auth) {
        authenticatedFirebase = true;
        console.log('onAuth: authenticated');
    } else {
        console.log('onAuth: expired or no auth');
        authenticatedFirebase = false;
        authenticate();
    }
});

//creates an epoch number for next 30 days
function getNext30DayEpoch() {
    var nowEpoch = new Date().valueOf();
    return nowEpoch + (3600000 * 24 * 30); // current epoch + ( 1min * 24hrs * 30days )
}

//authenticate node server with firebase
function authenticate(callback) {
    var adminJWT = tokenGenerator.createToken({
        uid: 'admin'
    }, {
        admin: true,
        expires: getNext30DayEpoch()
    });

    myFirebaseRef.authWithCustomToken(adminJWT, function(error, authData) {
        //myFirebaseRef.authWithCustomToken("Jixsdx7sC1tMpovUMMV5AeMMR8EXFcw3JgCf4k4m", function(error, authData) {
        if (error) {
            console.log("FB Login Failed!", error);
            callback && callback(error);
        } else {
            console.log("FB Login Succeeded!", authData);
            authDateFirebase = authData;
            callback && callback();
        }
    });
}

//adds a user on firebase
function addFirebaseUser(user, callback) {
    var userRef = usersRef.child(user.userID);
    userRef.set({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: 0,
        'date-created': Firebase.ServerValue.TIMESTAMP
    }, function(error) {
        if (error) {
            callback(error);

        } else {
            userRef.once('value', function(snapshot) {
                callback(null, snapshot.val());
            });
        }
    });
}

//to confirm a user account email address.
exports.addUser = function(user, callback) {
    if (authenticatedFirebase) {
        addFirebaseUser(user, function(error1, firebaseUser) {
            if (error1) {
                callback(error1);
            } else {
                callback(null, firebaseUser);
            }
        });
    } else {
        authenticate(function(error) {
            if (error) {
                callback(error);
            } else {
                //authenticatedFirebase = true;
                addFirebaseUser(user, function(error1, firebaseUser) {
                    if (error1) {
                        callback(error1);
                    } else {
                        callback(null, firebaseUser);
                    }
                });
            }
        });
    }

};

//to remove a user account.
exports.removeUser = function(userID, callback) {
    var removeUser = function() {
        usersRef.child(userID).remove(function(err) {
            if (err) {
                callback(err);
            } else {
                //TODO remove user's memberships from groups, subgroups, and microgroups.
                callback();
            }
        });
    };

    if (authenticatedFirebase) {
        removeUser();
    } else {
        authenticate(function(error) {
            if (error) {
                callback(error);
            } else {
                //authenticatedFirebase = true;
                removeUser();
            }
        });
    }
};

//to update email status of a user account.
exports.updateUserStatus = function(userID, status, callback) {
    var updateStatus = function() {
        usersRef.child(userID + '/' + 'status').set(status, function(err) {
            if (err) {
                callback(err);
            } else {
                callback();
            }
        });
    };

    if (authenticatedFirebase) {
        updateStatus();
    } else {
        authenticate(function(error) {
            if (error) {
                callback(error);
            } else {
                //authenticatedFirebase = true;
                updateStatus();
            }
        });
    }
};
