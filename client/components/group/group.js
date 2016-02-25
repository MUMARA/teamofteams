(function() {
    'use strict';

    angular
        .module('app.group')
        .controller('GroupController', ['firebaseService', 'userService', 'joinGroupService', 'groupService', '$firebaseArray', '$stateParams', '$state','$rootScope','CollaboratorService', GroupController]);

    function GroupController(firebaseService, userService, joinGroupService, groupService, $firebaseArray, $stateParams, $state,$rootScope,CollaboratorService) {
        var that = this;
        //adminof subgroup checkin member
        this.openSetting = function () {
            if (that.adminOf === 'Group') {
                $state.go('user.edit-group', {groupID: that.groupID});
            } else if (that.adminOf === 'Subgroup') {
                $state.go('user.create-subgroup', {groupID: that.groupID});
            }
        };

        this.sendRequest = function () {
            joinGroupService.joinGroupRequest(that.reqObj, function(){
                $state.go('user.dashboard', {userID: that.user.userID});
            });
        }

        this.showPanel = function(pname, subgroupID) {
            if(pname === 'report') {
                groupService.setActivePanel('report');
            }
            if(pname === 'activity') {
                groupService.setActivePanel('activity');
            }
            if (pname === 'chat') {
                groupService.setActivePanel('chat');
            }
            if (pname === 'manualattendace') {
                groupService.setActivePanel('manualattendace');
            }
            if(pname === 'progressreport') {
                groupService.setActivePanel('progressreport');
            }
            // firepad tab condition
            if(pname === 'collaborator') {
              groupService.setActivePanel('collaborator');
            }
            that.panel.subgroupID = subgroupID;
            if(that.panel.subgroupID){
                $state.go('user.group.subgroup-' + (that.panel.active || 'activity'), { groupID: that.groupID, subgroupID: that.panel.subgroupID, docID: "Team of Teams Information"});
                //CollaboratorService.CreateDocument('Team of Teams Information',that.panel.groupID,that.panel.subgroupID)
            } else {
                $state.go('user.group.' + (that.panel.active || 'activity'),  {groupID: that.groupID,docID: "Team Information"});
                //CollaboratorService.CreateDocument('Team Information',that.panel.groupID)
            }
        };

        init();

        function init () {
            that.isOwner = false;
            that.isMember = false;
            that.isAdmin = false;
            that.user = userService.getCurrentUser();
            that.panel = groupService.getPanelInfo();
            that.adminOf = false;
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID ? $stateParams.subgroupID : that.panel.subgroupID;
            that.group = false;
            that.subgroups = [];
            that.errorMsg = false;
            that.reqObj = {
                groupID: that.groupID,
                message: "Please add me in your group."
            };
            if (that.subgroupID) {
                firebaseService.getRefSubGroupsNames().child(that.groupID).child(that.subgroupID).once('value', function(subg){
                    if (subg.val()) {
                        firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(that.subgroupID).once('value', function(subgrp){
                            if (subgrp.val() && subgrp.val()['membership-type'] > 0) {
                                checkGroup()
                            } else {
                                that.reqObj.subgroupID = subg.key();
                                that.reqObj.subgrouptitle = (subg.val() && subg.val().title) ? subg.val().title : false;
                                loadGroup(function(){
                                    that.errorMsg = "You have to be Member of Team before access";
                                })
                            }
                        });
                    } else {
                        that.errorMsg = "Requested Team not found!";
                    }
                });
            } else {
                checkGroup()
            }
        }
        function loadGroup (cb) {
            firebaseService.getRefGroupsNames().child(that.groupID).once('value', function(grp){
                if (grp.val()) {
                    that.group = {};
                    that.group.grouptitle = (grp.val() && grp.val().title) ? grp.val().title : false;
                    that.group.addresstitle = (grp.val() && grp.val()['address-title']) ? grp.val()['address-title'] : false;
                    that.group.groupImgUrl = (grp.val() && grp.val().groupImgUrl) ? grp.val().groupImgUrl : false;
                    that.group.ownerImgUrl = (grp.val() && grp.val().ownerImgUrl) ? grp.val().ownerImgUrl : false;



                    cb();
                } else {
                    that.errorMsg = "Requested Team of Team not found!";
                }
            });
        }
        function checkGroup () {
            if (that.groupID) {
                loadGroup(function(){
                    firebaseService.getRefUserGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(groups){
                        if (groups.val() && groups.val()['membership-type'] == 1) {
                            that.isOwner = true;
                            that.isAdmin = true;
                            that.isMember = true;
                            that.adminOf = "Group"
                        } else if (groups.val() && groups.val()['membership-type'] == 2) {
                            that.isAdmin = true;
                            that.isMember = true;
                            that.adminOf = "Group"
                        } else if (groups.val() && groups.val()['membership-type'] == 3) {
                            that.isMember = true;
                        }
                        if (!that.isMember) {
                            that.errorMsg = "You have to be Member of Team before access";
                        } else {
                            firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(subgroups){
                                for (var subgroup in subgroups.val()) {
                                    if (subgroups.val()[subgroup]['membership-type'] == 1) {
                                        that.isOwner = true;
                                        that.isAdmin = true;
                                        that.isMember = true;
                                        that.adminOf = that.adminOf || 'Subgroup';
                                    } else if (subgroups.val()[subgroup]['membership-type'] == 2) {
                                        that.isAdmin = true;
                                        that.isMember = true;
                                        that.adminOf = that.adminOf || 'Subgroup';
                                    } else if (subgroups.val()[subgroup]['membership-type'] == 3) {
                                        that.isMember = true;
                                    }
                                    if (that.isMember) {
                                        firebaseService.getRefSubGroups().child(that.groupID).child(subgroup).on('value', function(subgroupData){
                                            var subgroup = subgroupData.val();
                                            subgroup['$id'] = subgroupData.key();
                                            if (that.subgroups.length > 0) {
                                                that.subgroups.forEach(function(subgrp, indx){
                                                    if (subgrp.$id === subgroupData.key()) {
                                                        subgrp = subgroup
                                                    }
                                                    if (that.subgroups.length === (indx + 1) ) {
                                                        that.subgroups.push(subgroup);
                                                    }
                                                });
                                            } else {
                                                that.subgroups.push(subgroup);
                                            }
                                        });
                                    }
                                }
                                // that.subgroups = $firebaseArray(firebaseService.getRefSubGroups().child(that.groupID));
                            });
                        }
                    });
                })
            }
        }
    }
})();
