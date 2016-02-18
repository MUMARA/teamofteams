/**
 * Created by Shahzad on 5/23/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.editGroup', ['core', 'ngMdIcons'])
        .factory('editGroupService', ['$timeout', '$rootScope', 'userFirebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', 'firebaseService', '$firebaseObject', '$stateParams',
            function($timeout, $rootScope, userFirebaseService, $location, soundService, userService, messageService, $q, $http, appConfig, firebaseService, $firebaseObject, $stateParams) {

                var pageUserId = userService.getCurrentUser().userID;

                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },

                    'editGroup': function(groupInfo, groupRef, form, cb) {
                        var groupNameRef = $firebaseObject(firebaseService.getRefGroupsNames().child(groupInfo.$id));
                        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                        var dataToSet = {
                            title: groupInfo.title,
                            desc: groupInfo.desc,
                            'address-title': groupInfo['address-title'],
                            address: groupInfo.address,
                            phone: groupInfo.phone,
                            timeZone: groupInfo.timeZone,
                            timestamp: firebaseTimeStamp

                        };
                        //var $groupRef = $firebaseObject(firebaseService.getRefGroups().child(groupInfo.groupID || groupInfo.$id));
                        angular.extend(groupRef, dataToSet);
                        groupRef['logo-image'].url = groupInfo['logo-image'].url
                        groupRef.$save().then(function(response) {
                            //console.log(groupNameRef);
                            groupNameRef.title = groupInfo.title;
                            groupNameRef.groupImgUrl = groupInfo['logo-image'].url
                            groupNameRef.$save()
                                .then(function() {
                                    $timeout(function() {
                                        form.$submitted = false
                                    })
                                    $rootScope.newImg = null;
                                    cb();
                                    messageService.showSuccess('Team of Teams Edited Successfully')
                                }, function(group) {
                                    cb();
                                    messageService.showFailure("Team of Teams not edited");
                                })

                        }, function(group) {
                            $timeout(function() {
                                form.$submitted = false
                            })
                            cb();
                            messageService.showFailure("Team of Teams not edited");
                        })
                    },

                    'cancelGroupCreation': function(groupID) {
                        //console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/group/' + groupID)
                    }
                };

                function Uint8ToString(u8a) {
                    var CHUNK_SZ = 0x8000;
                    var c = [];
                    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
                        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
                    }

                    return c.join("");

                }
            }
        ])

})();
