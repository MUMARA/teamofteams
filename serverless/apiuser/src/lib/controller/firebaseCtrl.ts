/// <reference path="../../../typings/tsd.d.ts" />

import * as Firebase from 'firebase';
import * as Q from 'q';

import {credentials} from '../config/credentials';

let firebaseBaseUrl = credentials.firebase.BASEURL;

export let firebaseCtrl = {
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
        let deferred, refUserMembers;
        deferred = Q.defer();
        refUserMembers = this.refs.refUserGroupMemberships.child(userID + '/' + groupID);
        refUserMembers.once('value', function (snapshot) {
            let data = snapshot.val();
            if (data) {
                deferred.resolve(data);
            } else {
                deferred.reject();
            }
        }, function () {
            deferred.reject();
        });
        return deferred.promise;
    },
    asyncGetGroupMembersList: function (groupID) {
        let deferred, refUserMembers, membersArray;
        deferred = Q.defer();
        membersArray = [];
        refUserMembers = this.refs.refGroupMembers.child(groupID);
        refUserMembers.once('value', function (snapshot) {
            let data = snapshot.val();
            if (data) {
                for (let key in data) {
                    membersArray.push(key);
                }
                deferred.resolve({
                    membersArray: membersArray,
                    membersObj: data
                });
            } else {
                deferred.reject('either no group exists with this groupID or group has an empty members list.');
            }
        }, function () {
            deferred.reject('permission denied to access group data. please try again.');
        });
        return deferred.promise;
    },
    asyncUpdateUser: function (userID, payload) {
        let defer = Q.defer();
        this.getRefUsers().child(userID)
            .update(payload, function (err) {
                if (err) {
                    defer.reject(err)
                } else {
                    defer.resolve()
                }
            });
        return defer.promise;
    },
    asyncUpdateGroup: function (groupID, payload) {
        let defer = Q.defer();
        this.getRefGroups().child(groupID)
            .update(payload, function (err) {
                if (err) {
                    defer.reject(err)
                } else {
                    defer.resolve()
                }
            });
        return defer.promise;
    },
    asyncUpdateQuizbank: function (quizID, payload) {
        let defer = Q.defer();
        this.getRefQuizbank().child(quizID)
            .update(payload, function (err) {
                if (err) {
                    defer.reject(err)
                } else {
                    defer.resolve()
                }
            });

        return defer.promise;
    },
    asyncUpdateSubGroup: function (groupID, subgroupID, payload) {
        let defer = Q.defer();
        this.getRefSubGroups().child(groupID).child(subgroupID)
            .update(payload, function (err) {
                if (err) {
                    defer.reject(err)
                } else {
                    defer.resolve()
                }
            });
        return defer.promise;
    },
    asyncRemoveUserProfileImage: function (userID) {
        let defer = Q.defer();
        this.getRefUsers().child(userID).child('profile-image')
            .remove(function (err) {
                if (err) {
                    defer.reject(err)
                } else {
                    defer.resolve()
                }
            });
        return defer.promise;
    }
};