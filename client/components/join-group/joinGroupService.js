/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular.module('app.JoinGroup', ['core'])
        .factory('joinGroupService', ['$timeout', '$firebaseArray', 'userFirebaseService', '$location', 'soundService', 'userService', "messageService", 'firebaseService', '$q', 'authService',
            function($timeout, $firebaseArray, userFirebaseService, $location, soundService, userService, messageService, firebaseService, $q, authService) {
                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },
                    'canActivate': function() {
                        return authService.resolveUserPage();
                    },
                    'joinGroupRequest': function(groupInfo, cb) {
                        groupInfo.groupID = groupInfo.groupID.toLowerCase().replace(/[^a-z0-9]/g, '')
                            //userFirebaseService.asyncGroupJoiningRequest($sessionStorage.loggedInUser.userID, groupInfo.groupID, groupInfo.message)
                        userFirebaseService.asyncGroupJoiningRequest(userService.getCurrentUser().userID, groupInfo.groupID, groupInfo.message)
                            .then(function() {
                                //console.log("Group join request sent successfully");
                                cb();
                                messageService.showSuccess("Team of Teams joining request sent successfully");

                            }, function(reason) {
                                //console.log("Unable to send group joining request");
                                cb();
                                messageService.showFailure(reason);
                            })
                    },
                    'groupQuery': function() {

                        return firebaseService.getRefGroupsNames()
                            .orderByKey()
                            .startAt(val)
                            .endAt(val + '~');

                    },
                    'cancelGroupJoining': function() {
                        //console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID)
                    }
                }
            }
        ]);

})();
