/**
 * Created by ZiaKhan on 11/02/15.
 */

'use strict';

angular.module('core')
    .factory('userFirebaseService', ["firebaseService", "$q", "$timeout", '$http', "$sessionStorage", "$firebaseObject", 'appConfig', '$localStorage', 'userService',
        function(firebaseService, $q, $timeout, $http, $sessionStorage, $firebaseObject, appConfig, $localStorage, userService) {

            //Firebase timeStamp object.
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;

            return {
                getUserMembershipsSyncObj: function(userID) {
                    var response = {
                        groupArray: [],
                        userActivityStream: []
                    };
                    var self = this;
                    response.userGroupMembershipRef = firebaseService.getRefUserGroupMemberships().child(userID);
                    response.userGroupMembershipRef.on('child_added', function(snapshot) {
                        $timeout(function() {
                            var groupSyncObj = $firebaseObject(firebaseService.getRefGroups().child(snapshot.key()));
                            var groupActivitiesRef = firebaseService.getRefGroupsActivityStreams().child(snapshot.key());
                            self.getGroupActivityStream(groupActivitiesRef, response.userActivityStream);
                            response.groupArray.push({
                                groupID: snapshot.key(),
                                membershipType: snapshot.val()["membership-type"],
                                timestamp: snapshot.val()["timestamp"],
                                groupData: groupSyncObj
                            });
                        }, 1000);

                    });
                    response.userGroupMembershipRef.on('child_changed', function(snapshot) {
                        var groupID = snapshot.key();
                        var groupObj = snapshot.val();
                        response.groupArray.forEach(function(obj) {
                            if (obj.groupID == groupID) {
                                $timeout(function() {
                                    obj.membershipType = groupObj['membership-type'];
                                });
                            }
                        });
                    });
                    response.userGroupMembershipRef.on('child_removed', function(snapshot) {
                        var groupID = snapshot.key();
                        var memberType = snapshot.val();
                        response.groupArray.forEach(function(obj, i) {
                            if (obj.groupID == groupID) {
                                $timeout(function() {
                                    response.groupArray.splice(i, 1);
                                });
                            }
                        });

                    });
                    return response;
                },
                'uploadProfilePicture': function(api, data) {
                    //var deferred = $q.defer();
                    return $http.post(appConfig.apiBaseUrl + '/' + api, data, {
                        withCredentials: false,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity
                    });
                    //return deferred.promise;
                },
                asyncCreateGroup: function(userID, groupObj, loggedInUserGroupsList, formDataFlag) {
                    var self = this;
                    var deferred = $q.defer();

                    //Step 1: see if it already exists
                    firebaseService.asyncCheckIfGroupExists(groupObj.groupID).then(function(response) {
                        if (response.exists) {
                            deferred.reject(groupObj);
                        } else {
                            //first adding own membership to get write access as per rules
                            firebaseService.getRefUserGroupMemberships().child(userID).child(groupObj.groupID).update({
                                "membership-type": 1,
                                timestamp: firebaseTimeStamp
                            }, function(error1) {
                                if (error1) {
                                    deferred.reject();
                                } else {
                                    firebaseService.getRefGroupMembers().child(groupObj.groupID).child(userID).set({
                                        "membership-type": 1,
                                        timestamp: firebaseTimeStamp
                                    }, function(error2) {
                                        if (error2) {
                                            deferred.reject();
                                        } else {
                                            //Step 4: Add to group
                                            var dataToSet = {
                                                'group-owner-id': userService.getCurrentUser().userID,
                                                title: groupObj.title,
                                                desc: groupObj.desc || '',
                                                address: groupObj.address || '',
                                                phone: groupObj.phone || '',
                                                timeZone: groupObj.timeZone,
                                                timestamp: firebaseTimeStamp,
                                                "members-count": 1,
                                                "subgroups-count": 0,
                                                "members-checked-in": {
                                                    count: 0
                                                },

                                                privacy: {
                                                    invitationType: +groupObj.signupMode
                                                },
                                                'logo-image': {
                                                    url: groupObj.imgLogoUrl || 'https://s3-us-west-2.amazonaws.com/defaultimgs/teamofteams.png', // pID is going to be changed with userID for single profile picture only
                                                    id: groupObj.groupID,
                                                    'bucket-name': 'test2pwow',
                                                    source: 1, // 1 = google cloud storage
                                                    mediaType: 'image/png' //image/jpeg
                                                }
                                            };

                                            /* if(groupObj.signupMode === '3')dataToSet.privacy.allowedDomain = groupObj.allowedDomain;*/
                                            var groupRef = firebaseService.getRefGroups().child(groupObj.groupID).set(dataToSet, function(error) {
                                                if (error) {
                                                    deferred.reject();
                                                } else {

                                                    /* if(formDataFlag){
                                                         var api = appConfig.serverPostApi.groupProfilePictureUpload;
                                                         self.uploadProfilePicture(api,groupObj.formData).then(function(data){
                                                             console.log('pictureuploaded')
                                                             console.log(data)
                                                         },function(err){
                                                             console.log('picture upload error')
                                                             console.log(err)

                                                         }) // save groupProfilePicture usign our server
                                                     }*/
                                                    var groupNameRef = firebaseService.getRefGroupsNames().child(groupObj.groupID);
                                                    var data = {
                                                        title: groupObj.title,
                                                        groupImgUrl: groupObj.imgLogoUrl || 'https://s3-us-west-2.amazonaws.com/defaultimgs/teamofteams.png',
                                                        ownerImgUrl: groupObj.ownerImgUrl
                                                            //groupOwnerImgUrl:
                                                    }

                                                    groupNameRef.set(data, function(error) {
                                                        if (error) {
                                                            deferred.reject();
                                                            //role back previous
                                                        } else {
                                                            var memRef = firebaseService.getRefGroupMembers().child(groupObj.groupID);

                                                            //to create a JSON for given comma separated members string.
                                                            self.asyncCreateGroupMembersJSON(userID, groupObj.members).then(function(response) {
                                                                var mems = response.memberJSON;

                                                                //mems[userID] = {"membership-type": 1, timestamp: firebaseTimeStamp};
                                                                memRef.update(mems, function(error) {
                                                                    if (error) {
                                                                        //roleback previous
                                                                        deferred.reject();
                                                                    } else {
                                                                        var promises = [];
                                                                        //promises.push(self.asyncAddUserMembership(userID, groupObj.groupID, 1));
                                                                        var memArray = response.members;
                                                                        memArray.forEach(function(val, i) {
                                                                            promises.push(self.asyncAddUserMembership(val, groupObj.groupID, 3));
                                                                        });
                                                                        $q.all(promises).then(function() {
                                                                            //self.asyncRecordGroupCreationActivity(groupObj, $sessionStorage.loggedInUser).then(function () {
                                                                            self.asyncRecordGroupCreationActivity(groupObj, $localStorage.loggedInUser).then(function() {
                                                                                var memberCountRef = firebaseService.getRefGroups().child(groupObj.groupID).child("members-count");
                                                                                if (memArray.length > 0) {
                                                                                    memberCountRef.transaction(function(current_value) {
                                                                                        return (current_value || 0) + memArray.length;
                                                                                    });
                                                                                }

                                                                                if (memArray.length == 1) {
                                                                                    //self.asyncRecordGroupMemberAdditionActivity(groupObj, $sessionStorage.loggedInUser, response.members[0])
                                                                                    self.asyncRecordGroupMemberAdditionActivity(groupObj, $localStorage.loggedInUser, response.members[0])
                                                                                        .then(function() {
                                                                                            deferred.resolve({
                                                                                                unlistedMembersArray: response.unlisted
                                                                                            });
                                                                                        })
                                                                                } else if (memArray.length > 1) {
                                                                                    //self.asyncRecordManyGroupMembersAdditionActivity(groupObj, $sessionStorage.loggedInUser, response.members)
                                                                                    self.asyncRecordManyGroupMembersAdditionActivity(groupObj, $localStorage.loggedInUser, response.members)
                                                                                        .then(function() {
                                                                                            deferred.resolve({
                                                                                                unlistedMembersArray: response.unlisted
                                                                                            });
                                                                                        });
                                                                                } else {
                                                                                    deferred.resolve({
                                                                                        unlistedMembersArray: response.unlisted
                                                                                    });
                                                                                }
                                                                            });

                                                                        }, function() {
                                                                            deferred.reject();
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    });
                                }
                            });


                        }
                    });

                    return deferred.promise;
                },
                asyncAddUserMembership: function(userID, groupID, typeNum) {
                    var deferred = $q.defer();
                    var timestampRef = firebaseService.getRefGroupMembers().child(groupID + '/' + userID + '/timestamp');

                    timestampRef.once("value", function(snapshot) {
                        var timestamp = snapshot.val() || firebaseTimeStamp;
                        var userMem = {};

                        userMem[groupID] = {
                            "membership-type": typeNum,
                            timestamp: timestamp
                        };

                        var userMemRef = firebaseService.getRefUserGroupMemberships().child(userID);
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
                asyncCreateGroupMembersJSON: function(ownerUserID, listStr, existingMembersObj) {
                    var deferred = $q.defer();

                    var groupMembersJSON = {};
                    var unlistedMembers = [];
                    var members = [];

                    if (listStr.length < 2) {
                        deferred.resolve({
                            memberJSON: groupMembersJSON,
                            unlisted: unlistedMembers,
                            members: members
                        });
                    } else {
                        existingMembersObj = existingMembersObj || {};

                        var memberArray = listStr.split(",");
                        var promises = [];

                        memberArray.forEach(function(val, i) {
                            val = val.trim();
                            var promise = firebaseService.asyncCheckIfUserExists(val);
                            promise.then(function(response) {
                                if (response.exists) {
                                    /*check if requested userID is :
                                     * a valid user,
                                     * has not already been added to members list of group (if updating members list) */
                                    if (val != ownerUserID && !existingMembersObj[val]) {
                                        groupMembersJSON[val] = {
                                            "membership-type": 3, //1 means owner, 2 will mean admin, 3 means member only
                                            timestamp: firebaseTimeStamp
                                        };
                                        members.push(val);
                                        //}
                                    } else {
                                        unlistedMembers.push(val);
                                    }
                                } else {
                                    unlistedMembers.push(val);
                                }
                            });

                            promises.push(promise);
                        });

                        $q.all(promises).then(function() {
                            deferred.resolve({
                                memberJSON: groupMembersJSON,
                                unlisted: unlistedMembers,
                                members: members
                            });
                        }, function() {
                            deferred.reject();
                        })
                    }

                    return deferred.promise;
                },
                asyncRecordMemberLeft: function(userObj, groupObj) {
                    var deferred = $q.defer();

                    var ref = firebaseService.getRefGroupsActivityStreams().child(groupObj.$id);
                    var actor = {
                        "type": "user",
                        "id": userObj.$id, //this is the userID, and an index should be set on this
                        "email": userObj.email,
                        "displayName": userObj.firstName + " " + userObj.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": groupObj.$id, //an index should be set on this
                        "url": groupObj.$id,
                        "displayName": groupObj.title
                    };

                    var activity = {
                        language: "en",
                        verb: "group-member-left",
                        published: firebaseTimeStamp,
                        displayName: actor.displayName + " left " + target.displayName,
                        actor: actor,
                        target: target
                    };

                    var newActivityRef = ref.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {
                            deferred.reject();
                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = ref.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {
                                        deferred.reject();
                                    } else {
                                        deferred.resolve('You have left ' + target.displayName + ' successfully.');
                                    }
                                });
                            });
                        }
                    });

                    return deferred.promise;
                },
                asyncRecordGroupCreationActivity: function(group, user) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var object = {
                        "type": "group",
                        "id": group.groupID, //an index should be set on this
                        "url": group.groupID,
                        "displayName": group.title
                    };

                    var activity = {
                        language: "en",
                        verb: "group-creation",
                        //published: firebaseTimeStamp,
                        //published: Firebase.ServerValue.TIMESTAMP,
                        published: {
                            ".sv": "timestamp"
                        },
                        displayName: actor.displayName + " created " + group.title,
                        actor: actor,
                        object: object
                    };

                    var newActivityRef = ref.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {
                            deferred.reject();
                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = ref.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {
                                        deferred.reject();
                                    } else {
                                        deferred.resolve();
                                    }
                                });
                            });


                        }
                    });

                    return deferred.promise;
                },
                asyncRecordGroupMemberAdditionActivity: function(group, user, memberUserID) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": group.groupID,
                        "url": group.groupID,
                        "displayName": group.title
                    };

                    firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
                        var object = {
                            "type": "user",
                            "id": memberUserID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName
                        };

                        var activity = {
                            language: "en",
                            verb: "group-added-member",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added " + object.displayName + " as a member in " + group.title,
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            deferred.reject();
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                            }
                        });

                    });

                    return deferred.promise;
                },
                asyncRecordManyGroupMembersAdditionActivity: function(group, user, membersArray) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    var self = this;
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var object = {
                        "type": "UserCollection",
                        "totalItems": membersArray.length,
                        "items": {}
                    };

                    var target = {
                        "type": "group",
                        "id": group.groupID,
                        "url": group.groupID,
                        "displayName": group.title
                    };

                    var promiseArray = [];
                    membersArray.forEach(function(member) {
                        promiseArray.push(firebaseService.asyncCheckIfUserExists(member));
                    });

                    $q.all(promiseArray).then(function(values) {
                        values.forEach(function(v) {
                            object.items[v.userID] = {
                                "verb": "group-added-member",
                                "object": {
                                    "type": "user",
                                    "id": v.userID,
                                    "email": v.user.email,
                                    "displayName": v.user.firstName + " " + v.user.lastName
                                }
                            };
                        });


                        var activity = {
                            language: "en",
                            verb: "group-added-many-members",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added members to " + group.title + " group",
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            deferred.reject();
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                            }
                        });
                    });

                    return deferred.promise;
                },
                asyncRecordGroupMemberApproveRejectActivity: function(type, group, user, memberUserID) {
                    var deferred = $q.defer();
                    var refGroupActivities = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": group.groupID,
                        "url": group.groupID,
                        "displayName": group.title
                    };

                    firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
                        var object = {
                            "type": "user",
                            "id": memberUserID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName
                        };

                        //create an appropriate display message.
                        var displayName;
                        if (type === "approve") {
                            displayName = actor.displayName + " approved " + object.displayName +
                                " as a member in " + group.title + "."
                        } else {
                            displayName = actor.displayName + " rejected " + object.displayName +
                                "'s membership request for " + group.title + "group."
                        }

                        var activity = {
                            language: "en",
                            verb: type === "approve" ? "group-approve-member" : "group-reject-member",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " approved " + object.displayName + " as a member in " + group.title,
                            // if actor is to subject and target is to object then object is to verb
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = refGroupActivities.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                //handle this case
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = refGroupActivities.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            //handle this case
                                            deferred.reject();
                                        } else {
                                            deferred.resolve(displayName);
                                        }
                                    });
                                });
                            }
                        });

                    });

                    return deferred.promise;
                },
                asyncRecordSubGroupMemberApproveRejectActivity: function(type, subgroup, user, memberUserID) {
                    //memberUserID is the request sender.
                    //user is one whom request is made.
                    var deferred = $q.defer();
                    var refSubgroupActivities = firebaseService.getRefSubGroupsActivityStreams().child(subgroup.groupID).child(subgroup.subgroupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "subgroup",
                        "id": subgroup.subgroupID,
                        "url": subgroup.subgroupID,
                        "displayName": subgroup.title
                    };

                    firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
                        var object = {
                            "type": "user",
                            "id": memberUserID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName
                        };

                        //create an appropriate display message.
                        var displayName;
                        if (type === "approve") {
                            displayName = actor.displayName + " approved " + object.displayName +
                                " as a member in " + subgroup.title + "subgroup."
                        } else {
                            displayName = actor.displayName + " rejected " + object.displayName +
                                "'s membership request for " + subgroup.title + "subgroup."
                        }

                        var activity = {
                            language: "en",
                            verb: type === "approve" ? "subgroup-approve-member" : "subgroup-reject-member",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + (type === "approve" ? " approved " : " rejected ") + object.displayName + " as a member in " + subgroup.title,
                            // if actor is to subject and target is to object then object is to verb
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = refSubgroupActivities.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {
                                //handle this case
                                deferred.reject();
                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = refSubgroupActivities.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {
                                            //handle this case
                                            deferred.reject();
                                        } else {
                                            deferred.resolve(displayName);
                                        }
                                    });
                                });
                            }
                        });

                    });

                    return deferred.promise;
                },
                asyncRecordMembershipChangeActivity: function(prevType, newType, user, groupObj, loggedInUser) {
                    var deferred = $q.defer();
                    var refGroupActivities = firebaseService.getRefGroupsActivityStreams().child(groupObj.$id);

                    var actor = {
                        "type": "user",
                        "id": loggedInUser.$id, //this is the userID, and an index should be set on this
                        "email": loggedInUser.email,
                        "displayName": loggedInUser.firstName + " " + loggedInUser.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": groupObj.$id,
                        "url": groupObj.$id,
                        "displayName": groupObj.title
                    };

                    var object = {
                        "type": "user-membership-change",
                        "id": user.$id,
                        "url": user.$id,
                        "from": this.getRoleTitleByType(prevType),
                        "to": this.getRoleTitleByType(newType),
                        "displayName": user.firstName + ' ' + user.lastName
                    };

                    var displayName = loggedInUser.firstName + ' ' + loggedInUser.lastName + ' changed ' +
                        user.firstName + ' ' + user.lastName + '\'s membership from "' + object.from +
                        '" to "' + object.to + '" for ' + groupObj.title + ' group.';

                    var activity = {
                        language: "en",
                        verb: "user-membership-change",
                        published: firebaseTimeStamp,
                        displayName: displayName,
                        actor: actor,
                        object: object,
                        target: target
                    };

                    var newActivityRef = refGroupActivities.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {
                            //handle this case
                            deferred.reject();
                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = refGroupActivities.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {
                                        //handle this case
                                        deferred.reject();
                                    } else {
                                        deferred.resolve(displayName);
                                    }
                                });
                            });
                        }
                    });

                    return deferred.promise;
                },
                asyncRecordMemberRemoved: function(prevType, newType, user, groupObj, loggedInUser) {
                    var deferred = $q.defer();
                    var refGroupActivities = firebaseService.getRefGroupsActivityStreams().child(groupObj.$id);

                    var actor = {
                        "type": "user",
                        "id": loggedInUser.$id, //this is the userID, and an index should be set on this
                        "email": loggedInUser.email,
                        "displayName": loggedInUser.firstName + " " + loggedInUser.lastName
                    };

                    var target = {
                        "type": "group",
                        "id": groupObj.$id,
                        "url": groupObj.$id,
                        "displayName": groupObj.title
                    };

                    var object = {
                        "type": "user",
                        "id": user.$id,
                        "url": user.$id,
                        "displayName": user.firstName + ' ' + user.lastName
                    };

                    var displayName = loggedInUser.firstName + ' ' + loggedInUser.lastName + ' removed ' +
                        user.firstName + ' ' + user.lastName + ' from "' + groupObj.title + '" group.';

                    var activity = {
                        language: "en",
                        verb: "group-member-removed",
                        published: firebaseTimeStamp,
                        displayName: displayName,
                        "from": this.getRoleTitleByType(prevType),
                        "to": null,
                        actor: actor,
                        object: object,
                        target: target
                    };

                    var newActivityRef = refGroupActivities.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {
                            //handle this case
                            deferred.reject();
                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = refGroupActivities.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {
                                        //handle this case
                                        deferred.reject();
                                    } else {
                                        deferred.resolve(displayName);
                                    }
                                });
                            });
                        }
                    });

                    return deferred.promise;
                },
                getGroupActivityStream: function(activityGroupRef, activityArray) {
                    var self = this;
                    activityGroupRef.orderByPriority().on("child_added", function(snapshot) {
                        //console.log(snapshot.key());
                        var activity = snapshot.val();
                        //activity.publishedDate = new Date(activity.published/1000);
                        if (activity) {
                            if (activityArray.length == 0) {
                                $timeout(function() {
                                    activityArray.push(activity);
                                });
                            } else {
                                var position = self.insertionPosition(activityArray, activity.published);
                                $timeout(function() {
                                    activityArray.splice(position, 0, activity);
                                });
                            }
                        }

                    });
                },
                insertionPosition: function(activityArray, currentTimestamp) {
                    for (var i = 0; i < activityArray.length; i++) {
                        if (currentTimestamp >= activityArray[i].published) {
                            return i;
                        }
                    }
                    return activityArray.length;
                },
                getRoleTitleByType: function(type) {
                    var verb = 'unknown';

                    switch (type) {
                        case -1:
                            verb = 'suspend';
                            break;
                        case 2:
                            verb = 'admin';
                            break;
                        case 3:
                            verb = 'member';
                            break;
                    }

                    return verb;
                },
                asyncGroupJoiningRequest: function(userID, groupID, message) {
                    var deferred = $q.defer();
                    var self = this;
                    firebaseService.asyncCheckIfGroupExists(groupID).then(function(response) {
                        if (response.exists) {
                            //Step 2: Add to pending requests
                            var userMembershipRef = firebaseService.getRefUserGroupMemberships().child(userID).child(groupID);
                            userMembershipRef.once("value", function(snapshotMem) { //Step 3: check to see if already a member
                                var membershipData = snapshotMem.val();
                                if (membershipData) {
                                    if (membershipData["membership-type"] == 1) {
                                        deferred.reject("User is already an owner of this group");
                                    } else if (membershipData["membership-type"] == 2) {
                                        deferred.reject("User is already a admin of this group");
                                    } else if (membershipData["membership-type"] == 0) {
                                        deferred.reject("Membership request is already pending for this group");
                                    } else {
                                        deferred.reject("User is already a member of this group");
                                    }

                                } else {
                                    var ref = firebaseService.getRefGroupMembershipRequests().child(groupID);
                                    ref.child(userID).once("value", function(snap) {
                                        var alreadyPending = snap.val();
                                        if (alreadyPending) {
                                            deferred.reject("Request is already pending for this group"); //just to double check here also, but no need if data is consistent
                                        } else {
                                            var request = {};
                                            request[userID] = {
                                                timestamp: firebaseTimeStamp,
                                                message: message
                                            };
                                            ref.update(request, function(error) {
                                                if (error) {
                                                    deferred.reject("Server Error, please try again");
                                                } else {
                                                    ref.child(userID).once("value", function(snapshot) {
                                                        var timestamp = snapshot.val()["timestamp"]; //to get the server time
                                                        var refByUser = firebaseService.getRefGroupMembershipRequestsByUser().child(userID); //Step 4 add to pending by user
                                                        var requestByUser = {};
                                                        requestByUser[groupID] = {
                                                            timestamp: timestamp
                                                        };
                                                        refByUser.update(requestByUser, function(error) {
                                                            if (error) {
                                                                //roll back previous may be
                                                                deferred.reject("Server Error, please try again");
                                                            } else {
                                                                deferred.resolve();
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            deferred.reject(groupID + " does not exist!");
                        }
                    });

                    return deferred.promise;
                },
                asyncSubgroupJoiningRequest: function(userID, groupID, subgroupID, message) {
                        var deferred = $q.defer();
                        var self = this;

                        //Step 1: check to see if already a member
                        var userMembershipRef = firebaseService.getRefUserSubGroupMemberships().child(userID + '/' + groupID + '/' + subgroupID);
                        userMembershipRef.once("value", function(snapshotMem) { //
                            var membershipData = snapshotMem.val();
                            if (membershipData) {
                                if (membershipData["membership-type"] == 1) {
                                    deferred.reject("User is already an owner of this group");
                                } else if (membershipData["membership-type"] == 2) {
                                    deferred.reject("User is already a admin of this group");
                                }
                                //else if (membershipData["membership-type"] == 0) {
                                //    deferred.reject("Membership request is already pending for this group");
                                //}
                                else {
                                    deferred.reject("User is already a member of this group");
                                }

                            } else {
                                //Step : check to see if already a request sent
                                var ref = firebaseService.getRefSubgroupMembershipRequests().child(groupID + '/' + subgroupID + '/' + userID);
                                ref.once("value", function(snap) {
                                    var alreadyPending = snap.val();
                                    if (alreadyPending) {
                                        deferred.reject("Request is already pending for this subgroup"); //just to double check here also, but no need if data is consistent
                                    } else {
                                        //step : setting request for membership "subgroup-membership-requests"
                                        ref.set({
                                            timestamp: firebaseTimeStamp,
                                            message: message
                                        }, function(error) {
                                            if (error) {
                                                deferred.reject("Server Error, please try again");
                                            } else {
                                                ref.once("value", function(snapshot) {
                                                    var timestamp = snapshot.val()["timestamp"]; //to get the server time
                                                    var refByUser = firebaseService.getRefSubgroupMembershipRequestsByUser().child(userID + '/' + groupID + '/' + subgroupID);
                                                    // /Step 4 add to pending by user
                                                    refByUser.set({
                                                        timestamp: timestamp
                                                    }, function(error) {
                                                        if (error) {
                                                            //roll back previous may be
                                                            deferred.reject("Server Error, please try again");
                                                        } else {
                                                            deferred.resolve();
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        //}
                        //});

                        return deferred.promise;
                    }
                    //,   userExists: function(userID){
                    //     firebaseService.getRefUsers().child(userID).once(function(snapshot){
                    //         console.log(snapshot)
                    //         if(snapshot){
                    //             return true;
                    //         } else {
                    //             return false;
                    //         }
                    //     })
                    // }
            }
        }
    ]);
