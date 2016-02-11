/**
 * Created by Shahzad on 3/31/2015.
 */

(function() {
    'use strict';

    /*requires modules*/
    var tokenGenerator = require('./config/firebase');
    var firebaseCtrl = require('./app/controllers/firebaseCtrl.js');
    var Q = require('q');

    //initialise firebaseCtrl to cache
    firebaseCtrl.init();

    /*private variables*/
    var myFirebaseRef = firebaseCtrl.getRefMain();
    var fireTimestamp = firebaseCtrl.getFirebaseTimestamp();

    module.exports = {
        authenticateServer: function() {
            var defer = Q.defer();

            var adminJWT = tokenGenerator.createToken({
                uid: 'admin'
            }, {
                admin: true
            });
            myFirebaseRef.authWithCustomToken(adminJWT, function(err, authData) {
                if (err) {
                    defer.reject();
                } else {
                    defer.resolve();
                }
            });

            return defer.promise;
        },
        //to create a group with only one user
        createGroup: function(groupObj, userID) {
            var defer = Q.defer();

            //create "/group-members" entry
            firebaseCtrl.getRefGroupMembers().child(groupObj.groupID + '/' + userID)
                .set({
                    'membership-type': 1, //owner
                    timestamp: fireTimestamp
                }, function(err) {
                    if (err) {
                        defer.reject('/groups entry failed.')
                    } else {
                        //create "/group-names" entry
                        firebaseCtrl.getRefGroupsNames().child(groupObj.groupID)
                            .set(groupObj.title,
                                function(err2) {
                                    if (err2) {
                                        defer.reject('/groups-names entry failed.')
                                    } else {
                                        //create "/group" entry
                                        firebaseCtrl.getRefGroups().child(groupObj.groupID)
                                            .set({
                                                title: groupObj.title,
                                                desc: groupObj.desc,
                                                timestamp: fireTimestamp,
                                                'members-count': 1,
                                                'subgroups-count': 0,
                                                'microgroups-count': 0,
                                                'members-checked-in': 0
                                            }, function(err1) {
                                                if (err1) {
                                                    defer.reject('/group-members entry failed.')
                                                } else {
                                                    //create "/user-group-memberships" entry
                                                    firebaseCtrl.getRefUserGroupMemberships().child(userID + '/' + groupObj.groupID)
                                                        .set({
                                                            'membership-type': 1, //owner
                                                            timestamp: fireTimestamp
                                                        }, function(err3) {
                                                            if (err3) {
                                                                defer.reject('/user-group-memberships entry failed');
                                                            } else {
                                                                defer.resolve('group has been created successfully.');
                                                            }
                                                        });
                                                }

                                            });
                                    }
                                });
                    }

                });

            return defer.promise;
        }
    }
})();
