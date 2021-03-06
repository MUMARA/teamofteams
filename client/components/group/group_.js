/**
 * Created by sj on 6/10/2015.
 */
(function() {
    'use strict';

    angular.module('app.group')
        .controller('GroupController', ['$sce', '$mdDialog','userService', 'dataService', 'joinGroupService', '$timeout', 'subgroupFirebaseService', 'checkinService', 'messageService', 'authService', 'chatService', 'firebaseService', '$firebaseArray', '$firebaseObject', '$rootScope', 'groupService', "groupFirebaseService", "$location", "utilService", "$state", "$stateParams",
            function($sce, $mdDialog, userService, dataService, joinGroupService, $timeout, subgroupFirebaseService, checkinService, messageService, authService, chatService, firebaseService, $firebaseArray, $firebaseObject, $rootScope, groupService, groupFirebaseService, $location, utilService, $state, $stateParams) {
                debugger
                var that = this;
                var isOwner = false;
                var isMember = false;
                var isAdmin = false;
                var user = userService.getCurrentUser();
                this.adminOf = '';
                this.groupID = $stateParams.groupID;
                this.subgroupID = $stateParams.subgroupID;
                this.reqObj = {
                    groupID: that.groupID,
                    message: "Please add me in your group."
                };
                this.selectedindex = false;
                that.activesubID = false;

                this.setFocus = function() {
                    document.getElementById("#UserSearch").focus();
                };

                this.openSetting = function() {
                    if (that.adminOf === 'Group') {
                        // $location.path('user/group/' + that.groupID + '/edit-group');
                        $state.go('user.edit-group', {groupID: that.groupID});
                    } else if (that.adminOf === 'Subgroup') {
                        // $location.path('/user/group/' + that.groupID + '/geoFencing');
                        $state.go('user.geo-fencing', {groupID: that.groupID});
                    }
                };

                function activate(){
                    that.userObj = groupService.getOwnerImg(that.groupID);
                    that.channels = chatService.getGroupChannelsSyncArray(that.groupID);
                    that.users =  dataService.getUserData();
                }

                if (this.subgroupID) {
                    firebaseService.getRefSubGroupsNames().child(that.groupID).child(this.subgroupID).once('value', function(subg){
                        if (subg.val()) {
                            that.reqObj.subgroupID = subg.key();
                            that.reqObj.subgrouptitle = (subg.val() && subg.val().title) ? subg.val().title : false;
                        }
                    });
                }
                if (this.groupID) {
                    firebaseService.getRefGroupsNames().child(that.groupID).once('value', function(grp){
                        if (grp.val()) {
                            that.reqObj.groupID = grp.key();
                            that.reqObj.grouptitle = (grp.val() && grp.val().title) ? grp.val().title : false;
                            that.reqObj.addresstitle = (grp.val() && grp.val()['address-title']) ? grp.val()['address-title'] : false;
                            that.reqObj.groupImgUrl = (grp.val() && grp.val().groupImgUrl) ? grp.val().groupImgUrl : false;
                            that.reqObj.ownerImgUrl = (grp.val() && grp.val().ownerImgUrl) ? grp.val().ownerImgUrl : false;
                        }
                    });
                }
                firebaseService.getRefUserGroupMemberships().child(user.userID).child(this.groupID).once('value', function(groups){
                    if (groups.val()['membership-type'] == 1) {
                        isOwner = true;
                        isAdmin = true;
                        isMember = true;
                    } else if (groups.val()['membership-type'] == 2) {
                        isAdmin = true;
                        isMember = true;
                    } else if (groups.val()['membership-type'] == 3) {
                        isMember = true;
                    }

                    firebaseService.getRefUserSubGroupMemberships().child(user.userID).child(this.groupID).once('value', function(subgroups){
                        for (var subgroup in subgroups.val()) {
                            if (subgroups.val()[subgroup]['membership-type'] == 1) {
                                isOwner = true;
                                isAdmin = true;
                                isMember = true;
                                that.adminOf = 'Subgroup';
                            } else if (subgroups.val()[subgroup]['membership-type'] == 2) {
                                isAdmin = true;
                                isMember = true;
                                that.adminOf = 'Subgroup';
                            } else if (subgroups.val()[subgroup]['membership-type'] == 3) {
                                isMember = true;
                            }
                        }

                        if (isMember) {
                            groupFirebaseService.getGroupSyncObjAsync(that.groupID, user.userID)
                            .then(function(syncObj) {
                                that.groupSyncObj = syncObj;
                                that.group = that.groupSyncObj.groupSyncObj;
                                that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                                that.members = that.groupSyncObj.membersSyncArray;
                                if (that.groupSyncObj.membershipType == 1) {
                                    isOwner = true;
                                    isAdmin = true;
                                    isMember = true;
                                    that.adminOf = 'Group';
                                } else if (that.groupSyncObj.membershipType == 2) {
                                    isAdmin = true;
                                    isMember = true;
                                    that.adminOf = 'Group';
                                } else if (that.groupSyncObj.membershipType == 3) {
                                    isMember = true;
                                }
                                if (isMember) {
                                    activate();
                                }
                            });
                        }
                    });
                });

                this.sendRequest = function(){
                    joinGroupService.joinGroupRequest(that.reqObj, function(){});
                };

                this.isOwner = function() {
                    return isOwner;
                };

                this.isAdmin = function() {
                    if (isOwner) {
                        return true;
                    } else {
                        return isAdmin;
                    }
                };

                this.isMember = function() {
                    return isMember;
                };


                this.activeTitle = 'Select Channel to Start Chat';
                this.activeChannelID = null;
                this.activeTeamChannelID = null;
                this.messagesArray = [];

                this.subgrouppage = function(subgroup1, index) {
                    $state.go('user.group.subgroup-' + that.panel.active, {groupID: that.groupID, subgroupID: subgroup1.$id});
                    that.showPanel(that.panel.active);

                    // that.selectedindex = index;
                    // that.activesubID = subgroup1.$id;
                    // if (that.activePanel === 'chat') {
                    //     that.channels = chatService.geTeamChannelsSyncArray(that.groupID, that.activesubID);
                    // } else {
                    //     that.GetSubGroupUsers(subgroup1, index)
                    // }
                };

                /*this is group chatting controller start ----------------------------------------------------------------*/

                this.showNewChannel = function(ev) {
                    var confirm = $mdDialog.confirm()
                          .title('Channel Type')
                          .textContent('What Channel would you like to create?')
                          .ariaLabel('channel type')
                          .targetEvent(ev)
                          .ok('Team')
                          .cancel('Team of Teams');
                    $mdDialog.show(confirm).then(function() {
                        if (that.activesubID) {
                            $state.go('user.create-teams-channels', {groupID: that.groupID, teamID: that.activesubID});
                        } else {
                            $mdDialog.show(
                              $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .clickOutsideToClose(true)
                                .title('Alert')
                                .textContent('You have to select Team before creating channel.')
                                .ariaLabel('No Team Alert')
                                .ok('Got it!')
                                .targetEvent(ev)
                            );
                        }
                    }, function() {
                        $state.go('user.create-channels', {groupID: that.groupID});
                    });
                };



                this.text = {
                    msg: ""
                };
                this.profilesCacheObj = {};

                // for viewing channel msgs
                this.viewChannelMessages = function(channel) {
                    // console.log(channel);
                    that.activeChannelID = channel.$id;
                    that.activeTitle = channel.title;
                    if (that.activesubID) {
                        that.messagesArray = chatService.getTeamChannelMessagesArray(that.groupID, that.activesubID, channel.$id);
                    } else {
                        that.messagesArray = chatService.getChannelMessagesArray(that.groupID, channel.$id);
                    }

                };


                this.filterchatters = function(chatterID) {
                        var sender = false;

                        if (chatterID === user.userID) {
                            sender = true;
                        }

                        return sender;
                    };
                    // for getting user obj
                this.getUserProfile = function(userID) {
                    var profileObj;

                    if (that.profilesCacheObj[userID]) {
                        profileObj = that.profilesCacheObj[userID];
                    } else {
                        profileObj = that.profilesCacheObj[userID] = chatService.getUserEmails(userID);
                    }

                    return profileObj;
                };

                //for sending msgs
                this.SendMsg = function() {


                    chatService.SendMessages(that.groupID, that.activeChannelID, user, that.text).then(function() {


                        that.text.msg = "";
                        // console.log("msg sent ");


                    }, function(reason) {
                        messageService.showFailure(reason);
                    });

                };


                /*this is subgroup chatting controller start ----------------------------------------------------------------*/


                this.viewTeamChannelMessages = function(channel) {
                    // console.log(channel);
                    that.activeTeamChannelID = channel.$id;
                    that.activeTeamTittle = channel.title;
                    that.TeammessagesArray = chatService.getTeamChannelMessagesArray(that.groupID, that.activesubID, channel.$id);
                };

                this.TeamSendMsg = function() {


                    chatService.TeamSendMessages(that.groupID, that.activesubID, that.activeChannelID, user, that.text).then(function() {


                        that.text.msg = "";
                        // console.log("msg sent ");


                    }, function(reason) {
                        //  messageService.showFailure(reason);
                    });

                };
                // Start Team Attendance
                //update status when user checked-in or checked-out
                this.users = [];
                this.showParams = true;
                this.processTeamAttendance = false;
                this.panel = groupService.getPanelInfo();
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



                this.report = [];
                this.reportParam = {};
                this.showReportData = function (user) {
                    this.report = [];
                    that.showParams = false;
                    this.count = -1;
                    that.reportParam = {
                        fullName: user.fullName,
                        groupsubgroupTitle: user.groupsubgroupTitle,
                    };
                    firebaseService.getRefsubgroupCheckinRecords().child(user.groupID).child(user.subgroupID).child(user.id).on('child_added', function(snapshot){
                        var fullDate = new Date(snapshot.val().timestamp);
                        var newDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
                        if (snapshot.val().message == 'Checked-in') {
                            that.report.push({
                                checkin: snapshot.val().timestamp,
                                checkindate: newDate
                            });
                            that.count++;
                        } else if (snapshot.val().message == 'Checked-out') {
                            that.report[that.count].checkout = snapshot.val().timestamp;
                            that.report[that.count].checkoutdate = newDate;
                        }
                    });
                };


                this.GetSubGroupUsers = function(subgroupData, index) {
                    $state.go('user.group.' + that.panel.active, {groupID: that.groupID});
                    that.showPanel(that.panel.active);
                    // if (!subgroupData) {
                    //     that.users = [];
                    //     that.users =  dataService.getUserData();
                    //     that.selectedindex = false;
                    //     that.activesubID = false;
                    //     this.channels = chatService.getGroupChannelsSyncArray(that.groupID);
                    //     return;
                    // }
                    // that.users = [];
                    // dataService.getUserData().forEach(function(val,indx){
                    //     if(val.groupID == that.groupID && val.subgroupID == subgroupData.$id){
                    //         that.users.push(val);
                    //     }
                    // });
                };

                var userCurrentCheckinRefBySubgroup;
                this.checkinObj = {
                    newStatus: {}
                };

                this.CheckInuser = function(grId, sgrId, userID, type) {
                    // Do not change status of self login user
                    if (user.userID === userID) {
                        messageService.showFailure('To change your status, please use toolbar!');
                        dataService.setUserCheckInOut(grId, sgrId, userID, type);
                        return;
                    }
                    that.processTeamAttendance = true;
                    // check if user is already checked in
                    $firebaseArray(checkinService.getRefSubgroupCheckinCurrentByUser().child(userID)).$loaded().then(function(userdata) {
                        // console.log(userdata);
                        // console.log(userdata[5]);
                        // console.log(type)
                        if (!type) {
                            console.log(userdata);
                            if (userdata[5] && userdata[5].$value === 1) {
                                messageService.showFailure('User already checked in at : ' + userdata[0].$value + '/' + userdata[3].$value);
                                that.processTeamAttendance = false;
                                dataService.setUserCheckInOut(grId, sgrId, userID, true);
                                return;
                            }
                        }
                        // check in the user
                        checkinService.createCurrentRefsBySubgroup(grId, sgrId, userID).then(function() {
                            that.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations();
                            var tempRef = checkinService.getRefCheckinCurrentBySubgroup().child(grId + '/' + sgrId + '/' + userID);
                            userCurrentCheckinRefBySubgroup = $firebaseObject(tempRef)
                                .$loaded(function(snapshot) {
                                    that.checkinObj.newStatus.type = !snapshot || snapshot.type == 1 ? 2 : 1;
                                    updateStatusHelper(grId, sgrId, userID, true);
                                });

                        });
                    });


                };

                function updateStatusHelper(groupID, subgroupID, userID, checkoutFlag) {
                    checkinService.getCurrentLocation()
                        .then(function(location) {
                            that.checkinObj.newStatus.location = {
                                lat: location.coords.latitude,
                                lon: location.coords.longitude
                            };
                            checkinService.updateUserStatusBySubGroup(groupID, subgroupID, userID, that.checkinObj.newStatus, that.definedSubGroupLocations, null)
                                .then(function(res) {
                                    messageService.showSuccess(res);
                                    that.processTeamAttendance = false;
                                }, function(reason) {
                                    messageService.showFailure(reason);
                                    that.processTeamAttendance =false;
                                });
                        }, function(err) {
                            that.processTeamAttendance = false;
                            messageService.showFailure(err.error.message);
                        });
                }
                // End Team Attendance


                this.showConfirm = function(ev) {
                    var confirm = $mdDialog.confirm()
                          .title('Confirmation')
                          .textContent('Would you checkout all members?')
                          .ariaLabel('checkoutAllMembers')
                          .targetEvent(ev)
                          .ok('Yes!')
                          .cancel('No');
                    $mdDialog.show(confirm).then(function() {
                        that.checkoutAll();
                    }, function() {
                        // that.status = 'You decided to keep your debt.';
                    });
                };


                this.checkoutObj = {};
                this.checkoutAll = function() {
                    that.processTeamAttendance = true;
                    // checkinService.getCurrentLocation()
                    //     .then(function (location) {
                    //         that.checkoutObj.location = {
                    //             lat: location.coords.latitude,
                    //             lon: location.coords.longitude
                    //         };
                    //that.users.push({id: userdata.$id, type: type, message: userdata.message, groupID: groupID, subgroupID: subgroupData.$id, profileImage: profileImage});
                    that.users.forEach(function(val, i) {
                        if ((val.type === 1 || val.type === true) && (val.id != user.userID)) {

                            // checkin type 1 on firebase node subgroup-check-in-current-by-user
                            // checkout type 2 on firebase node subgroup-check-in-current-by-user
                            // checkinService.getRefSubgroupCheckinCurrentByUser().child(val.id).once('value', function(snapshot){
                            //     console.log(snapshot.val());
                            //     console.log(snapshot.val().type);
                            // })

                            checkinService.createCurrentRefsBySubgroup(val.groupID, val.subgroupID, val.id).then(function() {
                                that.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations();
                                var tempRef = checkinService.getRefCheckinCurrentBySubgroup().child(val.groupID + '/' + val.subgroupID + '/' + val.id);
                                userCurrentCheckinRefBySubgroup = $firebaseObject(tempRef)
                                    .$loaded(function(snapshot) {
                                        that.checkinObj.newStatus.type = !snapshot || snapshot.type == 1 ? 2 : 1;
                                        updateAllStatusHelper(val.groupID, val.subgroupID, val.id, 1);
                                    });
                            });
                        }
                        if (that.users.length === i) {
                            that.processTeamAttendance = false;
                        }
                    }); //foreach

                    // that.checkoutObj.type = 2;
                    // var numberofusers = 0;
                    //checkinService.updateAllSubGroupCount(groupID, that.currentSudGroupID, numberofusers);
                    // }, function (err) {
                    //     messageService.showFailure(err.error.message);
                    // });
                };

                function updateAllStatusHelper(groupID, subgroupID, userID, checkoutFlag) {
                    // console.log(userID + ' ' + groupID + ' ' + subgroupID)
                    checkinService.getCurrentLocation()
                        .then(function(location) {
                            that.checkinObj.newStatus.location = {
                                lat: location.coords.latitude,
                                lon: location.coords.longitude
                            };
                            checkinService.updateUserStatusBySubGroup(groupID, subgroupID, userID, that.checkinObj.newStatus, that.definedSubGroupLocations, null)
                                .then(function(res) {
                                    messageService.showSuccess(res);
                                    that.processTeamAttendance = false;
                                }, function(reason) {
                                    that.processTeamAttendance = false;
                                    messageService.showFailure(reason);
                                });
                        }, function(err) {
                            that.processTeamAttendance = false;
                            messageService.showFailure(err.error.message);
                        });
                } //updateAllStatusHelper




            }
        ]);

})();
