/**
 * Created by sj on 6/10/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.createSubGroup', ['core', 'ngMdIcons'])
        .factory('createSubGroupService', ['activityStreamService','$firebaseArray', '$rootScope', 'groupFirebaseService', '$firebaseObject', 'firebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig',
            function(activityStreamService, $firebaseArray, $rootScope, groupFirebaseService, $firebaseObject, firebaseService, $location, soundService, userService, messageService, $q, $http, appConfig) {
                var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                var groupAdminUsers = [];

                return {

                    'createSubGroup': function(userID, group, SubgroupInfo, subgroupList, formDataFlag, groupID,cb) {
                        //var pageUserId = userService.getCurrentUser().userID;
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.toLowerCase();
                        SubgroupInfo.subgroupID = SubgroupInfo.subgroupID.replace(/[^a-z0-9]/g, '');
                        groupFirebaseService.asyncCreateSubgroup(userID, group, SubgroupInfo, subgroupList, formDataFlag)
                            .then(function(response) {
                                // //form.$submitted = !form.$submitted
                                // // console.log("Group Creation Successful");
                                // var unlistedMembersArray = response.unlistedMembersArray;
                                // if (unlistedMembersArray.length > 0) {
                                //
                                //     messageService.showSuccess("Team creation Successful, but following are not valid IDs: " + unlistedMembersArray);
                                // } else {
                                //     // $location.path('/' + groupID);

                                //for group activity stream record -- START --
                                var type = 'subgroup';
                                var targetinfo = { id: SubgroupInfo.subgroupID, url: group.$id + '/' + SubgroupInfo.subgroupID, title: SubgroupInfo.title, type: 'subgroup' };
                                var area = { type: 'subgroup-created' };
                                var group_id = group.$id + '/' + SubgroupInfo.subgroupID;
                                var memberuserID = null;
                                //for group activity record
                                activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                //for group activity stream record -- END --
                                cb();
                                messageService.showSuccess("Team creation Successful...");
                                $rootScope.newImg = null;
                                // }
                            }, function(group) {
                                // form.$submitted = !form.$submitted
                                messageService.showFailure("Team not created, " + SubgroupInfo.groupID + " already exists");
                            });
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

                    },
                    // 'editSubgroup': function(subgroupInfo, subgroupRef, groupID, groupForm) {
                    'editSubgroup': function(subgroupInfo, subgroupRef, groupID, cb) {
                        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
                        //  var dataToSet = ;
                        var dataToSet = {
                            title: subgroupInfo.title,
                            desc: (subgroupInfo.desc ? subgroupInfo.desc : ''),
                            timestamp: firebaseTimeStamp
                        };
                        if (subgroupRef) {
                            // var $subgroupRef = firebaseService.getRefSubGroups().child(groupID).child(subgroupInfo.$id);
                            angular.extend(subgroupRef, dataToSet);

                            subgroupRef.$save().then(function(response) {
                                //var subgroupNames_ = firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupInfo.$id);
                                ///subgroupNames_.set(subgroupInfo.title, function(error) { console.log(error); });

                                var subgroupNameRef = $firebaseObject(firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupInfo.$id));
                                subgroupNameRef.title = subgroupRef.title;
                                subgroupNameRef.$save()
                                    .then(function() {
                                        cb();
                                        //groupForm.$submitted = false;
                                        //$rootScope.newImg = null;

                                        //for group activity stream record -- START --
                                        var type = 'subgroup';
                                        var targetinfo = {id: subgroupInfo.$id, url: groupID+'/'+subgroupInfo.$id, title: subgroupInfo.title, type: 'subgroup' };
                                        var area = {type: 'subgroup-updated'};
                                        var group_id = groupID+'/'+subgroupInfo.$id;
                                        var memberuserID = null;
                                        //for group activity record
                                        activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                        //for group activity stream record -- END --

                                        messageService.showSuccess('Team Edited Successfully')
                                    }, function(group) {
                                        cb();
                                        messageService.showFailure("Team not edited");
                                    })
                                }, function(group) {
                                    cb();
                                    // groupForm.$submitted = false;
                                    messageService.showFailure("Team not edited");
                                })
                        } else {
                            firebaseService.getRefSubGroups().child(groupID).child(subgroupInfo.$id).set({title: subgroupInfo.title, timestamp: firebaseTimeStamp}, function(error){
                                if(error){
                                    messageService.showFailure("Team not created");
                                } else {
                                    messageService.showSuccess('Team Created Successfully')
                                }
                            });
                        }





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
                        groupAdminUsers = [];
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
                        firebaseService.getRefSubGroupMembers().child(groupid + '/' + subgroupid).on('child_changed', function(snapshot){
                            firebaseService.getRefUsers().child(snapshot.key()).once('value', function(userData){
                                if(snapshot.val()['membership-type'] == 1 || snapshot.val()['membership-type'] == 2){
                                    // console.log(userData.val());
                                    // console.log(snapshot.val());

                                    var _flag = false;
                                    groupAdminUsers.forEach(function(val, indx) {
                                        if(val.email == userData.val().email) {
                                            _flag = true;
                                        }
                                    }) //groupAdminUsers.forEach

                                    if(_flag){
                                        cb(groupAdminUsers);
                                    } else{
                                        groupAdminUsers.push(userData.val());
                                        cb(groupAdminUsers);
                                    }
                                }

                            })
                        })
                    }, //groupAdminUsers

                    DeleteUserMemberShip: function(userID, groupID, subgroupID, submembers){
                        // var deleteUserMemberShip = {};
                        // deleteUserMemberShip["user-subgroup-memberships/"+userID+"/"+groupID+"/"+subgroupID+"/"] = null;
                        // deleteUserMemberShip["subgroup-members/"+groupID+"/"+subgroupID+"/"+userID+"/"] = null;
                        // deleteUserMemberShip["subgroups/"+groupID+"/"+subgroupID+"/"] = {
                        //     "members-count": submembers-1
                        // };

                        // for(var x in deleteUserMemberShip){
                        //     console.log(x);
                        // }
                        // // Do a deep-path update
                        // firebaseService.getRefMain().update(deleteUserMemberShip, function(error) {
                        //     if (error) {
                        //         console.log("Error updating data:", error);
                        //     }
                        // });

                        firebaseService.getRefMain().child("user-subgroup-memberships/"+userID+"/"+groupID+"/"+subgroupID+"/").remove(function(err){
                            // console.log(err);

                            firebaseService.getRefMain().child("subgroup-members/"+groupID+"/"+subgroupID+"/"+userID+"/").remove(function(err){
                                // console.log(err);

                                firebaseService.getRefMain().child("subgroups/"+groupID+"/"+subgroupID+"/members-count").set(submembers-1, function(err){
                                    // console.log(err);
                                });



                            });
                        });



                    } //DeleteUserMemberShip
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
