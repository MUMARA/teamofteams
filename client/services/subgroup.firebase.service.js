/**
 * Created by ZiaKhan on 15/02/15.
 */


'use strict';


angular.module('core')
    .factory('subgroupFirebaseService', ['checkinService', "$firebaseArray", "firebaseService", "$q", "$timeout", "$sessionStorage", "$firebaseObject", 'userFirebaseService', 'groupFirebaseService', '$localStorage',
        //function(firebaseService, $q, $timeout, $sessionStorage, $route, $firebaseObject,userFirebaseService,groupFirebaseService) {
        function(checkinService, $firebaseArray, firebaseService, $q, $timeout, $sessionStorage, $firebaseObject, userFirebaseService, groupFirebaseService, $localStorage) {
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
            return {
                getSubgroupSyncObjAsync: function(groupID, subgroupID, viewerUserID) {
                    var deferred = $q.defer();
                    var self = this;
                    var syncObj = {
                        subgroupsSyncArray: [],
                        membersSyncArray: [],
                        pendingMembershipSyncArray: [],
                        activitiesSyncArray: [],
                        groupMembersSyncArray: []
                    };

                    syncObj.self = this;
                    syncObj.viewerUserID = viewerUserID;
                    syncObj.groupID = groupID;
                    syncObj.subgroupID = subgroupID;
                    syncObj.userSubgroupMembershipRef = firebaseService.getRefUserSubGroupMemberships().child(viewerUserID).child(groupID).child(subgroupID);
                    syncObj.userGroupMembershipRef = firebaseService.getRefUserGroupMemberships().child(viewerUserID).child(groupID);
                    syncObj.subgroupSyncObj = $firebaseObject(firebaseService.getRefSubGroups().child(groupID).child(subgroupID));
                    syncObj.groupObj =
                        syncObj.userGroupMembershipRef.once("value", function(groupMembershipSnapshot) {


                            syncObj.userSubgroupMembershipRef.once("value", function(subgroupMembershipSnapshot) {

                                syncObj.groupMembership = groupMembershipSnapshot.val();
                                syncObj.subgroupMembership = subgroupMembershipSnapshot.val();

                                if (syncObj.subgroupMembership) { //if has team membership
                                    var teamMembershipType = subgroupMembershipSnapshot.val()["membership-type"];
                                    syncObj.membershipType = teamMembershipType;
                                    syncObj.timestamp = syncObj.subgroupMembership["timestamp"];
                                    if (teamMembershipType > 0 && teamMembershipType <= 3) {
                                        self.addListeners(syncObj);
                                    }


                                    syncObj.userSubgroupMembershipRef.on("child_changed", self.subgroupMembershipChanged, syncObj);
                                    syncObj.userSubgroupMembershipRef.on("child_removed", self.subgroupMembershipDeleted, syncObj);
                                } else { //doesnot have team membership but because he is an owner or admin of space he gets a membership
                                    if (syncObj.groupMembership) { //not a team member but does he have a space membership
                                        var groupMembershipType = groupMembershipSnapshot.val()["membership-type"];

                                        if (groupMembershipType == 1 || groupMembershipType == 2) { //space owner and admins have access to all teams
                                            syncObj.membershipType = groupMembershipType;
                                            if (groupMembershipType == 1) {
                                                syncObj.timestamp = syncObj.subgroupSyncObj.timestamp; //space owner is a member from the time team was created
                                            } else {
                                                syncObj.timestamp = subgroupMembershipSnapshot.val()["timestamp"]; //space admin is a member from when he became space admin
                                            }

                                            self.addListeners(syncObj);

                                            syncObj.userGroupMembershipRef.on("child_changed", self.groupMembershipChanged, syncObj);
                                            syncObj.userGroupMembershipRef.on("child_removed", self.groupMembershipDeleted, syncObj);

                                        } else {
                                            syncObj.membershipType = -100; //space member but not a team member yet
                                            syncObj.userSubgroupMembershipRef.on("child_added", self.subgroupMembershipAddedLater, syncObj);
                                        }

                                    } else {
                                        syncObj.membershipType = -1000; //right now not even a member of the parent space
                                        //listen to if membership added later
                                        //syncObj.userSpaceMembershipRef.on("child_added", self.spaceMembershipAddedLater, syncObj); //not needed if he does not have space membership he will not have access to this page
                                    }


                                }

                                deferred.resolve(syncObj);
                            });
                        }, syncObj);

                    return deferred.promise;
                },
                removeSubgroupMembershipHandlers: function() {
                    this.userSubgroupMembershipRef.off("child_changed", this.self.subgroupMembershipChanged, this);
                    this.userSubgroupMembershipRef.off("child_removed", this.self.subgroupMembershipDeleted, this);
                },
                removeGroupMembershipHandlers: function() {
                    this.userGroupMembershipRef.off("child_changed", this.self.groupMembershipChanged, this);
                    this.userGroupMembershipRef.off("child_removed", this.self.groupMembershipDeleted, this);
                    this.self.userSubgroupMembershipRef.off("child_added", this.self.subgroupMembershipAddedLater, this);
                },
                reloadController: function() {
                    /* $timeout(function () {
                         // 0 ms delay to reload the page.
                         $route.reload();
                     }, 0);*/
                },
                addListeners: function(syncObj) {
                    if (syncObj.membershipType >= 1) {
                        syncObj.groupMembershipRef = groupFirebaseService.syncGroupMembers(syncObj.groupID, syncObj.groupMembersSyncArray);
                        syncObj.subgroupMembershipRef = syncObj.self.syncSubgroupMembers(syncObj.groupID, syncObj.subgroupID, syncObj.membersSyncArray, syncObj);
                        syncObj.groupActivitiesRef = syncObj.self.syncSubgroupActivities(syncObj.groupID, syncObj.subgroupID, syncObj.activitiesSyncArray, syncObj);
                    }

                    if (syncObj.membershipType == 1 || syncObj.membershipType == 2) {
                        syncObj.teamPendingMembershipRequestsRef = syncObj.self.syncSubgroupPendingMembershipRequests(syncObj.groupID, syncObj.subgroupID, syncObj.pendingMembershipSyncArray, syncObj);
                    }
                },
                removeListeners: function() {
                    if (this.membershipType >= 1) {

                    }

                    if (this.membershipType == 1 || this.membershipType == 2) {

                    }
                },
                subgroupMembershipAddedLater: function(snapshot) {
                    if ((this.spaceID + ">" + this.teamID) == snapshot.key()) { //has become a member now
                        this.self.removeGroupMembershipHandlers.apply(this);
                        this.self.removeListeners.apply(this);
                        this.self.reloadController.apply(this);
                    }
                },
                groupMembershipChanged: function(snapshot) {
                    var newMembershipType = snapshot.val();
                    if (newMembershipType != this.groupMembership.membershipType) { //membership type has changed
                        this.self.removeGroupMembershipHandlers.apply(this);
                        this.self.removeListeners.apply(this);
                        this.self.reloadController.apply(this);
                    }
                },
                subgroupMembershipChanged: function(snapshot) {
                    var newMembershipType = snapshot.val();
                    if (newMembershipType != this.subgroupMembership.membershipType) { //membership type has changed
                        this.self.removeSubgroupMembershipHandlers.apply(this);
                        this.self.removeListeners.apply(this);
                        this.self.reloadController.apply(this);
                    }
                },
                groupMembershipDeleted: function(snapshot) { //is no longer a space member
                    this.self.removeGroupMembershipHandlers.apply(this);
                    this.self.removeListeners.apply(this);
                    this.self.reloadController.apply(this);

                },
                subgroupMembershipDeleted: function(snapshot) { //is no longer a team member
                    this.self.removeSubgroupMembershipHandlers.apply(this);
                    this.self.removeListeners.apply(this);
                    this.self.reloadController.apply(this);

                },

                syncSubgroupMembers: function(groupId, subgroupID, memberArray) {
                    //var ref = firebaseService.getRefGroupMembers().child(spaceID + ">" + teamID);
                    var ref = firebaseService.getRefSubGroupMembers().child(groupId + "/" + subgroupID);
                    ref.on('child_added', this.subgroupUserMembershipAdded, memberArray);
                    ref.on('child_changed', this.subgroupUserMembershipChanged, memberArray);
                    ref.on('child_removed', this.subgroupUserMembershipDeleted, memberArray);
                    return ref;
                },

                subgroupUserMembershipAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            membershipType: snapshot.val()["membership-type"],
                            timestamp: snapshot.val()["timestamp"],
                            userSyncObj: userSyncObj
                        });
                    });
                },
                subgroupUserMembershipChanged: function(snapshot) {
                    var userID = snapshot.key();
                    var membershipObj = snapshot.val();
                    this.forEach(function(obj) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                obj.membershipType = membershipObj["membership-type"];
                            });
                        }
                    });
                },
                subgroupUserMembershipDeleted: function(snapshot) {
                    var self = this;
                    var userID = snapshot.key();
                    this.forEach(function(obj, i) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                self.splice(i, 1);
                            });
                        }
                    });
                },
                syncSubgroupActivities: function(groupID, subgroupID, activitiesSyncArray) {
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(groupID).child(subgroupID).orderByPriority();
                    ref.on("child_added", this.groupActivityAdded, {
                        array: activitiesSyncArray,
                        groupID: groupID,
                        subgroupID: subgroupID,
                        self: this
                    });
                    return ref;
                },
                groupActivityAdded: function(snapshot) {
                    var self = this;
                    var activity = snapshot.val();
                    $timeout(function() {
                        if (activity) {
                            self.array.push(activity);
                        }
                    });
                },

                syncSubgroupPendingMembershipRequests: function(groupID, subgroupID, pendingMembershipSyncArray) {
                    var ref = firebaseService.getRefSubgroupMembershipRequests().child(groupID + "/" + subgroupID);
                    ref.on("child_added", this.subgroupMembershipRequestAdded, pendingMembershipSyncArray);
                    ref.on("child_removed", this.subgroupMembershipRequestDeleted, pendingMembershipSyncArray);
                    return ref;
                },
                subgroupMembershipRequestAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            message: snapshot.val()["message"],
                            timestamp: snapshot.val()["timestamp"],
                            userSyncObj: userSyncObj
                        });
                    });
                },
                subgroupMembershipRequestDeleted: function(snapshot) {
                    var self = this;
                    var userID = snapshot.key();
                    this.forEach(function(obj, i) {
                        if (obj.userID == userID) {
                            $timeout(function() {
                                self.splice(i, 1);
                            });
                        }
                    });
                },
                asyncAddUserMembershipToSubgroup: function(userID, groupID, subgroupID, typeNum) {
                    var that = this;
                    var deferred = $q.defer();
                    var timestampRef = firebaseService.getRefSubGroupMembers().child(groupID + '/' + subgroupID + '/' + userID + '/timestamp');

                    timestampRef.once("value", function(snapshot) {
                        var timestamp = snapshot.val() || firebaseTimeStamp;
                        var userMem = {};

                        userMem[subgroupID] = {
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
                asyncUpdateSubgroupMembers: function(loggedInUserObj, subgroupObj, requestedMembersList, subgroupExistingMembersArray, groupData) {
                    var deferred = $q.defer();
                    var that = this;
                    //create an object from membersSyncArray.
                    var subgroupExistingMembersObj = {};
                    angular.forEach(subgroupExistingMembersArray, function(memberObj) {
                        subgroupExistingMembersObj[memberObj.userID] = true;
                    });

                    userFirebaseService.asyncCreateGroupMembersJSON(loggedInUserObj.userID, requestedMembersList, subgroupExistingMembersObj)
                        .then(function(response) {

                            var promises = [];

                            //Add group to each user
                            var promise;
                            var memArray = response.members;
                            memArray.forEach(function(memberID) {
                                promise = that.asyncAddUserMembershipToSubgroup(memberID, subgroupObj.groupID, subgroupObj.subgroupID, 3);
                                promises.push(promise);
                            });

                            //Add membersJSON to given group
                            var addMembersToGroupDefer = $q.defer();
                            firebaseService.getRefSubGroupMembers().child(subgroupObj.groupID).child(subgroupObj.subgroupID).update(response.memberJSON, function(err) {
                                if (err) {
                                    //handle this scenario
                                    console.log('adding membersJSON to group failed', err);
                                } else {
                                    addMembersToGroupDefer.resolve();
                                }
                            });

                            promises.push(addMembersToGroupDefer.promise);

                            $q.all(promises).then(function() {
                                var memberCountRef = firebaseService.getRefSubGroups().child(subgroupObj.groupID + '/' + subgroupObj.subgroupID + '/' + 'members-count');
                                memberCountRef.transaction(function(currentValue) {
                                    return (currentValue || 0) + memArray.length;
                                });
                                // debugger;
                                var qArray = [];
                                var qArray2 = [];
                                var deffer = $q.defer();
                                deffer.promise
                                    .then(function(dataArrofArr) {

                                        dataArrofArr.forEach(function(arr) {
                                            if (arr[1].type == 1) {
                                                arr[0].checkedin = true
                                            } else {
                                                arr[0].checkedin = false
                                            }
                                            qArray2.push(arr[0].$save())
                                        });
                                        return $q.all(qArray2)
                                    })
                                    .then(function() {
                                        deferred.resolve({
                                            unlistedMembersArray: response.unlisted
                                        });
                                        //step  : entry for "subgroup-activity-streams"
                                        // debugger;

                                    })
                                    .catch(function(d) {
                                        console.log(d);
                                    })
                                for (var member in memArray) {

                                    var temp = $firebaseObject(firebaseService.getRefFlattendGroups().child(loggedInUserObj.userID).child(subgroupObj.groupID + "_" + subgroupObj.subgroupID).child(member))
                                        .$loaded().then(function() {
                                            var temp1 = $firebaseObject(checkinService.getRefSubgroupCheckinCurrentByUser().child(member)).$loaded().then(function() {
                                                qArray.push($q.all([temp, temp1]))
                                            })
                                        })
                                }
                                deffer.resolve($q.all(qArray));





                                /*  if(memArray.length == 1) {

                                      //userFirebaseService.asyncRecordGroupMemberAdditionActivity(subgroupObj, loggedInUserObj, response.members[0])
                                      groupFirebaseService.asyncRecordSubgroupMemberAdditionActivity(loggedInUserObj.userID, subgroupObj.groupID ,subgroupObj.$id, memArray[0] )
                                          .then(function(){
                                              deferred.resolve({unlistedMembersArray: response.unlisted});
                                          })
                                  }
                                  else if (memArray.length > 1) {

                                      groupFirebaseService.asyncRecordManySubgroupsMembersAdditionActivity(loggedInUserObj, groupData, subgroupObj, response.members)
                                          .then(function(){
                                              deferred.resolve({unlistedMembersArray: response.unlisted});
                                          });
                                  }
                                  else {
                                      deferred.resolve({unlistedMembersArray: response.unlisted});
                                  }*/
                            });

                        }, function() {
                            deferred.reject();
                        });

                    return deferred.promise;
                },
                getFirebaseGroupObj: function(groupId) {

                    var ref = firebaseService.getRefGroups().child(groupId);
                    return $firebaseObject(ref)
                },
                getFirebaseGroupSubGroupMemberObj: function(groupid, subgroupid) {

                    var ref = firebaseService.getRefSubGroupMembers().child(groupid).child(subgroupid);
                    return $firebaseArray(ref)
                },
                approveMembership: function(groupID, subgroupID, loggedInUserObj, requestedMember) {
                    var defer, userID, membershipType,
                        userMembershipObj, errorHandler;

                    defer = $q.defer();
                    membershipType = 3; //for members only, should be dynamic when make admin feature added.
                    userID = requestedMember.userID;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    userMembershipObj = {};
                    userMembershipObj[userID] = {
                        'membership-type': membershipType,
                        timestamp: firebaseTimeStamp
                    };

                    //add user to subgroup-membership list
                    firebaseService.getRefGroupMembers().child(groupID)
                        .update(userMembershipObj, function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                //step1: change membership-type of user in user-membership list
                                //firebaseService.getRefUserGroupMemberships().child(userID + '/' + groupID)
                                firebaseService.getRefUserSubGroupMemberships().child(userID + '/' + groupID + '/' + subgroupID)
                                    .set(userMembershipObj[userID], function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            //step2: delete user request from subgroup-membership-requests
                                            //firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                            firebaseService.getRefSubgroupMembershipRequests().child(groupID + '/' + subgroupID + '/' + userID)
                                                .remove(function(err) {
                                                    var groupCountRef;
                                                    if (err) {
                                                        errorHandler();
                                                    } else {
                                                        //step3: set members count in meta-data of subgroup
                                                        //groupCountRef = firebaseService.getRefGroups().child(groupID + '/members-count');
                                                        groupCountRef = firebaseService.getRefSubGroups().child(groupID + '/' + subgroupID + '/members-count');
                                                        groupCountRef.once('value', function(snapshot) {
                                                            var membersCount = snapshot.val();
                                                            membersCount = (membersCount || 0) + 1;
                                                            groupCountRef.set(membersCount, function(err) {
                                                                if (err) {
                                                                    errorHandler();
                                                                } else {
                                                                    //step4: publish an activity
                                                                    firebaseService.getRefSubGroups().child(groupID).child(subgroupID)
                                                                        .once('value', function(snapshot) {
                                                                            var groupObj = snapshot.val();
                                                                            groupObj.groupID = groupID;
                                                                            groupObj.subgroupID = subgroupID;
                                                                            userFirebaseService.asyncRecordSubGroupMemberApproveRejectActivity('approve', groupObj, loggedInUserObj, userID)
                                                                                .then(function(res) {
                                                                                        defer.resolve(res);
                                                                                    },
                                                                                    errorHandler);
                                                                        });
                                                                }
                                                            });
                                                        });
                                                    }
                                                });
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                },
                rejectMembership: function(groupID, subgroupID, loggedInUserObj, requestedMember) {
                    var defer, userID,
                        errorHandler;

                    defer = $q.defer();
                    userID = requestedMember.userID;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    //step1: delete group membership request from user-membership list
                    //firebaseService.getRefUserGroupMemberships().child( userID + '/' + groupID)
                    firebaseService.getRefUserSubGroupMemberships().child(userID + '/' + groupID + '/' + subgroupID)
                        .remove(function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                //step2: delete user request from subgroup-membership-requests
                                //firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                firebaseService.getRefSubgroupMembershipRequests().child(groupID + '/' + subgroupID + '/' + userID)
                                    .remove(function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            //step3: publish an activity
                                            //firebaseService.getRefGroups().child(groupID)
                                            firebaseService.getRefSubGroups().child(groupID).child(subgroupID)
                                                .once('value', function(snapshot) {
                                                    var subgroupOjb = snapshot.val();
                                                    subgroupOjb.groupID = groupID;
                                                    subgroupOjb.subgroupID = subgroupID;
                                                    //userFirebaseService.asyncRecordGroupMemberApproveRejectActivity('reject', groupObj, loggedInUserObj, userID)
                                                    userFirebaseService.asyncRecordSubGroupMemberApproveRejectActivity('reject', subgroupOjb, loggedInUserObj, userID)
                                                        .then(function(res) {
                                                            defer.resolve(res);
                                                        }, errorHandler);
                                                });
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                }



            };
        }
    ]);

/*
var s = {
    "user-subgroup-memberships" : {
        "$userid": {
            ".read": "(auth.uid == $userid)",
            ".validate": "(root.child('users/' + $userid).exists())",
            "$groupid" : {
                ".read": "root.child('user-group-memberships').child(auth.uid).child($groupid).exists() && root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                ".write": "root.child('user-group-memberships').child(auth.uid).child($groupid).exists() && root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-group-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                "$subgroupid": {
                    ".read": "root.child('user-subgroup-memberships').child(auth.uid).child($groupid).exists() && root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                    ".write": "root.child('user-subgroup-memberships').child(auth.uid).child($groupid).exists() && root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 1 || root.child('user-subgroup-memberships').child(auth.uid).child($groupid).child('membership-type').val() == 2",
                    ".validate": "newData.hasChildren(['membership-type', 'timestamp'])",
                    "membership-type": {
                        ".validate": "newData.isNumber() && newData.val() == -1 || newData.val() == 0 || newData.val() == 1 || newData.val() == 2 || newData.val() == 3"

                    },
                    "timestamp": {
                        ".validate": "newData.isNumber() && newData.val() <= now"
                    }
                }

            }
        }
    }
}*/
