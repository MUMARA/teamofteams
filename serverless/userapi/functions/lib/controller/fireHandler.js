/// <reference path="../../../typings/tsd.d.ts" />
console.log('test1');
var Firebase = require('firebase');
console.log('test2');
var firebaseCtrl_1 = require('./firebaseCtrl');
console.log('test3');
var tokenGenerator_1 = require('../config/tokenGenerator');
console.log('test4');
console.log('test5');
//initialize firebase ctrl to cache refs and other stuff.
firebaseCtrl_1.firebaseCtrl.init();
/*private variables*/
var myFirebaseRef = firebaseCtrl_1.firebaseCtrl.getRefMain();
var usersRef = firebaseCtrl_1.firebaseCtrl.getRefUsers();
var authenticatedFirebase = false;
var authDateFirebase = null;
var activityRef = firebaseCtrl_1.firebaseCtrl.getRefGroupActivityStream();
//listens for auth event. when auth expires or initially, get server authenticated with firebase.
myFirebaseRef.onAuth(function (auth) {
    if (auth) {
        authenticatedFirebase = true;
        console.log('onAuth: authenticated');
    }
    else {
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
    var adminJWT = tokenGenerator_1.tokenGenerator.createToken({
        uid: 'admin'
    }, {
        admin: true,
        expires: getNext30DayEpoch()
    });
    myFirebaseRef.authWithCustomToken(adminJWT, function (error, authData) {
        if (error) {
            console.log("Firebase Login Failed!", error);
            callback && callback(error);
        }
        else {
            console.log("Firebase Login Succeeded!", authData);
            authDateFirebase = authData;
            callback && callback();
        }
    });
}
exports.authenticate = authenticate;
//adds a user on firebase
function addFirebaseUser(user, callback) {
    var userRef = usersRef.child(user.userID);
    userRef.set({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: 0,
        'date-created': Firebase.ServerValue.TIMESTAMP
    }, function (error) {
        if (error) {
            callback(error);
        }
        else {
            userRef.once('value', function (snapshot) {
                callback(null, snapshot.val());
            });
        }
    });
}
//to confirm a user account email address.
function addUser(user, callback) {
    if (authenticatedFirebase) {
        addFirebaseUser(user, function (error, firebaseUser) {
            if (error) {
                callback(error);
            }
            else {
                callback(null, firebaseUser);
            }
        });
    }
    else {
        authenticate(function (error) {
            if (error) {
                callback(error);
            }
            else {
                //authenticatedFirebase = true;
                addFirebaseUser(user, function (err, firebaseUser) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, firebaseUser);
                    }
                });
            }
        });
    }
}
exports.addUser = addUser;
;
//to remove a user account.
function removeUser(userID, callback) {
    var removeUser = function () {
        usersRef.child(userID).remove(function (err) {
            if (err) {
                callback(err);
            }
            else {
                //TODO remove user's memberships from groups, subgroups, and microgroups.
                callback();
            }
        });
    };
    if (authenticatedFirebase) {
        removeUser();
    }
    else {
        authenticate(function (error) {
            if (error) {
                callback(error);
            }
            else {
                //authenticatedFirebase = true;
                removeUser();
            }
        });
    }
}
exports.removeUser = removeUser;
;
//to update email status of a user account.
function updateUserStatus(userID, status, callback) {
    var updateStatus = function () {
        usersRef.child(userID + '/' + 'status').set(status, function (err) {
            if (err) {
                callback(err);
            }
            else {
                callback();
            }
        });
    };
    if (authenticatedFirebase) {
        updateStatus();
    }
    else {
        authenticate(function (error) {
            if (error) {
                callback(error);
            }
            else {
                //authenticatedFirebase = true;
                updateStatus();
            }
        });
    }
}
exports.updateUserStatus = updateUserStatus;
;
//save stream on join groups
function addActivityStream(activityObj, cb) {
    var groupID = activityObj.groupID;
    delete activityObj.groupID;
    activityRef.child(groupID).push(activityObj, function (err) {
        if (err) {
            cb(err);
        }
        else {
            cb(null, { success: true });
        }
    });
}
exports.addActivityStream = addActivityStream;
;
//# sourceMappingURL=fireHandler.js.map