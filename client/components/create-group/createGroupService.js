/**
 * Created by Shahzad on 5/23/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.createGroup', ['core', 'ngMdIcons'])
        .factory('createGroupService', ['userFirebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', '$rootScope','CollaboratorService',
            function(userFirebaseService, $location, soundService, userService, messageService, $q, $http, appConfig, $rootScope,CollaboratorService) {

                var pageUserId = userService.getCurrentUser().userID;

                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },
                    'createGroup': function(groupInfo, formDataFlag, form) {
                        groupInfo.groupID = groupInfo.groupID.toLowerCase();
                        groupInfo.groupID = groupInfo.groupID.replace(/[^a-z0-9]/g, '');
                        userFirebaseService.asyncCreateGroup(pageUserId, groupInfo, this.userData(pageUserId), formDataFlag)
                            .then(function(response) {
                                form.$submitted = false;
                                console.log("Group Creation Successful", groupInfo);
                                $rootScope.newImg = null
                                var unlistedMembersArray = response.unlistedMembersArray;
                                if (unlistedMembersArray.length > 0) {

                                    messageService.showSuccess("Team of Teams creation Successful, but following are not valid IDs: " + unlistedMembersArray);
                                } else {
                                    messageService.showSuccess("Team of Teams creation Successful");
                                    CollaboratorService.CreateDocument("Team Information",groupInfo.groupID);
                                }
                                $location.path('/user/' + pageUserId);
                            }, function(group) {
                                form.$submitted = false;
                                $rootScope.newImg = null;
                                messageService.showFailure("Team of Teams not created, " + " already exists");
                            })
                    },
                    'cancelGroupCreation': function(userId) {
                        //console.log("Group Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + pageUserId)
                    },
                    'uploadPicture': function(file, groupID) {
                        var defer = $q.defer();
                        var reader = new FileReader();
                        reader.onload = function() {

                            var blobBin = atob(reader.result.split(',')[1]);
                            var array = [];
                            for (var i = 0; i < blobBin.length; i++) {
                                array.push(blobBin.charCodeAt(i));
                            }
                            var fileBlob = new Blob([new Uint8Array(array)], {
                                type: 'image/png'
                            });


                            var data = new FormData();
                            data.append('userID', pageUserId);
                            data.append('token', userService.getCurrentUser().token);
                            data.append("source", fileBlob, file.name);

                            defer.resolve($http.post(appConfig.apiBaseUrl + '/api/profilepicture', data, {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity
                            }));

                        };
                        reader.readAsDataURL(file);
                        return defer.promise;

                    },

                    'getGroupImgFromServer': function() {
                        var defer = $q.defer();
                        $http({
                                url: appConfig.apiBaseUrl + '/api/profilepicture/mmm',
                                method: "GET",
                                params: {
                                    token: userService.getCurrentUser().token
                                }
                            })
                            .then(function(data) {
                                var reader = new FileReader();
                                reader.onload = function() {
                                    defer.resolve(reader.result)
                                };
                                reader.readAsDataURL(data.data.profilePicture);

                            })
                            .catch(function(err) {
                                defer.reject(err)
                            });

                        return defer.promise;

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
