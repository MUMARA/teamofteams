/**
 * Created by sj on 6/10/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.createSubGroup', ['core', 'ngMdIcons'])
        .factory('createSubGroupService', ['$firebaseArray', '$rootScope', 'groupFirebaseService', '$firebaseObject', 'firebaseService', '$location', '$sessionStorage', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', '$localStorage',
            function($firebaseArray, $rootScope, groupFirebaseService, $firebaseObject, firebaseService, $location, $sessionStorage, soundService, userService, messageService, $q, $http, appConfig, $localStorage) {
                var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                var groupAdminUsers = [];

                return {

                    'createSubGroup': function(userID, group, SubgroupInfo, subgroupList, formDataFlag, groupID) {
                        //var pageUserId = userService.getCurrentUser().userID;
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.toLowerCase();
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.replace(/[^a-z0-9]/g, '');
                        groupFirebaseService.asyncCreateSubgroup(userID, group, SubgroupInfo, subgroupList, formDataFlag)
                            .then(function(response) {
                                //form.$submitted = !form.$submitted
                                console.log("Group Creation Successful");
                                var unlistedMembersArray = response.unlistedMembersArray;
                                if (unlistedMembersArray.length > 0) {

                                    messageService.showSuccess("SubGroup creation Successful, but following are not valid IDs: " + unlistedMembersArray);
                                } else {
                                    $location.path('/user/group/' + groupID);
                                    messageService.showSuccess("SubGroup creation Successful...");
                                    $rootScope.newImg = null;
                                }
                            }, function(group) {
                                // form.$submitted = !form.$submitted
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

                    },
                    'editSubgroup': function(subgroupInfo, subgroupRef, groupID, groupForm) {
                        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                        //  var dataToSet = ;
                        var dataToSet = {
                            title: subgroupInfo.title,
                            desc: subgroupInfo.desc,
                            timestamp: firebaseTimeStamp


                        };

                        // var $subgroupRef = firebaseService.getRefSubGroups().child(groupID).child(subgroupInfo.$id);
                        angular.extend(subgroupRef, dataToSet);

                        subgroupRef.$save().then(function(response) {
                            var subgroupNameRef = $firebaseObject(firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupInfo.$id));
                            subgroupNameRef.title = subgroupRef.title;
                            subgroupNameRef.$save()
                                .then(function() {
                                    groupForm = false;
                                    //groupForm.$submitted = false;
                                    //$rootScope.newImg = null;
                                    messageService.showSuccess('SubGroup Edited Successfully')
                                }, function(group) {
                                    groupForm = false;
                                    messageService.showFailure("SubGroup not edited");
                                })

                        }, function(group) {
                            groupForm = false;
                            // groupForm.$submitted = false;
                            messageService.showFailure("SubGroup not edited");
                        })


                        /*                        $subgroupRef.update({
                         title: subgroupInfo.title,
                         desc: subgroupInfo.desc,
                         timestamp: firebaseTimeStamp,
                         'logo-image':{
                         url:subgroupInfo.imgLogoUrl, // pID is going to be changed with userID for single profile picture only
                         id: subgroupInfo.$id,
                         'bucket-name': 'test2pwow',
                         source: 1,// 1 = google cloud storage
                         mediaType: 'image/png' //image/jpeg
                         }

                         },function(error) {
                         if (error) {
                         console.log('Synchronization failed');
                         } else {
                         messageService.showSuccess("SubGroup creation Successful");
                         }
                         })*/
                    },

                    changeMemberRole: function(newType, member, groupID, subID) {
                        var defer, self, prevType,
                            errorHandler;

                        defer = $q.defer();
                        self = this;
                        prevType = member.membershipType;

                        errorHandler = function(err) {
                            defer.reject('Error occurred in accessing server.');
                        };


                        //update membership type in user memberships
                        this.asyncAddUserMembership(member.userSyncObj.$id, groupID, newType, subID)
                            .then(function() {
                                var userMem = {};
                                userMem[member.userSyncObj.$id] = {
                                    'membership-type': newType,
                                    timestamp: firebaseTimeStamp
                                };

                                //update membership type in Subgroup memberships
                                firebaseService.getRefSubGroupMembers().child(groupID).child(subID)
                                    .update(userMem, function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            defer.resolve();
                                        }
                                    });

                            }, errorHandler);



                        return defer.promise;
                    },
                    asyncAddUserMembership: function(userID, groupID, typeNum, subID) {
                        var deferred = $q.defer();
                        var timestampRef = firebaseService.getRefSubGroupMembers().child(groupID + '/' + subID + '/' + userID + '/timestamp');

                        timestampRef.once("value", function(snapshot) {
                            var timestamp = snapshot.val() || firebaseTimeStamp;
                            var userMem = {};

                            userMem[subID] = {
                                "membership-type": typeNum,
                                timestamp: timestamp
                            };

                            var userMemRef = firebaseService.getRefUserSubGroupMemberships().child(userID).child(groupID);
                            userMemRef.update(userMem, function(error) {
                                if (error) {
                                    deferred.reject();
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });

                        return deferred.promise;
                    },

                    getAdminUsers: function(groupid, subgroupid, cb){
                        firebaseService.getRefSubGroupMembers().child(groupid + '/' + subgroupid).on('child_added', function(snapshot){
                            firebaseService.getRefUsers().child(snapshot.key()).once('value', function(userData){

                                if(snapshot.val()['membership-type'] == 1 || snapshot.val()['membership-type'] == 2){
                                    // console.log(userData.val());
                                    // console.log(snapshot.val());
                                    groupAdminUsers.push(userData.val());
                                    cb(groupAdminUsers);    
                                }

                            })
                        })
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
