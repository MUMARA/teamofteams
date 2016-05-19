/// <reference path="../../../typings/tsd.d.ts" />

import * as Firebase from 'firebase';


import {firebaseCtrl} from './firebaseCtrl';
import {tokenGenerator} from '../config/tokenGenerator';
import {credentials} from '../config/credentials';

//initialize firebase ctrl to cache refs and other stuff.
firebaseCtrl.init();

/*private variables*/
export let myFirebaseRef = firebaseCtrl.getRefMain();
let usersRef = firebaseCtrl.getRefUsers();
let authenticatedFirebase = false;
let authDateFirebase = null;
let activityRef = firebaseCtrl.getRefGroupActivityStream();

//listens for auth event. when auth expires or initially, get server authenticated with firebase.
myFirebaseRef.onAuth(function (auth) {
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
    let nowEpoch = new Date().valueOf();
    return nowEpoch + (3600000 * 24 * 30); // current epoch + ( 1min * 24hrs * 30days )
}

//authenticate node server with firebase
export function authenticate(callback?) {
    var adminJWT = tokenGenerator.createToken({
        uid: 'admin'
    }, {
            admin: true,
            expires: getNext30DayEpoch()
        });

    myFirebaseRef.authWithCustomToken(adminJWT, function (error, authData) {
        if (error) {
            console.log("Firebase Login Failed!", error);
            callback && callback(error);
        } else {
            console.log("Firebase Login Succeeded!", authData);
            authDateFirebase = authData;
            callback && callback();
        }
    });
}

//adds a user on firebase
function addFirebaseUser(user, callback) {
    let userRef = usersRef.child(user.userID);
    userRef.set({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: 0,
        'date-created': Firebase.ServerValue.TIMESTAMP
    }, function (error) {
        if (error) {
            callback(error);
        } else {
            userRef.once('value', function (snapshot) {
                callback(null, snapshot.val());
            });
        }
    });
}

//to confirm a user account email address.
export function addUser(user, callback) {
    if (authenticatedFirebase) {
        addFirebaseUser(user, function (error, firebaseUser) {
            if (error) {
                callback(error);
            } else {
                callback(null, firebaseUser);
            }
        });
    } else {
        authenticate(function (error) {
            if (error) {
                callback(error);
            } else {
                //authenticatedFirebase = true;
                addFirebaseUser(user, function (err, firebaseUser) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, firebaseUser);
                    }
                });
            }
        });
    }

};

//to remove a user account.
export function removeUser(userID, callback) {
    let removeUser = function () {
        usersRef.child(userID).remove(function (err) {
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
        authenticate(function (error) {
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
export function updateUserStatus(userID, status, callback) {
    let updateStatus = function () {
        usersRef.child(userID + '/' + 'status').set(status, function (err) {
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
        authenticate(function (error) {
            if (error) {
                callback(error);
            } else {
                //authenticatedFirebase = true;
                updateStatus();
            }
        });
    }
};

//save stream on join groups
export function addActivityStream(activityObj, cb) {
    let groupID = activityObj.groupID;
    delete activityObj.groupID
    activityRef.child(groupID).push(activityObj, function (err) {
        if (err) {
            cb(err);
        } else {
            cb(null, { success: true });
        }
    });
};