/**
 * Created by sj on 6/25/2015.
 */


(function() {
    'use strict';
    angular
        .module('app.subgroup', ['core', 'ngMdIcons'])
        .factory('SubGroupService', ['$rootScope', 'groupFirebaseService', 'firebaseService', '$location', '$sessionStorage', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', '$localStorage',
            function($rootScope, groupFirebaseService, firebaseService, $location, $sessionStorage, soundService, userService, messageService, $q, $http, appConfig, $localStorage) {

                return {

                    'createSubGroup': function(userID, group, SubgroupInfo, subgroupList, formDataFlag, groupID) {
                        //var pageUserId = userService.getCurrentUser().userID;
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.toLowerCase();
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.replace(/[^a-z0-9]/g, '');
                        groupFirebaseService.asyncCreateSubgroup(userID, group, SubgroupInfo, subgroupList, formDataFlag)
                            .then(function(response) {
                                form = false;
                                console.log("Group Creation Successful");
                                var unlistedMembersArray = response.unlistedMembersArray;
                                if (unlistedMembersArray.length > 0) {

                                    messageService.showSuccess("SubGroup creation Successful, but following are not valid IDs: " + unlistedMembersArray);
                                } else {
                                    $location.path('/user/group/' + groupID);

                                    messageService.showSuccess("SubGroup creation Successful");
                                }
                            }, function(group) {
                                form = false;
                                messageService.showFailure("SubGroup not created, " + SubgroupInfo.groupID + " already exists");
                            })
                    },
                    'cancelSubGroupCreation': function(userId) {
                        console.log("SubGroup Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID)
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
                            //data.append('token', $sessionStorage.loggedInUser.token);
                            data.append('token', $localStorage.loggedInUser.token);
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
