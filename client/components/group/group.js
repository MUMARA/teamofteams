/**
 * Created by sj on 6/10/2015.
 */
(function () {
    'use strict';

    angular.module('app.group')
        .controller('GroupController', ['subgroupFirebaseService', 'checkinService', 'messageService', 'authService', 'chatService', 'firebaseService', '$firebaseArray', '$firebaseObject', '$rootScope', 'groupService', "groupFirebaseService", "$sessionStorage", "$location", "utilService", "$localStorage", "$stateParams",
            function (subgroupFirebaseService, checkinService, messageService, authService, chatService, firebaseService, $firebaseArray, $firebaseObject,  $rootScope, groupService, groupFirebaseService, $sessionStorage, $location, utilService, $localStorage, $stateParams) {

                // console.log("In Group Controller");
                var $scope = this;
                var that = this;
                // var groupID = $location.path();
                var groupID = $stateParams.groupID;
                //  $scope.groupID = groupID = utilService.trimID(groupID);
                $scope.showAttemptQuiz = function(){
                    $location.path('/user/group/' + $scope.groupID + '/quizAttempt');
                }

                var isOwner = false;
                var isMember = false;
                var isAdmin = false;
                var localStorage = $localStorage.loggedInUser;
                var $loggedInUserObj = groupFirebaseService.getSignedinUserObj()
                $scope.groupID = $stateParams.groupID;
                //$scope.userID="zia1";
                $scope.activeGroup = function () {
                    $scope.activesubID = null;
                    $scope.selectedindex = false


                }


                $scope.openCreateSubGroupPage = function () {
                    $location.path('/user/group/' + $scope.groupID + '/create-subgroup');
                }
                $scope.openUserSettingPage = function () {
                    $location.path('/user/group/' + $scope.groupID + '/user-setting');
                };
                $scope.subgroupPage = function () {
                    $location.path('user/group/' + $scope.groupID + '/subgroup');
                }
                $scope.editgroupPage = function () {
                    $location.path('user/group/' + $scope.groupID + '/edit-group');
                }
                $scope.createChannelsPage = function () {
                    $location.path('user/group/' + $scope.groupID + '/create-channels');
                }
                $scope.createTeamsChannelsPage = function () {
                    $location.path('user/group/' + $scope.groupID + '/' + $scope.activesubID + '/create-teams-channels');
                }


                $scope.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync($scope.groupID, localStorage.userID)
                    .then(function (syncObj) {
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
                        if($scope.groupSyncObj.membershipType == 1){
                            isOwner = true;
                            isAdmin = true;
                            isMember = true;
                        } else if ($scope.groupSyncObj.membershipType == 2){
                            isAdmin = true;
                            isMember = true;
                        } else if ($scope.groupSyncObj.membershipType == 3){
                            isMember = true;
                        }
                    });

                
                $scope.isOwner = function(){
                    return isOwner;
                };

                $scope.isAdmin = function(){
                    if(isOwner){
                        return true;
                    } else {
                        return isAdmin;
                    }
                };

                $scope.isMember = function(){
                    return isMember;
                };
                /*
                 this.canActivate = function(){
                 return authService.resolveUserPage();
                 }*/

// for getting user pic


                $scope.OwnerRef = $firebaseObject(firebaseService.getRefGroups().child($scope.groupID))
                    .$loaded()
                    .then(function (groupData) {

                        if (groupData['group-owner-id']) {
                            //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                            $scope.picRef = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                                .$loaded()
                                .then(function (userData) {

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
                $scope.selectedindex = 0;
                $scope.text = {
                    msg: ""
                }
                $scope.profilesCacheObj = {};

                // for viewing channel msgs
                $scope.viewChannelMessages = function (channel) {
                    // console.log(channel);
                    $scope.activeChannelID = channel.$id;
                    $scope.activeTittle = channel.title;
                    $scope.messagesArray = chatService.getChannelMessagesArray($scope.groupID, channel.$id);


                };

                $scope.filterchatters = function (chatterID) {
                    var sender = false;

                    if (chatterID === localStorage.userID) {
                        sender = true;
                    }

                    return sender;
                }
                // for getting user obj
                $scope.getUserProfile = function (userID) {
                    var profileObj;

                    if ($scope.profilesCacheObj[userID]) {
                        profileObj = $scope.profilesCacheObj[userID];
                    } else {
                        profileObj = $scope.profilesCacheObj[userID] = chatService.getUserEmails(userID);
                    }

                    return profileObj;
                };

                //for sending msgs
                $scope.SendMsg = function () {


                    chatService.SendMessages($scope.groupID, $scope.activeChannelID, $loggedInUserID, $scope.text).then(function () {


                        $scope.text.msg = "";
                        console.log("msg sent ");


                    }, function (reason) {
                        messageService.showFailure(reason);
                    })

                };


                /*this is subgroup chatting controller start ----------------------------------------------------------------*/

                $scope.activesubID;
                $scope.TeammessagesArray = [];
                $scope.activeTeamChannelID;


                $scope.subgrouppage = function (subgroup1, index) {
                    $scope.selectedindex = index;
                    $scope.activesubID = subgroup1.$id;
                    // console.log(subgroup1)
                    $scope.Teamchannels = chatService.geTeamChannelsSyncArray($scope.groupID, $scope.activesubID);
                }

                $scope.viewTeamChannelMessages = function (channel) {
                    // console.log(channel);
                    $scope.activeTeamChannelID = channel.$id;
                    $scope.activeTeamTittle = channel.title;
                    $scope.TeammessagesArray = chatService.getTeamChannelMessagesArray($scope.groupID, $scope.activesubID, channel.$id);


                };

                $scope.TeamSendMsg = function () {


                    chatService.TeamSendMessages($scope.groupID, $scope.activesubID, $scope.activeTeamChannelID, $loggedInUserID, $scope.text).then(function () {


                        $scope.text.msg = "";
                        console.log("msg sent ");


                    }, function (reason) {
                        //  messageService.showFailure(reason);
                    })

                };

                // Start Team Attendance
                this.users = [];
                this.currentSubGroup;
                this.showTeamAttendace = false;
                this.processTeamAttendance = false;
                this.openTeamAttendance = function(){
                    this.showTeamAttendace = !this.showTeamAttendace;
                    $("#wrapper").toggleClass("toggled");
                }
                this.GetSubGroupUsers = function(subgroupData, index) {
                    that.currentSubGroup = index;
                    that.processTeamAttendance = true;
                    that.users = [];
                    subgroupFirebaseService.getFirebaseGroupSubGroupMemberObj(groupID, subgroupData.$id).$loaded().then(function(subgroupsdata){
                        // data.forEach(function(subdata){
                        //     $firebaseArray(checkinService.getRefCheckinCurrentBySubgroup().child(groupID).child(subgroupData.$id).child(subdata.$id)).$loaded().then(function(userdata){
                        //         // console.log(subdata.$id);
                        //         // console.log(userdata[2].$value);
                        //         // console.log(userdata[8].$value);
                        //         if(userdata[8]) {
                        //             if(userdata[8].$value === 1) {
                        //                 var status = true;                            
                        //             } else {
                        //             var status = false;
                        //             }
                        //             var type = userdata[2].$value
                        //         } else {
                        //             var status = false;
                        //             var type = 'N/A'
                        //         }
                        //         that.users.push({id: subdata.$id, type: type, status: status, groupID: groupID, subgroupID: subgroupData.$id});
                        //     })
                        // });
                        // console.log(subgroupsdata)
                        $firebaseArray(checkinService.getRefCheckinCurrentBySubgroup().child(groupID).child(subgroupData.$id)).$loaded().then(function(usersdata){
                            // console.log(usersdata);
                            subgroupsdata.forEach(function(subgroupdata){
                                usersdata.forEach(function(userdata){
                                    // console.log(subgroupdata.$id);
                                    // console.log(userdata.$id);
                                    if (subgroupdata.$id === userdata.$id) {
                                        // console.log(userdata.$id);
                                        // console.log(userdata.message);
                                        // console.log(userdata.type);
                                        if(userdata.type === 1) {
                                            var type = true;                            
                                        } else {
                                            var type = false;
                                        }
                                        $firebaseArray(firebaseService.getRefUsers().child(userdata.$id)).$loaded().then(function(usermasterdata){
                                            // console.log(usermasterdata);
                                            for (var i = usermasterdata.length - 1; i >= 0; i--) {
                                                if(usermasterdata[i].$id === "profile-image") {
                                                    var profileImage = usermasterdata[i].$value
                                                }
                                            };
                                            that.users.push({id: userdata.$id, type: type, message: userdata.message, groupID: groupID, subgroupID: subgroupData.$id, profileImage: profileImage});                                               
                                        })
                                    }
                                });
                            });
                            that.processTeamAttendance = false;
                        });
                        // console.log(that.users);
                    });
                }
                
                var userCurrentCheckinRefBySubgroup;
                this.checkinObj = {
                    newStatus: {}
                };

                this.CheckInuser = function (grId, sgrId, userID, type) {
                    // Do not change status of self login user
                    if (localStorage.userID === userID) {
                        messageService.showFailure('To change your status, please use toolbar!');
                        that.GetSubGroupUsers({$id: sgrId});
                        return;
                    }
                    that.processTeamAttendance = true;
                    // check if user is already checked in
                    $firebaseArray(checkinService.getRefSubgroupCheckinCurrentByUser().child(userID)).$loaded().then(function(userdata){
                        // console.log(userdata);
                        // console.log(userdata[5]);
                        console.log(type)
                        if (!type) {
                            if(userdata[5].$value === 1){
                                messageService.showFailure('User already checked in at : ' + userdata[0].$value + '/' + userdata[3].$value);
                                that.processTeamAttendance = false;
                                that.GetSubGroupUsers({$id: sgrId});
                                return;
                            }
                        }
                        // check in the user
                        checkinService.createCurrentRefsBySubgroup(grId, sgrId, userID).then(function(){
                        that.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations()
                        var tempRef = checkinService.getRefCheckinCurrentBySubgroup().child(grId + '/' + sgrId + '/' + userID);
                        userCurrentCheckinRefBySubgroup = $firebaseObject(tempRef)
                            .$loaded(function (snapshot) {
                                that.checkinObj.newStatus.type = !snapshot || snapshot.type == 1 ? 2 : 1;
                                updateStatusHelper(grId, sgrId, userID, type);
                            });
                        
                        });
                    });
                    
                    
                }
                
                function updateStatusHelper(groupID, subgroupID, userID, checkoutFlag) {
                    checkinService.getCurrentLocation()
                        .then(function (location) {
                            that.checkinObj.newStatus.location = {
                                lat: location.coords.latitude,
                                lon: location.coords.longitude
                            };
                            checkinService.updateUserStatusBySubGroup(groupID, subgroupID, userID, that.checkinObj.newStatus, that.definedSubGroupLocations, null)
                                .then(function (res) {
                                    that.GetSubGroupUsers({$id: subgroupID});
                                    messageService.showSuccess(res);
                                    that.processTeamAttendance = false;
                                }, function (reason) {
                                    that.GetSubGroupUsers({$id: subgroupID});
                                    messageService.showFailure(reason);
                                });
                        }, function (err) {
                            messageService.showFailure(err.error.message);
                        });
                }
                // End Team Attendance


            }]);

})();

