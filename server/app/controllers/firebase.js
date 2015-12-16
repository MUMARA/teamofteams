/**
 * Created by Shahzad on 3/27/2015.
 */

'use strict';

var Firebase = require("firebase");
var credentials = require("../../config/credentials.js");
var firebaseBaseUrl = credentials.firebase.BASEURL;

var firbaseObj = {
    refs: {},
    init: function() {
        var refMain;
        this.refs.main = new Firebase(firebaseBaseUrl);

        refMain = this.refs.main;
        this.refs.refUsers = refMain.child("users");
        this.refs.refUserGroupMemberships = refMain.child("user-group-memberships");
        this.refs.refGroups = refMain.child("groups");
        this.refs.refGroupsNames = refMain.child("groups-names");
        this.refs.refGroupMembers = refMain.child("group-members");
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
    getRefGroupsNames: function() {
        return this.refs.refGroupsNames;
    },
    getRefGroupMembers: function() {
        return this.refs.refGroupMembers;
    },
    asyncIsUserGroupMember: function() {},
    asyncGetUserRegIDs: function() {},
    asyncSendNotUser: function() {}
};

module.exports = firbaseObj;
