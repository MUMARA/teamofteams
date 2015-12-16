/**
 * Created by Shahzad on 3/27/2015.
 */

(function() {
    'use strict';

    /*requires modules*/
    var Firebase = require("firebase");
    var Q = require("q");
    var credentials = require("../../config/credentials.js");
    var firebaseBaseUrl = credentials.firebase.BASEURL;

    /*creates factory object*/
    var firbaseCtrl = {
        refs: {},
        init: function() {
            console.log('FIREBASE init invoked');

            var refMain;
            var refMain2;
            this.refs.main = new Firebase(firebaseBaseUrl);
            this.refs.main2 = new Firebase("https://pspractice.firebaseio.com/");

            refMain = this.refs.main;
            refMain2 = this.refs.main2;
            this.refs.refUsers = refMain.child("users");
            this.refs.refUserGroupMemberships = refMain.child("user-group-memberships");
            this.refs.refGroups = refMain.child("groups");
            this.refs.refGroupsNames = refMain.child("groups-names");
            this.refs.refGroupMembers = refMain.child("group-members");
            this.refs.refSubGroups = refMain.child("subgroups");
            this.refs.refQuizbanks = refMain2.child("question-bank");
        },
        getFirebaseTimestamp: function() {
            return Firebase.ServerValue.TIMESTAMP;
        },
        getRefMain: function() {
            return this.refs.main;
        },
        getRefUsers: function() {
            return this.refs.refUsers;
        },
        getRefUserGroupMemberships: function() {
            return this.refs.refUserGroupMemberships;
        },
        getRefGroups: function() {
            return this.refs.refGroups;
        },
        getRefSubGroups: function() {
            return this.refs.refSubGroups;
        },
        getRefGroupsNames: function() {
            return this.refs.refGroupsNames;
        },
        getRefGroupMembers: function() {
            return this.refs.refGroupMembers;
        },
        getRefQuizbank: function() {
            return this.refs.refQuizbanks;
        },
        asyncIsUserGroupMember: function(groupID, userID) {
            var deferred, refUserMembers;

            deferred = Q.defer();

            //get group members list
            refUserMembers = this.refs.refUserGroupMemberships.child(userID + '/' + groupID);
            refUserMembers.once('value', function(snapshot) {
                var data = snapshot.val();

                if (data) {
                    deferred.resolve(data);
                } else {
                    deferred.reject();
                }
            }, function() {
                deferred.reject();
            });

            return deferred.promise;
        },
        asyncGetGroupMembersList: function(groupID) {
            var deferred, refUserMembers,
                membersArray;

            deferred = Q.defer();
            membersArray = [];

            //get group members list
            refUserMembers = this.refs.refGroupMembers.child(groupID);
            refUserMembers.once('value', function(snapshot) {
                var data = snapshot.val();

                if (data) {
                    for (var key in data) {
                        membersArray.push(key);
                    }
                    deferred.resolve({
                        membersArray: membersArray,
                        membersObj: data
                    });
                } else {
                    deferred.reject('either no group exists with this groupID or group has an empty members list.');
                }
            }, function() {
                deferred.reject('permission denied to access group data. please try again.');
            });

            return deferred.promise;
        },
        asyncUpdateUser: function(userID, payload) {

            var defer = Q.defer();

            this.getRefUsers().child(userID)
                .update(payload, function(err) {
                    if (err) {
                        defer.reject(err)
                    } else {
                        defer.resolve()
                    }
                });

            return defer.promise;
        },
        asyncUpdateGroup: function(groupID, payload) {

            var defer = Q.defer();

            this.getRefGroups().child(groupID)
                .update(payload, function(err) {
                    if (err) {
                        defer.reject(err)
                    } else {
                        defer.resolve()
                    }
                });

            return defer.promise;
        },
        asyncUpdateQuizbank: function(quizID, payload) {

            var defer = Q.defer();

            this.getRefQuizbank().child(quizID)
                .update(payload, function(err) {
                    if (err) {
                        defer.reject(err)
                    } else {
                        defer.resolve()
                    }
                });

            return defer.promise;
        },
        asyncUpdateSubGroup: function(groupID, subgroupID, payload) {

            var defer = Q.defer();

            this.getRefSubGroups().child(groupID).child(subgroupID)
                .update(payload, function(err) {
                    if (err) {
                        defer.reject(err)
                    } else {
                        defer.resolve()
                    }
                });

            return defer.promise;
        },
        asyncRemoveUserProfileImage: function(userID) {

            var defer = Q.defer();

            this.getRefUsers().child(userID).child('profile-image')
                .remove(function(err) {
                    if (err) {
                        defer.reject(err)
                    } else {
                        defer.resolve()
                    }
                });

            return defer.promise;
        }
    };

    module.exports = firbaseCtrl;
})();
