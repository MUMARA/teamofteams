/**
 * Created by sj on 6/10/2015.
 */
(function() {
    'use strict';

    angular.module('app.group')
        .controller('GroupController', ['$mdDialog','dataService', '$timeout', 'subgroupFirebaseService', 'checkinService', 'messageService', 'authService', 'chatService', 'firebaseService', '$firebaseArray', '$firebaseObject', '$rootScope', 'groupService', "groupFirebaseService", "$sessionStorage", "$location", "utilService", "$localStorage", "$stateParams",
            function($mdDialog, dataService, $timeout, subgroupFirebaseService, checkinService, messageService, authService, chatService, firebaseService, $firebaseArray, $firebaseObject, $rootScope, groupService, groupFirebaseService, $sessionStorage, $location, utilService, $localStorage, $stateParams) {

                // console.log("In Group Controller");
                var $scope = this;
                var that = this;
                // var groupID = $location.path();
                var groupID = $stateParams.groupID;
                //  $scope.groupID = groupID = utilService.trimID(groupID);
                $scope.showAttemptQuiz = function() {
                    $location.path('/user/group/' + that.groupID + '/quizAttempt');
                }

                var isOwner = false;
                var isMember = false;
                var isAdmin = false;
                var localStorage = $localStorage.loggedInUser;
                var $loggedInUserObj = groupFirebaseService.getSignedinUserObj()
                this.groupID = $stateParams.groupID;
                //$scope.userID="zia1";
                $scope.activeGroup = function() {
                    that.activesubID = null;
                    that.selectedindex = false;
                    that.users =  dataService.getUserData();


                }

                this.setFocus = function() {
                    document.getElementById("#UserSearch").focus();
                }

                $scope.openCreateSubGroupPage = function() {
                    $location.path('/user/group/' + $scope.groupID + '/create-subgroup');
                }
                $scope.openUserSettingPage = function() {
                    $location.path('/user/group/' + $scope.groupID + '/user-setting');
                };
                $scope.subgroupPage = function() {
                    $location.path('user/group/' + $scope.groupID + '/subgroup');
                }
                $scope.editgroupPage = function() {
                    $location.path('user/group/' + $scope.groupID + '/edit-group');
                }
                $scope.createChannelsPage = function() {
                    $location.path('user/group/' + $scope.groupID + '/create-channels');
                }
                $scope.createTeamsChannelsPage = function() {
                    $location.path('user/group/' + $scope.groupID + '/' + $scope.activesubID + '/create-teams-channels');
                }



                $scope.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync($scope.groupID, localStorage.userID)
                    .then(function(syncObj) {
                        $scope.groupSyncObj = syncObj;
                        // $rootScope.groupSyncObj2 = syncObj;
                        // $scope.groupSyncObj.groupSyncObj.$bindTo($scope, "group");
                        $scope.group = $scope.groupSyncObj.groupSyncObj;
                        $scope.subgroups = $scope.groupSyncObj.subgroupsSyncArray;
                        // console.log($scope.subgroups)
                        $scope.members = $scope.groupSyncObj.membersSyncArray;
                        //$scope.pendingRequests = $scope.groupSyncObj.pendingMembershipSyncArray;
                        //$scope.activities = $scope.groupSyncObj.activitiesSyncArray;

                        // console.log($scope.groupSyncObj.membershipType);
                        if ($scope.groupSyncObj.membershipType == 1) {
                            isOwner = true;
                            isAdmin = true;
                            isMember = true;
                        } else if ($scope.groupSyncObj.membershipType == 2) {
                            isAdmin = true;
                            isMember = true;
                        } else if ($scope.groupSyncObj.membershipType == 3) {
                            isMember = true;
                        }
                    });


                $scope.isOwner = function() {
                    return isOwner;
                };

                $scope.isAdmin = function() {
                    if (isOwner) {
                        return true;
                    } else {
                        return isAdmin;
                    }
                };

                $scope.isMember = function() {
                    return isMember;
                };
                /*
                 this.canActivate = function(){
                 return authService.resolveUserPage();
                 }*/

                // for getting user pic


                $scope.OwnerRef = $firebaseObject(firebaseService.getRefGroups().child($scope.groupID))
                    .$loaded()
                    .then(function(groupData) {
                        // console.log(groupData)

                        // Get Number of online 

                        if (groupData['group-owner-id']) {
                            //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                            $scope.picRef = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']) /*.child('profile-image')*/ )
                                .$loaded()
                                .then(function(userData) {

                                    $scope.userObj = userData;

                                })

                        }
                    });


                /*this is group chatting controller start ----------------------------------------------------------------*/

                $scope.channels = chatService.getGroupChannelsSyncArray($scope.groupID);
                var $loggedInUserID = firebaseService.getSignedinUserObj();
                $scope.messagesArray = [];
                $scope.activeChannelID = null;
                $scope.activeTittle = null;
                $scope.selectedindex = false;
                $scope.text = {
                    msg: ""
                }
                $scope.profilesCacheObj = {};

                // for viewing channel msgs
                $scope.viewChannelMessages = function(channel) {
                    // console.log(channel);
                    $scope.activeChannelID = channel.$id;
                    $scope.activeTittle = channel.title;
                    $scope.messagesArray = chatService.getChannelMessagesArray($scope.groupID, channel.$id);


                };

                $scope.filterchatters = function(chatterID) {
                        var sender = false;

                        if (chatterID === localStorage.userID) {
                            sender = true;
                        }

                        return sender;
                    }
                    // for getting user obj
                $scope.getUserProfile = function(userID) {
                    var profileObj;

                    if ($scope.profilesCacheObj[userID]) {
                        profileObj = $scope.profilesCacheObj[userID];
                    } else {
                        profileObj = $scope.profilesCacheObj[userID] = chatService.getUserEmails(userID);
                    }

                    return profileObj;
                };

                //for sending msgs
                $scope.SendMsg = function() {


                    chatService.SendMessages($scope.groupID, $scope.activeChannelID, $loggedInUserID, $scope.text).then(function() {


                        $scope.text.msg = "";
                        console.log("msg sent ");


                    }, function(reason) {
                        messageService.showFailure(reason);
                    })

                };


                /*this is subgroup chatting controller start ----------------------------------------------------------------*/

                $scope.activesubID;
                $scope.TeammessagesArray = [];
                $scope.activeTeamChannelID;


                $scope.subgrouppage = function(subgroup1, index) {
                    $scope.selectedindex = index;
                    $scope.activesubID = subgroup1.$id;
                    if (that.activePanel === 'chat') {
                        $scope.Teamchannels = chatService.geTeamChannelsSyncArray($scope.groupID, $scope.activesubID);    
                    } else {                        
                        that.GetSubGroupUsers(subgroup1, index)
                    }
                }

                $scope.viewTeamChannelMessages = function(channel) {
                    // console.log(channel);
                    $scope.activeTeamChannelID = channel.$id;
                    $scope.activeTeamTittle = channel.title;
                    $scope.TeammessagesArray = chatService.getTeamChannelMessagesArray($scope.groupID, $scope.activesubID, channel.$id);


                };

                $scope.TeamSendMsg = function() {


                    chatService.TeamSendMessages($scope.groupID, $scope.activesubID, $scope.activeTeamChannelID, $loggedInUserID, $scope.text).then(function() {


                        $scope.text.msg = "";
                        console.log("msg sent ");


                    }, function(reason) {
                        //  messageService.showFailure(reason);
                    })

                };
                // Start Team Attendance
                //update status when user checked-in or checked-out
                this.users = [];
                this.currentSubGroup;
                this.currentSudGroupID;
                this.showActivity = false;
                this.showReport = true;
                this.showChat = false;
                this.showManualAttendace = false;
                this.showParams = true;
                this.processTeamAttendance = false;
                this.activePanel = 'activity';
                this.showPanel = function(pname) {
                    if(pname === 'report') {
                        that.showReport = true; 
                        that.activePanel = 'report';
                    } else {
                        that.showReport = false;
                    }
                    if(pname === 'activity') {
                        that.showActivity = true; 
                        that.activePanel = 'activity';
                    } else {
                        that.showActivity = false;
                    }
                    if (pname === 'chat') {
                        that.showChat = true; 
                        that.activePanel = 'chat';
                    } else {
                        that.showChat = false;
                    }
                    if (pname === 'manualAttendace') {
                        that.showManualAttendace = true;
                        that.activePanel = 'manualAttendace';
                    } else {
                        that.showManualAttendace = false;
                    }
                }

                that.users =  dataService.getUserData();                
             
                this.report = [];
                this.reportParam = {};
                this.showReportData = function (user) {
                    this.report = [];
                    that.showParams = false;
                    this.count = -1
                    that.reportParam = {
                        fullName: user.fullName,
                        groupsubgroupTitle: user.groupsubgroupTitle,
                    }
                    firebaseService.getRefsubgroupCheckinRecords().child(user.groupID).child(user.subgroupID).child(user.id).on('child_added', function(snapshot){
                        var fullDate = new Date(snapshot.val().timestamp);
                        var newDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
                        if (snapshot.val().message == 'Checked-in') {
                            that.report.push({
                                checkin: snapshot.val().timestamp,
                                checkindate: newDate
                            })
                            that.count++
                        } else if (snapshot.val().message == 'Checked-out') {
                            that.report[that.count].checkout = snapshot.val().timestamp;
                            that.report[that.count].checkoutdate = newDate;
                        }
                    });
                }
                    
                this.GetSubGroupUsers = function(subgroupData, index) {
                    if (!subgroupData) {
                        that.users =  dataService.getUserData();
                        that.selectedindex = false;
                        return;
                    }
                    that.currentSubGroup = index;
                    that.currentSudGroupID = subgroupData.$id;
                    // that.processTeamAttendance = true;
                    //for emprty array on team change
                    that.users = [];

                    dataService.getUserData().forEach(function(val,indx){
                        if(val.groupID == groupID && val.subgroupID == subgroupData.$id){
                            that.users.push(val);
                        }
                    });
                }

                var userCurrentCheckinRefBySubgroup;
                this.checkinObj = {
                    newStatus: {}
                };

                this.CheckInuser = function(grId, sgrId, userID, type) {
                    // Do not change status of self login user
                    if (localStorage.userID === userID) {
                        messageService.showFailure('To change your status, please use toolbar!');
                        return;
                    }
                    that.processTeamAttendance = true;
                    // check if user is already checked in
                    $firebaseArray(checkinService.getRefSubgroupCheckinCurrentByUser().child(userID)).$loaded().then(function(userdata) {
                        // console.log(userdata);
                        // console.log(userdata[5]);
                        // console.log(type)
                        if (!type) {
                            if (userdata[5] && userdata[5].$value === 1) {
                                messageService.showFailure('User already checked in at : ' + userdata[0].$value + '/' + userdata[3].$value);
                                that.processTeamAttendance = false;
                                return;
                            }
                        }
                        // check in the user
                        checkinService.createCurrentRefsBySubgroup(grId, sgrId, userID).then(function() {
                            that.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations()
                            var tempRef = checkinService.getRefCheckinCurrentBySubgroup().child(grId + '/' + sgrId + '/' + userID);
                            userCurrentCheckinRefBySubgroup = $firebaseObject(tempRef)
                                .$loaded(function(snapshot) {
                                    that.checkinObj.newStatus.type = !snapshot || snapshot.type == 1 ? 2 : 1;
                                    updateStatusHelper(grId, sgrId, userID, type);
                                });

                        });
                    });


                }

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
                        // $scope.status = 'You decided to keep your debt.';
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
                        if ((val.type === 1 || val.type === true) && (val.id != localStorage.userID)) {
                            checkinService.createCurrentRefsBySubgroup(val.groupID, val.subgroupID, val.id).then(function() {
                                that.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations()
                                var tempRef = checkinService.getRefCheckinCurrentBySubgroup().child(val.groupID + '/' + val.subgroupID + '/' + val.id);
                                userCurrentCheckinRefBySubgroup = $firebaseObject(tempRef)
                                    .$loaded(function(snapshot) {
                                        that.checkinObj.newStatus.type = !snapshot || snapshot.type == 1 ? 2 : 1;
                                        updateAllStatusHelper(val.groupID, val.subgroupID, val.id, 1);
                                    });
                            });
                        } else { //if
                            that.processTeamAttendance = false;
                        }
                    }) //foreach

                    // that.checkoutObj.type = 2;
                    // var numberofusers = 0;
                    //checkinService.updateAllSubGroupCount(groupID, that.currentSudGroupID, numberofusers);
                    // }, function (err) {
                    //     messageService.showFailure(err.error.message);
                    // });
                }

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
