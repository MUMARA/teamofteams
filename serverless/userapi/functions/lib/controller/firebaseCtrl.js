/// <reference path="../../../typings/tsd.d.ts" />
var Firebase = require('firebase');
var Q = require('q');
var credentials_1 = require('../config/credentials');
var firebaseBaseUrl = credentials_1.credentials.firebase.BASEURL;
exports.firebaseCtrl = {
    refs: {},
    init: function () {
        console.log('FIREBASE init invoked');
        this.refs.main = new Firebase(firebaseBaseUrl);
        this.refs.refUsers = this.refs.main.child("users");
        this.refs.refUserGroupMemberships = this.refs.main.child("user-group-memberships");
        this.refs.refGroups = this.refs.main.child("groups");
        this.refs.refGroupsNames = this.refs.main.child("groups-names");
        this.refs.refGroupMembers = this.refs.main.child("group-members");
        this.refs.refSubGroups = this.refs.main.child("subgroups");
        this.refs.refGroupActivityStream = this.refs.main.child("group-activity-streams");
    },
    getFirebaseTimestamp: function () {
        return Firebase.ServerValue.TIMESTAMP;
    },
    getRefMain: function () {
        return this.refs.main;
    },
    getRefUsers: function () {
        return this.refs.refUsers;
    },
    getRefUserGroupMemberships: function () {
        return this.refs.refUserGroupMemberships;
    },
    getRefGroups: function () {
        return this.refs.refGroups;
    },
    getRefSubGroups: function () {
        return this.refs.refSubGroups;
    },
    getRefGroupsNames: function () {
        return this.refs.refGroupsNames;
    },
    getRefGroupMembers: function () {
        return this.refs.refGroupMembers;
    },
    getRefGroupActivityStream: function () {
        return this.refs.refGroupActivityStream;
    },
    getRefQuizbank: function () {
        return this.refs.refQuizbanks;
    },
    asyncIsUserGroupMember: function (groupID, userID) {
        var deferred, refUserMembers;
        deferred = Q.defer();
        refUserMembers = this.refs.refUserGroupMemberships.child(userID + '/' + groupID);
        refUserMembers.once('value', function (snapshot) {
            var data = snapshot.val();
            if (data) {
                deferred.resolve(data);
            }
            else {
                deferred.reject();
            }
        }, function () {
            deferred.reject();
        });
        return deferred.promise;
    },
    asyncGetGroupMembersList: function (groupID) {
        var deferred, refUserMembers, membersArray;
        deferred = Q.defer();
        membersArray = [];
        refUserMembers = this.refs.refGroupMembers.child(groupID);
        refUserMembers.once('value', function (snapshot) {
            var data = snapshot.val();
            if (data) {
                for (var key in data) {
                    membersArray.push(key);
                }
                deferred.resolve({
                    membersArray: membersArray,
                    membersObj: data
                });
            }
            else {
                deferred.reject('either no group exists with this groupID or group has an empty members list.');
            }
        }, function () {
            deferred.reject('permission denied to access group data. please try again.');
        });
        return deferred.promise;
    },
    asyncUpdateUser: function (userID, payload) {
        var defer = Q.defer();
        this.getRefUsers().child(userID)
            .update(payload, function (err) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });
        return defer.promise;
    },
    asyncUpdateGroup: function (groupID, payload) {
        var defer = Q.defer();
        this.getRefGroups().child(groupID)
            .update(payload, function (err) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });
        return defer.promise;
    },
    asyncUpdateQuizbank: function (quizID, payload) {
        var defer = Q.defer();
        this.getRefQuizbank().child(quizID)
            .update(payload, function (err) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });
        return defer.promise;
    },
    asyncUpdateSubGroup: function (groupID, subgroupID, payload) {
        var defer = Q.defer();
        this.getRefSubGroups().child(groupID).child(subgroupID)
            .update(payload, function (err) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });
        return defer.promise;
    },
    asyncRemoveUserProfileImage: function (userID) {
        var defer = Q.defer();
        this.getRefUsers().child(userID).child('profile-image')
            .remove(function (err) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });
        return defer.promise;
    }
};
//# sourceMappingURL=firebaseCtrl.js.map