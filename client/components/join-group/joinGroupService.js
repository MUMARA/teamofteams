/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular.module('app.JoinGroup', ['core'])
        .factory('joinGroupService', ['activityStreamService', '$timeout', '$firebaseArray', 'userFirebaseService', '$location', 'soundService', 'userService', "messageService", 'firebaseService', '$q', 'authService',
            function(activityStreamService, $timeout, $firebaseArray, userFirebaseService, $location, soundService, userService, messageService, firebaseService, $q, authService) {
                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },
                    'canActivate': function() {
                        return authService.resolveUserPage();
                    },
                    'joinGroupRequest': function(groupInfo, cb) {
                        groupInfo.groupID = groupInfo.groupID.toLowerCase().replace(/[^a-z0-9]/g, '');
                            //userFirebaseService.asyncGroupJoiningRequest($sessionStorage.loggedInUser.userID, groupInfo.groupID, groupInfo.message)
                        userFirebaseService.asyncGroupJoiningRequest(userService.getCurrentUser().userID, groupInfo.groupID, groupInfo.message, groupInfo.subgroupID, groupInfo.subgrouptitle, groupInfo.membershipNo)
                            .then(function() {
                                //console.log("Group join request sent successfully");
                                if(groupInfo.subgroupID){
                                    //for group activity stream record -- START --
                                    var type = 'subgroup';
                                    var targetinfo = {id: groupInfo.subgroupID, url: groupInfo.subgroupID, title: groupInfo.subgrouptitle, type: 'subgroup' };
                                    var area = {type: 'subgroup-join'};
                                    var group_id = groupInfo.groupID;
                                    var memberuser_id = null;
                                    //for group activity record
                                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuser_id);
                                    //for group activity stream record -- END --

                                    cb();
                                    messageService.showSuccess("Team of Teams and Team joining request sent successfully");
                                } else{
                                    //for group activity stream record -- START --
                                    var _type = 'group';
                                    var _targetinfo = {id: groupInfo.groupID, url: groupInfo.groupID, title: groupInfo.title, type: 'group' };
                                    var _area = {type: 'group-join'};
                                    var _group_id = groupInfo.groupID;
                                    var _memberuser_id = null;
                                    //for group activity record
                                    activityStreamService.activityStream(_type, _targetinfo, _area, _group_id, _memberuser_id);
                                    //for group activity stream record -- END --

                                    cb();
                                    messageService.showSuccess("Team of Teams joining request sent successfully");

                                }

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
