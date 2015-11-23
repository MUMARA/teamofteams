/**
 * Created by sj on 6/10/2015.
 */
(function () {
    'use strict';

    angular.module('app.group')
        .controller('GroupController', ['authService', 'chatService', 'firebaseService', '$firebaseObject', '$rootScope', 'groupService', "groupFirebaseService", "$sessionStorage", "$location", "utilService", "$localStorage", "$stateParams",
            function (authService, chatService, firebaseService, $firebaseObject, $rootScope, groupService, groupFirebaseService, $sessionStorage, $location, utilService, $localStorage, $stateParams) {

                // console.log("In Group Controller");
                var $scope = this;
                // var groupID = $location.path();
                // var groupID = $stateParams.groupID;
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

                        /*  if($scope.groupSyncObj.membershipType == 1){
                         isOwner = true;
                         isAdmin = true;
                         isMember = true;
                         } else if ($scope.groupSyncObj.membershipType == 2){
                         isAdmin = true;
                         isMember = true;
                         }
                         else if ($scope.groupSyncObj.membershipType == 3){
                         isMember = true;
                         }*/
                    });

                /*
                 $scope.isOwner = function($event){
                 return isOwner;
                 };

                 $scope.isAdmin = function($event){
                 if(isOwner){
                 return true;
                 }
                 else {
                 return isAdmin;
                 }
                 };

                 $scope.isMember = function($event){
                 return isMember;
                 };

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


            }]);

})();

