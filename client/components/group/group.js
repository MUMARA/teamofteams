(function() {
    'use strict';

    angular
        .module('app.group')
        .controller('GroupController', ['firebaseService', 'userService', 'joinGroupService', 'groupService', '$stateParams', '$state', GroupController]);

    function GroupController(firebaseService, userService, joinGroupService, groupService, $stateParams, $state) {
        var that = this;
        //adminof subgroup checkin member
        this.openSetting = function () {
            if (that.adminOf === 'Group') {
                $state.go('user.edit-group', {groupID: that.groupID});
            } else if (that.adminOf === 'Subgroup') {
                $state.go('user.policy', {groupID: that.groupID});
            }
        };

        this.sendRequest = function () {
            joinGroupService.joinGroupRequest(that.reqObj, function(){});
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
                $state.go('user.group.subgroup-' + (that.panel.active || 'activity'), {groupID: that.groupID, subgroupID: that.panel.subgroupID});
            } else {
                $state.go('user.group.' + (that.panel.active || 'activity'), {groupID: that.groupID});
            }
        };

        init();

        function init () {
            that.isOwner = false;
            that.isMember = false;
            that.isAdmin = false;
            that.user = userService.getCurrentUser();
            that.panel = groupService.getPanelInfo();
            that.adminOf = '';
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.group = false;
            that.reqObj = {
                groupID: that.groupID,
                message: "Please add me in your group."
            };
            that.errorMsg = false;
            if (that.subgroupID) {
                firebaseService.getRefSubGroupsNames().child(that.groupID).child(that.subgroupID).once('value', function(subg){
                    if (subg.val()) {
                        that.reqObj.subgroupID = subg.key();
                        that.reqObj.subgrouptitle = (subg.val() && subg.val().title) ? subg.val().title : false;
                    }
                });
            }
            if (that.groupID) {
                firebaseService.getRefGroupsNames().child(that.groupID).once('value', function(grp){
                    if (grp.val()) {
                        that.group = {};
                        that.group.grouptitle = (grp.val() && grp.val().title) ? grp.val().title : false;
                        that.group.addresstitle = (grp.val() && grp.val()['address-title']) ? grp.val()['address-title'] : false;
                        that.group.groupImgUrl = (grp.val() && grp.val().groupImgUrl) ? grp.val().groupImgUrl : false;
                        that.group.ownerImgUrl = (grp.val() && grp.val().ownerImgUrl) ? grp.val().ownerImgUrl : false;
                    } else {
                        that.group = false;
                        that.errorMsg = "Requested Team of Team not found!";
                    }
                    firebaseService.getRefUserGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(groups){
                        if (groups.val() && groups.val()['membership-type'] == 1) {
                            that.isOwner = true;
                            that.isAdmin = true;
                            that.isMember = true;
                        } else if (groups.val() && groups.val()['membership-type'] == 2) {
                            that.isAdmin = true;
                            that.isMember = true;
                        } else if (groups.val() && groups.val()['membership-type'] == 3) {
                            that.isMember = true;
                        }
                        if (!that.isMember) {
                            that.errorMsg = that.errorMsg ? errorMsg : "You have to be Member of Team before access";
                        }
                    });
                });
            }
        }
    }
})();