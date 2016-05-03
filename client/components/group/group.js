(function() {
    'use strict';

    angular
        .module('app.group')
        .controller('GroupController', ['activityStreamService', 'firebaseService', 'userService', 'joinGroupService', 'groupService', '$firebaseArray', '$stateParams', '$state','$rootScope','CollaboratorService', GroupController]);

    function GroupController(activityStreamService, firebaseService, userService, joinGroupService, groupService, $firebaseArray, $stateParams, $state,$rootScope,CollaboratorService) {
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
            if(pname === 'membershipcard') {
              groupService.setActivePanel('membershipcard');
            }
            that.panel.subgroupID = subgroupID;
            if (that.panel.subgroupID) {
              if(that.panel.active == 'collaborator'){
                CollaboratorService.getinitSubGroupDocument(that.groupID, that.panel.subgroupID, function(docId) {
                    console.log('in showPanel')
                    $state.go('user.group.subgroup-' + (that.panel.active || 'activity'), { groupID: that.groupID, subgroupID: that.panel.subgroupID, docID: docId });
                })
              }
              else {
                    $state.go('user.group.subgroup-' + (that.panel.active || 'activity'), { groupID: that.groupID, subgroupID: that.panel.subgroupID});
              }

            } else {
              if(that.panel.active == 'collaborator'){
                CollaboratorService.getinitGroupDocument(that.groupID, function(docId) {
                    console.log('in - showPanel')
                    $state.go('user.group.' + (that.panel.active || 'activity'), { groupID: that.groupID, docID: docId });
                });
              }
              else {
                    if(that.panel.active == 'progressreport') {
                        $state.go('user.group.' + 'activity', { groupID: that.groupID});
                    } else {
                        $state.go('user.group.' + (that.panel.active || 'activity'), { groupID: that.groupID});
                    }
              }
            }
        };

        init();

        function init() {
            console.log('watch 1: ', JSON.stringify( activityStreamService.getSubgroupNamesAndMemberships() ) ) ;
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
                message: "Please add me in your Team.",
                membershipNo: ""
            };
            if (that.subgroupID) {
                firebaseService.getRefSubGroupsNames().child(that.groupID).child(that.subgroupID).once('value', function(subg){
                    if (subg.val()) {
                        firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(that.subgroupID).once('value', function(subgrp){
                            if (subgrp.val() && subgrp.val()['membership-type'] > 0) {
                                checkGroup();
                            } else {
                                that.reqObj.subgroupID = subg.key();
                                that.reqObj.subgrouptitle = (subg.val() && subg.val().title) ? subg.val().title : false;
                                loadGroup(function() {
                                    that.errorMsg = "You have to be Member of Team before access";
                                });
                            }
                        });
                    } else {
                        that.errorMsg = "Requested Team not found!";
                    }
                });
            } else {
                checkGroup();
            }
        }
        function loadGroup (cb) {
            firebaseService.getRefGroupsNames().child(that.groupID).once('value', function(grp){
                if (grp.val()) {
                    that.group = {};
                    that.group.grouptitle = (grp.val() && grp.val().title) ? grp.val().title : false;
                    that.reqObj.grouptitle = (grp.val() && grp.val().title) ? grp.val().title : false;
                    that.group.addresstitle = (grp.val() && grp.val()['address-title']) ? grp.val()['address-title'] : false;
                    that.group.groupImgUrl = (grp.val() && grp.val().groupImgUrl) ? grp.val().groupImgUrl : false;
                    that.group.ownerImgUrl = (grp.val() && grp.val().ownerImgUrl) ? grp.val().ownerImgUrl : false;
                    cb();
                } else {
                    that.errorMsg = "Requested Team of Team not found!";
                }
            });
        }
        function checkGroup() {
            if (that.groupID) {
                loadGroup(function() {
                    firebaseService.getRefUserGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(groups) {
                        if (groups.val() && groups.val()['membership-type'] == 1) {
                            that.isOwner = true;
                            that.isAdmin = true;
                            that.isMember = true;
                            that.adminOf = "Group";
                        } else if (groups.val() && groups.val()['membership-type'] == 2) {
                            that.isAdmin = true;
                            that.isMember = true;
                            that.adminOf = "Group";
                        } else if (groups.val() && groups.val()['membership-type'] == 3) {
                            that.isMember = true;
                        }
                        if (!that.isMember) {
                            that.errorMsg = "You have to be Member of Team before access";
                        } else {
                            if (that.isMember) {
                                firebaseService.getRefGroups().child(that.groupID).child('members-checked-in').on('value', function(groupinfo) {
                                    that.group.onlinemember = (groupinfo.val() && groupinfo.val().count) ? groupinfo.val().count : 0;
                                });
                                firebaseService.getRefGroups().child(that.groupID).child('members-count').on('value', function(groupinfo) {
                                    that.group.members = groupinfo.val() ? groupinfo.val() : 0;
                                });
                            }
                            firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(subgroups) {
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
                                        firebaseService.getRefSubGroups().child(that.groupID).child(subgroup).on('value', function(subgroupData) {
                                            var subgroup = subgroupData.val();
                                            subgroup['$id'] = subgroupData.key();
                                            if (that.subgroups.length > 0) {
                                                for (var i = 0; i <= that.subgroups.length; i++) {
                                                    if (that.subgroups[i].$id === subgroupData.key()) {
                                                        that.subgroups[i] = subgroup;
                                                        return false;
                                                    }
                                                    if (i + 1 == that.subgroups.length) {
                                                        that.subgroups.push(subgroup);
                                                        subgroupChildRemovedEvent(subgroup.$id);
                                                    }
                                                } //for loop
                                                // that.subgroups.forEach(function(subgrp, indx) {
                                                //         if (subgrp.$id === subgroupData.key()) {
                                                //             subgrp = subgroup;
                                                //         }
                                                //         if (that.subgroups.length === (indx + 1)) {
                                                //             that.subgroups.push(subgroup);
                                                //         }
                                                //     });
                                            } else {
                                                that.subgroups.push(subgroup);
                                                subgroupChildRemovedEvent(subgroup.$id);
                                            }
                                        });
                                    }
                                }
                                // that.subgroups = $firebaseArray(firebaseService.getRefSubGroups().child(that.groupID));
                            });
                        }
                    });
                });
            }
        } //checkGroup
        function subgroupChildRemovedEvent(subgroup) {
            firebaseService.getRefSubGroups().child(that.groupID).child(subgroup).off('value');
            firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(subgroup).on('child_removed', function(Oldsnapshot) {
                console.log('watch 2: ', JSON.stringify( activityStreamService.getSubgroupNamesAndMemberships() ) ) ;
                that.subgroups.forEach(function(v) {
                    if (v.$id == subgroup) {
                        that.subgroups.splice(v, 1);
                    }
                });
            });
        } //subgroupChildRemovedEvent
    }
})();
