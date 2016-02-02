/**
 * Created by Muhammad Mohsin on 6/17/2015.
 */
/**
 * Created by sj on 6/10/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.userSetting')
        .controller('UserSettingController', ['$rootScope', 'messageService', '$stateParams', 'groupFirebaseService', '$state', '$location', 'createSubGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', '$mdSidenav', '$mdUtil', UserSettingController])
        /* .controller("DialogController", ["$mdDialog", DialogController]);*/
    function UserSettingController($rootScope, messageService, $stateParams, groupFirebaseService, $state, $location, createSubGroupService, userService, authService, $timeout, utilService, $mdDialog, $mdSidenav, $mdUtil) {

        var that = this;
        var user = userService.getCurrentUser();
        this.hide = hide;
        var user = userService.getCurrentUser();
        var groupID = $stateParams.groupID;
        this.groupId = groupID
        // var $loggedInUserObj = groupFirebaseService.getSignedinUserObj();

        this.approveMembership = approveMembership;
        this.rejectMembership = rejectMembership;
        this.changeMemberRole = changeMemberRole;

        this.openCreateSubGroupPage = function() {
            // $location.path('/user/group/' + groupID + '/create-subgroup');
            $state.go('user.create-subgroup', {groupID: groupID})
        }

        this.subgroupPage = function() {
            // $location.path('user/group/' + groupID + '/subgroup');
            $state.go('user.subgroup', {groupID: groupID})
        }
        this.editgroupPage = function() {
            // $location.path('user/group/' + groupID + '/edit-group');
            $state.go('user.edit-group', {groupID: groupID})
        }
        this.openGeoFencingPage = function() {
            // $location.path('/user/group/' + groupID + '/geoFencing');
            $state.go('user.geo-fencing', {groupID: groupID})
        }
        this.openPolicyPage = function() {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.policy', {groupID: groupID})
        }


        this.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync(groupID, user.userID)
            .then(function(syncObj) {
                that.groupSyncObj = syncObj;
                //that.groupSyncObj.groupSyncObj.$bindTo(that, "group");
                that.group = that.groupSyncObj.groupSyncObj;
                that.members = that.groupSyncObj.membersSyncArray;
                that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                that.pendingRequests = that.groupSyncObj.pendingMembershipSyncArray;
                // console.log(that.pendingRequests)
                //that.activities = that.groupSyncObj.activitiesSyncArray;


            });
            // console.log(this.members);
        function hide() {
            /*   createGroupService.cancelGroupCreation();*/
            /* $mdDialog.cancel();*/
            // $location.path('/user/group/' + groupID);
            $state.go('user.group', {groupID: groupID})

        }
        //For owner/admin: Approve membership request.
        function approveMembership(requestedMember) {
            // $loggedInUserObj.$loaded().then(function() {
                // $loggedInUserObj.userID = user.userID;
                groupFirebaseService.approveMembership(groupID, user, requestedMember)
                    .then(function(res) {
                        messageService.showSuccess("Approved Request Successfully");
                    }, function(reason) {
                        messageService.showFailure(reason);
                    });
            // });
        }

        //For owner/admin: Rejects membership request.
        function rejectMembership(requestedMember) {
            // $loggedInUserObj.$loaded().then(function() {
                // $loggedInUserObj.userID = user.userID;
                groupFirebaseService.rejectMembership(groupID, user, requestedMember)
                    .then(function(res) {
                        messageService.showSuccess("Ignored Request Successfully");
                    }, function(reason) {
                        messageService.showFailure(reason);
                    });
            // });
        }

        //For owner only: to change membership role of a member
        function changeMemberRole(newType, member) {
            groupFirebaseService.changeMemberRole(newType, member, that.group, user)
                .then(function(res) {
                    messageService.showSuccess("Changed Role Successfully");
                }, function(reason) {
                    messageService.showFailure(reason);
                });
        }

    }



})();
