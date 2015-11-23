/**
 * Created by Mehmood on 5/21/2015.
 */
(function () {
    'use strict';
    angular.module( 'app.JoinGroup', ['core'])
        .factory('joinGroupService', ['userFirebaseService', '$location', '$sessionStorage', 'soundService', 'userService', "messageService",'firebaseService','$q','authService','$localStorage',
            function (userFirebaseService, $location, $sessionStorage, soundService, userService, messageService,firebaseService,$q,authService,$localStorage) {

                return {
                    'userData': function (pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },
                    'canActivate' :function(){
                        return authService.resolveUserPage();
                    },
                    'joinGroupRequest': function (groupInfo) {
                        groupInfo.groupID = groupInfo.groupID.toLowerCase().replace(/[^a-z0-9]/g, '')
                        //userFirebaseService.asyncGroupJoiningRequest($sessionStorage.loggedInUser.userID, groupInfo.groupID, groupInfo.message)
                        userFirebaseService.asyncGroupJoiningRequest($localStorage.loggedInUser.userID, groupInfo.groupID, groupInfo.message)
                            .then(function () {
                                console.log("Group join request sent successfully");
                                messageService.showSuccess("Group joining request sent successfully");

                            }, function (reason) {
                                console.log("Unable to send group joining request");
                                messageService.showFailure(reason);
                            })
                    },
                    'groupQuery':function(){

                        return firebaseService.getRefGroupsNames()
                            .orderByKey()
                            .startAt(val)
                            .endAt(val + '~');

                    },
                    'cancelGroupJoining':function(){
                        console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/'+userService.getCurrentUser().userID)
                    }
                }
            }]);

})();
