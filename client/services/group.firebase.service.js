 /**
 * Created by ZiaKhan on 03/02/15.
 */

'use strict';


angular.module('core')
    .factory('groupFirebaseService', ['$rootScope', 'activityStreamService', "firebaseService", "$q", "$timeout", 'userFirebaseService', 'checkinService', 'confirmDialogService', "$firebaseObject", "userPresenceService",
        function($rootScope, activityStreamService, firebaseService, $q, $timeout, userFirebaseService, checkinService, confirmDialogService, $firebaseObject, userPresenceService) {

            /*var syncObj = {
                subgroupsSyncArray: [],
                membersSyncArray: [],
                pendingMembershipSyncArray: [],
                activitiesSyncArray: []
            };*/
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;


            return {
                getGroupSyncObjAsync: function(groupID, viewerUserID) {
                    var deferred = $q.defer();
                    var self = this;
                    var syncObj = {
                        subgroupsSyncArray: [],
                        membersSyncArray: [],
                        pendingMembershipSyncArray: [],
                        activitiesSyncArray: []
                    };
                    syncObj.self = this;
                    syncObj.viewerUserID = viewerUserID;
                    syncObj.groupID = groupID;
                    syncObj.userGroupMembershipRef = firebaseService.getRefUserGroupMemberships().child(viewerUserID).child(groupID);
                    syncObj.groupSyncObj = $firebaseObject(firebaseService.getRefGroups().child(groupID));
                    syncObj.userGroupMembershipRef.once("value", function(snapshot) {
                        if (snapshot.val()) {

                            syncObj.membershipType = snapshot.val()["membership-type"];
                            syncObj.timestamp = snapshot.val()["timestamp"];
                            syncObj.userGroupMembershipRef.on("child_changed", self.membershipChanged, syncObj);
                            syncObj.userGroupMembershipRef.on("child_removed", self.membershipDeleted, syncObj);
                            self.addListeners(syncObj);
                        } else {
                            syncObj.membershipType = -100; //right now not a member
                            //listen to if membership added later
                            firebaseService.getRefUserGroupMemberships().on("child_added", self.membershipAddedLater, syncObj);
                        }

                        deferred.resolve(syncObj);
                    });


                    return deferred.promise;
                },
                addListeners: function(syncObj) {
                    if (syncObj.membershipType >= 1) {
                        syncObj.subgroupRef = this.syncSubgroups(syncObj.groupID, syncObj.subgroupsSyncArray, syncObj);
                        syncObj.groupMembershipRef = syncObj.self.syncGroupMembers(syncObj.groupID, syncObj.membersSyncArray, syncObj);
                        syncObj.groupActivitiesRef = syncObj.self.syncGroupActivities(syncObj.groupID, syncObj.activitiesSyncArray, syncObj);
                    }

                    if (syncObj.membershipType == 1 || syncObj.membershipType == 2) {
                        syncObj.groupPendingMembershipRequestsRef = syncObj.self.syncGroupPendingMembershipRequests(syncObj.groupID, syncObj.pendingMembershipSyncArray, syncObj);
                    }
                },
                membershipAddedLater: function(snapshot) {
                    if (this.groupID == snapshot.key()) { //has become a member now
                        this.membershipType = snapshot.val()["membership-type"];
                        this.timestamp = snapshot.val()["timestamp"];
                        this.userGroupMembershipRef.on("child_changed", this.self.membershipChanged, this);
                        this.userGroupMembershipRef.on("child_removed", this.self.membershipDeleted, this);
                        this.self.addListeners(this);
                    }
                },
                membershipChanged: function(snapshot) {
                    var newMembershipType = snapshot.val();
                    if (newMembershipType != this.membershipType) { //membership type has changed
                        if (this.membershipType == 3) { //previously was a member
                            if (newMembershipType == 2) { //now a admin
                                this.groupPendingMembershipRequestsRef = this.self.syncGroupPendingMembershipRequests(this.groupID, this.pendingMembershipSyncArray, this);
                            } else if (newMembershipType == -1) { //has been suspended
                                this.self.removeConfidentialGroupData.call(this, this.groupID);
                            }
                        }

                        if (this.membershipType == 2) { //previously was a admin
                            if (newMembershipType == 3) { //now a member only
                                if (this.groupPendingMembershipRequestsRef) {
                                    this.groupPendingMembershipRequestsRef.off("child_added", this.self.groupMembershipRequestAdded, this.pendingMembershipSyncArray);
                                    this.groupPendingMembershipRequestsRef.off("child_removed", this.self.groupMembershipRequestDeleted, this.pendingMembershipSyncArray);
                                }

                                while (this.pendingMembershipSyncArray.length > 0) { //empty pending
                                    this.pendingMembershipSyncArray.pop();
                                }

                            } else if (newMembershipType == -1) { //has been suspended
                                this.self.removeConfidentialGroupData.call(this, this.groupID);
                            }
                        }
                        this.membershipType = newMembershipType;
                    }
                },
                removeConfidentialGroupData: function(groupIDMembershipDeleted) {
                    if (this.groupID == groupIDMembershipDeleted) { //group membership deleted which logged-in-user was viewing
                        this.membershipType = -100;
                        this.timestamp = undefined;

                        if (this.userGroupMembershipRef) {
                            this.userGroupMembershipRef.off("child_changed", this.self.membershipChanged, this);
                            this.userGroupMembershipRef.off("child_removed", this.self.membershipDeleted, this);
                        }

                        if (this.subgroupRef) {
                            if (this.subgroupsRefContext) {
                                this.subgroupRef.off('child_added', this.self.groupUserMembershipAdded, this.subgroupsRefContext);
                            }

                            this.subgroupRef.off('child_removed', this.self.groupUserMembershipAdded, this.subgroupsArray);
                        }

                        if (this.subgroupsRefContext) {
                            this.subgroupsRefContext.subgroupsMembershipRef.off('child_added', this.self.subgroupsAdded, this.subgroupsRefContext);
                            this.subgroupsRefContext.subgroupsMembershipRef.off('child_removed', this.self.subgroupsDeleted, this.subgroupsRefContext);
                        }

                        if (this.groupMembershipRef) {
                            this.groupMembershipRef.off('child_added', this.self.groupUserMembershipAdded, this.membersSyncArray);
                            this.groupMembershipRef.off('child_changed', this.self.groupUserMembershipChanged, this.membersSyncArray);
                            this.groupMembershipRef.off('child_removed', this.self.groupUserMembershipDeleted, this.membersSyncArray);
                        }

                        if (this.groupActivitiesRef) {
                            this.groupActivitiesRef.off("child_added", this.self.groupActivityAdded, this.activitiesSyncArray);
                        }

                        if (this.groupPendingMembershipRequestsRef) {
                            this.groupPendingMembershipRequestsRef.off("child_added", this.self.groupMembershipRequestAdded, this.pendingMembershipSyncArray);
                            this.groupPendingMembershipRequestsRef.off("child_removed", this.self.groupMembershipRequestDeleted, this.pendingMembershipSyncArray);
                        }

                        while (this.subgroupsSyncArray.length > 0) { //empty teams
                            this.subgroupsSyncArray.pop();
                        }
                        while (this.membersSyncArray.length > 0) { //empty members
                            this.membersSyncArray.pop();
                        }
                        while (this.pendingMembershipSyncArray.length > 0) { //empty pending
                            this.pendingMembershipSyncArray.pop();
                        }
                        while (this.activitiesSyncArray.length > 0) { //empty activities
                            this.activitiesSyncArray.pop();
                        }

                    }
                },
                membershipDeleted: function(snapshot) { //is no longer a member
                    var groupIDMembershipDeleted = snapshot.key();
                    this.self.removeConfidentialGroupData.call(this, groupIDMembershipDeleted);

                },
                syncSubgroups: function(groupID, subgroupsArray, syncObj) {
                    var subgroupsRef = firebaseService.getRefSubGroups().child(groupID);
                    var subgroupsMembershipRef = firebaseService.getRefUserSubGroupMemberships().child(syncObj.viewerUserID).child(groupID);

                    syncObj.subgroupsRefContext = {
                        subgroupsMembershipRef: subgroupsMembershipRef,
                        subgroupRef: subgroupsRef,
                        subgroupsArray: subgroupsArray
                    };

                    subgroupsMembershipRef.on('child_added', this.subgroupsAdded, syncObj.subgroupsRefContext);
                    subgroupsMembershipRef.on('child_removed', this.subgroupsDeleted, syncObj.subgroupsRefContext);
                    return subgroupsRef;
                },
                subgroupsAdded: function(snapshot) {
                    var self = this;
                    var subgroupSyncObj = $firebaseObject(this.subgroupRef.child(snapshot.key()));
                    $timeout(function() {
                        self.subgroupsArray.push(subgroupSyncObj);
                    });
                },
                subgroupsDeleted: function(snapshot) {
                    var self = this;
                    var subgroupID = snapshot.key();
                    this.subgroupsArray.forEach(function(obj, i) {
                        if (obj.$id == subgroupID) {
                            $timeout(function() {
                                self.subgroupsArray.splice(i, 1);
                            });
                        }
                    });
                },
                syncGroupMembers: function(groupID, memberArray) {
                    var ref = firebaseService.getRefGroupMembers().child(groupID);
                    ref.on('child_added', this.groupUserMembershipAdded, memberArray);
                    ref.on('child_changed', this.groupUserMembershipChanged, memberArray);
                    ref.on('child_removed', this.groupUserMembershipDeleted, memberArray);
                    return ref;
                },
                groupUserMembershipAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            membershipType: snapshot.val()["membership-type"],
                            timestamp: snapshot.val()["timestamp"],
                            membershipNo: snapshot.getPriority(),
                            userSyncObj: userSyncObj,
                            //FIXME when implementing in client2 , eliminate userSyncObj to avoid duplicate listeners.
                            user: userPresenceService.getUserSyncObject(snapshot.key())
                        });
                    });
                },
                groupUserMembershipChanged: function(snapshot) {
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
                groupUserMembershipDeleted: function(snapshot) {
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
                syncGroupActivities: function(groupID, activitiesSyncArray) {
                    var ref = firebaseService.getRefGroupsActivityStreams().child(groupID).orderByPriority();
                    ref.on("child_added", this.groupActivityAdded, activitiesSyncArray);
                    return ref;
                },
                groupActivityAdded: function(snapshot) {
                    var self = this;
                    var activity = snapshot.val();
                    $timeout(function() {
                        if (activity) {
                            self.push(activity);
                        }
                    });
                },
                syncGroupPendingMembershipRequests: function(groupID, pendingMembershipSyncArray) {
                    var ref = firebaseService.getRefGroupMembershipRequests().child(groupID);
                    ref.on("child_added", this.groupMembershipRequestAdded, pendingMembershipSyncArray);
                    ref.on("child_removed", this.groupMembershipRequestDeleted, pendingMembershipSyncArray);
                    return ref;
                },
                groupMembershipRequestAdded: function(snapshot) {
                    var self = this;
                    var userSyncObj = $firebaseObject(firebaseService.getRefUsers().child(snapshot.key()));
                    $timeout(function() {
                        self.push({
                            userID: snapshot.key(),
                            message: snapshot.val()["message"],
                            timestamp: snapshot.val()["timestamp"],
                            "teamrequest": snapshot.val()["team-request"],
                            "membershipNo": snapshot.val()["membershipNo"],
                            userSyncObj: userSyncObj
                        });
                    });
                },
                groupMembershipRequestDeleted: function(snapshot) {
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
                asyncCreateSubgroup: function(userID, group, subgroupInfo, subgroupList) {

                    /* NODES TO HIT FOR CREATING SUBGROUPS:
                     subgroup-members
                     user-subgroup-memberships
                     subgroup-names
                     subgroups
                     subgroup-activity-streams
                     */

                    var self = this;
                    var deferred = $q.defer();
                    var subgroupExist = false;
                    var errorHandler = function(reason) {
                        deferred.reject(reason || "Subgroup creation failed. error occurred in accessing server.");
                    };

                    //Step 1: check if subgroup does not exist
                    subgroupList.forEach(function(subgroup) {
                        if (subgroup.subgroupID == subgroupInfo.subgroupID) {
                            errorHandler("Subgroup not created, " + subgroupInfo.subgroupID + " already exists"); //subgroup ID already exists
                            subgroupExist = true;
                        }
                    });

                    if (subgroupExist) {
                        return deferred.promise;
                    }

                    //step : create an entry for "subgroup-members"
                    self.asyncCreateSubGroupMembersJSON(userID, subgroupInfo.members)
                        .then(function(response) {
                            var memRef = firebaseService.getRefSubGroupMembers().child(group.$id).child(subgroupInfo.subgroupID);
                            var mems = response.memberJSON;
                            //if(response.members.length != 0) { //by default admin is included in membersJSON of subgroup.

                            //step : create subgroup members
                            memRef.set(mems, function(error) {
                                if (error) {
                                    //roleback previous
                                    errorHandler();
                                } else {
                                    var subgroupNames = {title: subgroupInfo.title, subgroupImgUrl: subgroupInfo.imgLogoUrl || '', ownerImgUrl: $rootScope.userImg || ''};
                                    // step: create and entry for "subgroups-names"
                                    var groupNameRef = firebaseService.getRefSubGroupsNames().child(group.$id).child(subgroupInfo.subgroupID);
                                    groupNameRef.set(subgroupNames,  function(error) {
                                        if (error) {
                                            deferred.reject();
                                            //role back previous
                                        } else {
                                            //step: create an entry for "user-subgroup-memberships"
                                            self.asyncCreateUserSubgroupMemberships(group.$id, subgroupInfo.subgroupID, mems)
                                                .then(function() {
                                                    firebaseService.getRefGroups().child(group.$id).once('value', function(snapshot) {
                                                        var countsubgroup = snapshot.val()["subgroups-count"] + 1;
                                                        // console.log(countsubgroup, 'testing')
                                                        firebaseService.getRefGroups().child(group.$id).child('subgroups-count').set(countsubgroup, function() {
                                                            if (error) {
                                                                errorHandler();
                                                            }
                                                        });
                                                    });
                                                    // console.log($rootScope.userImg)

                                                    //save in subgroup-policies for Policies
                                                    firebaseService.getRefSubgroupPolicies().child(group.$id).child(subgroupInfo.subgroupID).set({'hasPolicy': false, 'policyID': '', 'subgroup-title': subgroupInfo.title, 'policy-title': ''});

                                                    //step : create an entry for "subgroups"
                                                    var subgroupRef = firebaseService.getRefSubGroups().child(group.$id).child(subgroupInfo.subgroupID);
                                                    subgroupRef.set({
                                                        title: subgroupInfo.title,
                                                        desc: subgroupInfo.desc,
                                                        timestamp: firebaseTimeStamp,
                                                        "members-count": response.membersCount,
                                                        "microgroups-count": 0,
                                                       "members-checked-in": {
                                                            "count": 0
                                                        },
                                                        'logo-image': {
                                                            url: subgroupInfo.imgLogoUrl || '', // pID is going to be changed with userID for single profile picture only
                                                            id: subgroupInfo.subgroupID,
                                                            'bucket-name': 'test2pwow',
                                                            source: 1, // 1 = google cloud storage
                                                            mediaType: 'image/png' //image/jpeg
                                                        },
                                                        'subgroup-owner-id': userID,
                                                        'owner-img-url': $rootScope.userImg || ''
                                                    }, function(error) {
                                                        if (error) {
                                                            //role back previous
                                                            errorHandler();
                                                        } else {
                                                            // creating flattened-groups data in firebase

                                                            var qArray = [];
                                                            var qArray2 = [];
                                                            var deffer = $q.defer();
                                                            deffer.promise
                                                                .then(function(dataArrofArr) {

                                                                    // dataArrofArr.forEach(function(arr) {
                                                                    //     if (arr[1].type == 1) {
                                                                    //         arr[0].checkedin = true
                                                                    //     } else {
                                                                    //         arr[0].checkedin = false
                                                                    //     }
                                                                    //     qArray2.push(arr[0].$save())
                                                                    // });
                                                                    // return $q.all(qArray2)
                                                                })
                                                                .then(function() {
                                                                    deferred.resolve({
                                                                        unlistedMembersArray: response.unlisted
                                                                    });
                                                                    //step  : entry for "subgroup-activity-streams"
                                                                    //                                                            debugger;

                                                                    //self.asyncRecordSubgroupCreationActivity($localStorage.loggedInUser, group, subgroupInfo).then(function () {
                                                                    //    if (response.members.length == 1) {
                                                                    //        //self.asyncRecordSubgroupMemberAdditionActivity($sessionStorage.loggedInUser, group, subgroupInfo, response.members[0])
                                                                    //        self.asyncRecordSubgroupMemberAdditionActivity($localStorage.loggedInUser, group, subgroupInfo, response.members[0])
                                                                    //            .then(function () {
                                                                    //                deferred.resolve({unlistedMembersArray: response.unlisted});
                                                                    //            });
                                                                    //    }
                                                                    //    else if (response.members.length > 1) {
                                                                    //        //self.asyncRecordManySubgroupsMembersAdditionActivity($sessionStorage.loggedInUser, group, subgroupInfo, response.members)
                                                                    //        self.asyncRecordManySubgroupsMembersAdditionActivity($localStorage.loggedInUser, group, subgroupInfo, response.members)
                                                                    //            .then(function () {
                                                                    //                deferred.resolve({unlistedMembersArray: response.unlisted});
                                                                    //            });
                                                                    //    }
                                                                    //    else {
                                                                    //        deferred.resolve({unlistedMembersArray: response.unlisted});
                                                                    //    }
                                                                    //});

                                                                })
                                                                .catch(function(d) {
                                                                    //debugger;
                                                                });
                                                            // for (var member in mems) {
                                                            //
                                                            //     var temp = $firebaseObject(firebaseService.getRefFlattendGroups().child(userID).child(group.$id + "_" + subgroupInfo.subgroupID).child(member))
                                                            //         .$loaded()
                                                            //
                                                            //     var temp1 = $firebaseObject(checkinService.getRefSubgroupCheckinCurrentByUser().child(member)).$loaded()
                                                            //
                                                            //     qArray.push($q.all([temp, temp1]))
                                                            //
                                                            //
                                                            // }
                                                            //deffer.resolve($q.all(qArray))
                                                            deffer.resolve('');

                                                        }
                                                    });

                                                }, errorHandler);
                                        }
                                    });


                                }
                            });
                        });

                    return deferred.promise;
                },
                asyncCreateSubGroupMembersJSON: function(ownerUserID, listStr, existingMembersObj) {
                    /*
                    @param ownerUserID // 'ownerid'
                    @param listStr // 'userid1,userid2'
                    @param existingMembersObj // { userid1 : {}, userid2: {}}

                    @return memberJSON {object} {
                     userId1: {
                          memberhsip-type: 1, // members
                          timestamp: timestamp
                       },
                     userid2 : {
                         memberhsip-type: 3, // members
                         timestamp: timestamp
                     }
                     }

                       */

                    var deferred = $q.defer();

                    var groupMembersJSON = {};
                    var unlistedMembers = [];
                    var members = [];

                    //this time we are including ownerid in membersJSON with membership-type: 1. unlike groupmemberJSON method
                    groupMembersJSON[ownerUserID] = {
                        "membership-type": 1, //1 means owner, 2 will mean admin, 3 means member only
                        timestamp: firebaseTimeStamp
                    };

                    if (listStr.length < 2) {
                        deferred.resolve({
                            memberJSON: groupMembersJSON,
                            unlisted: unlistedMembers,
                            members: members,
                            membersCount: 1
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
                                membersCount: memberArray.length,
                                unlisted: unlistedMembers,
                                members: members
                            });
                        }, function() {
                            deferred.reject();
                        });
                    }

                    return deferred.promise;
                },
                asyncCreateUserSubgroupMemberships: function(groupID, subGroupID, memberJSONObj) {
                    var defer = $q.defer();
                    var promise;
                    var promises = [];
                    var userSubgroupMembershipRef = firebaseService.getRefUserSubGroupMemberships();

                    angular.forEach(memberJSONObj, function(membershipObj, memberID) {
                        promise = $q.defer();

                        userSubgroupMembershipRef.child(memberID + '/' + groupID + '/' + subGroupID)
                            .set(membershipObj, function(err) {
                                if (err) {
                                    promise.reject();
                                } else {
                                    promise.resolve();
                                }
                            });

                        promises.push(promise);
                    });

                    $q.all(promises).then(function() {
                        defer.resolve();
                    }, function() {
                        defer.reject();
                    });

                    return defer.promise;
                },
                asyncCreateGroupMembersJSON: function(ownerUserID, groupMemberList, listStr) {
                    var self = this;
                    var deferred = $q.defer();
                    var subgroupMembersJSON = {};

                    var unlistedMembers = [];
                    var members = [];

                    if (listStr.length < 2) {
                        deferred.resolve({
                            memberJSON: subgroupMembersJSON,
                            unlisted: unlistedMembers,
                            members: members
                        });
                    } else {
                        var memberArray = listStr.split(",");
                        var promises = [];
                        memberArray.forEach(function(val, i) {
                            val = val.trim();
                            var promise = firebaseService.asyncCheckIfUserExists(val);
                            promise.then(function(response) {
                                if (response.exists) {
                                    if (val != ownerUserID) {
                                        var added = false;
                                        groupMemberList.forEach(function(memberVal) {
                                            if (memberVal.userID == val) { //user must be member of the parent group
                                                var key = val;
                                                subgroupMembersJSON[key] = {
                                                    "membership-type": 3,
                                                    timestamp: firebaseTimeStamp
                                                }; //1 means member only, 2 will mean admin
                                                members.push(val);
                                                added = true;
                                            }
                                        });

                                        if (!added) {
                                            unlistedMembers.push(val);
                                        }
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
                                memberJSON: subgroupMembersJSON,
                                unlisted: unlistedMembers,
                                members: members
                            });
                        }, function() {
                            deferred.reject();
                        });
                    }

                    return deferred.promise;
                },
                asyncRecordSubgroupCreationActivity: function(user, group, subgroup) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(group.$id).child(subgroup.subgroupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var object = {
                        "type": "subgroup",
                        "id": subgroup.subgroupID, //an index should be set on this
                        "url": group.$id + "/" + subgroup.subgroupID,
                        "displayName": subgroup.title
                    };

                    var target = {
                        "type": "group",
                        "id": group.$id, //an index should be set on this
                        "url": group.$id,
                        "displayName": group.title
                    };

                    var activity = {
                        language: "en",
                        verb: "subgroup-creation",
                        published: firebaseTimeStamp,
                        displayName: actor.displayName + " created " + subgroup.title + " in " + group.title,
                        actor: actor,
                        object: object,
                        target: target
                    };

                    var newActivityRef = ref.push();
                    newActivityRef.set(activity, function(error) {
                        if (error) {

                        } else {
                            var activityID = newActivityRef.key();
                            var activityEntryRef = ref.child(activityID);
                            activityEntryRef.once("value", function(snapshot) {
                                var timestamp = snapshot.val().published;
                                newActivityRef.setPriority(0 - timestamp, function(error2) {
                                    if (error2) {

                                    } else {
                                        deferred.resolve();
                                    }
                                });
                            });


                        }
                    });

                    return deferred.promise;
                },
                asyncRecordSubgroupMemberAdditionActivity: function(user, group, subgroup, memberUserID) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(group.$id).child(subgroup.subgroupID);
                    var actor = {
                        "type": "user",
                        "id": user.userID, //this is the userID, and an index should be set on this
                        "email": user.email,
                        "displayName": user.firstName + " " + user.lastName
                    };

                    var target = {
                        "type": "subgroup",
                        "id": subgroup.subgroupID,
                        "url": group.$id + "/" + subgroup.subgroupID,
                        "displayName": subgroup.title,
                        "parent": {
                            "type": "group",
                            "id": group.$id,
                            "displayName": group.title,
                            "url": group.$id
                        }
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
                            verb: "subgroup-added-member",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added " + object.displayName + " as a member in " + subgroup.title,
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {

                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {

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
                asyncRecordManySubgroupsMembersAdditionActivity: function(user, group, subgroup, membersArray) {
                    var deferred = $q.defer();
                    var ref = firebaseService.getRefSubGroupsActivityStreams().child(group.$id).child(subgroup.subgroupID);
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
                        "type": "subgroup",
                        "id": subgroup.subgroupID,
                        "url": group.$id + "/" + subgroup.subgroupID,
                        "displayName": subgroup.title,
                        "parent": {
                            "type": "group",
                            "id": group.$id,
                            "displayName": group.title,
                            "url": group.$id
                        }

                    };

                    var promiseArray = [];
                    membersArray.forEach(function(m) {
                        promiseArray.push(firebaseService.asyncCheckIfUserExists(m));
                    });

                    $q.all(promiseArray).then(function(values) {
                        values.forEach(function(v) {
                            object.items[v.userID] = {
                                "verb": "subgroup-added-member",
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
                            verb: "subgroup-added-many-members",
                            published: firebaseTimeStamp,
                            displayName: actor.displayName + " added members to " + subgroup.title + " team",
                            actor: actor,
                            object: object,
                            target: target
                        };

                        var newActivityRef = ref.push();
                        newActivityRef.set(activity, function(error) {
                            if (error) {

                            } else {
                                var activityID = newActivityRef.key();
                                var activityEntryRef = ref.child(activityID);
                                activityEntryRef.once("value", function(snapshot) {
                                    var timestamp = snapshot.val().published;
                                    newActivityRef.setPriority(0 - timestamp, function(error2) {
                                        if (error2) {

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
                asyncUpdateGroupMembers: function(loggedInUserObj, groupObj, requestedMembersList, groupExistingMembersArray) {
                    var deferred = $q.defer();

                    //create an object from membersSyncArray.
                    var groupExistingMembersObj = {};
                    angular.forEach(groupExistingMembersArray, function(memberObj) {
                        groupExistingMembersObj[memberObj.userID] = true;
                    });

                    userFirebaseService.asyncCreateGroupMembersJSON(loggedInUserObj.userID, requestedMembersList, groupExistingMembersObj)
                        .then(function(response) {

                            var promises = [];

                            //Add group to each user
                            var promise;
                            var memArray = response.members;
                            memArray.forEach(function(memberID) {
                                promise = userFirebaseService.asyncAddUserMembership(memberID, groupObj.groupID, 3);
                                promises.push(promise);
                            });

                            //Add membersJSON to given group
                            var addMembersToGroupDefer = $q.defer();
                            firebaseService.getRefGroupMembers().child(groupObj.groupID).update(response.memberJSON, function(err) {
                                if (err) {
                                    //handle this scenario
                                    // console.log('adding membersJSON to group failed', err);
                                } else {
                                    addMembersToGroupDefer.resolve();
                                }
                            });

                            promises.push(addMembersToGroupDefer.promise);

                            $q.all(promises).then(function() {
                                var memberCountRef = firebaseService.getRefGroups().child(groupObj.groupID + '/' + 'members-count');
                                memberCountRef.transaction(function(currentValue) {
                                    return (currentValue || 0) + memArray.length;
                                });

                                if (memArray.length == 1) {
                                    userFirebaseService.asyncRecordGroupMemberAdditionActivity(groupObj, loggedInUserObj, response.members[0])
                                        .then(function() {
                                            deferred.resolve({
                                                unlistedMembersArray: response.unlisted
                                            });
                                        })
                                } else if (memArray.length > 1) {
                                    userFirebaseService.asyncRecordManyGroupMembersAdditionActivity(groupObj, loggedInUserObj, response.members)
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

                    return deferred.promise;
                },
                addsubgroupmember: function(userID, groupID, subgroupID){
                    var defer = $q.defer();
                    var count = 0;
                    firebaseService.getRefMain().child('subgroups').child(groupID).child(subgroupID).child('members-count').once('value', function(snapshot){
                        count = snapshot.val();
                    })
                    var multipath = {};
                    multipath["user-subgroup-memberships/" + userID + "/" + groupID + "/" + subgroupID] = {
                        "membership-type": 3,
                        timestamp: Firebase.ServerValue.TIMESTAMP
                    };
                    multipath["subgroup-members/" + groupID + "/" + subgroupID + "/" + userID] = {
                        "membership-type": 3,
                        timestamp: Firebase.ServerValue.TIMESTAMP
                    }
                    multipath["subgroups/" + groupID + "/" + subgroupID + "/members-count"] = count + 1;
                    multipath["subgroups/" + groupID + "/" + subgroupID + "/timestamp"] = Firebase.ServerValue.TIMESTAMP;
                    firebaseService.getRefMain().update(multipath, function(err){
                        if (err) {
                            defer.reject(err);
                        } else {
                            defer.resolve();
                        }
                    })
                    return defer.promise;
                },
                approveMembership: function(groupID, loggedInUserObj, requestedMember, groupObj) {
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

                    //add user to group-membership list
                    firebaseService.getRefGroupMembers().child(groupID)
                        .update(userMembershipObj, function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                if (requestedMember.membershipNo) {
                                    firebaseService.getRefGroupMembers().child(groupID).child(userID).setPriority(requestedMember.membershipNo);
                                }
                                //step1: change membership-type of user in user-membership list
                                firebaseService.getRefUserGroupMemberships().child(userID + '/' + groupID)
                                    .set(userMembershipObj[userID], function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            //step2: delete user request from group-membership-requests
                                            firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                                .remove(function(err) {
                                                    var groupCountRef;
                                                    if (err) {
                                                        errorHandler();
                                                    } else {
                                                        //step3: set members count in meta-data of group
                                                        groupCountRef = firebaseService.getRefGroups().child(groupID + '/members-count');
                                                        groupCountRef.once('value', function(snapshot) {
                                                            var membersCount = snapshot.val();
                                                            membersCount = (membersCount || 0) + 1;
                                                            groupCountRef.set(membersCount, function(err) {
                                                                if (err) {
                                                                    errorHandler();
                                                                } else {

                                                                    //publish an activity stream record -- START --
                                                                    var type = 'group';
                                                                    var targetinfo = {id: groupID, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                                                    var area = {type: 'membersettings', action: 'group-approve-member'};
                                                                    var group_id = groupID;
                                                                    var memberuserID = userID;
                                                                    //for group activity record
                                                                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                                                    //for group activity stream record -- END --
                                                                    defer.resolve();
                                                                    // //step4: publish an activity
                                                                    // firebaseService.getRefGroups().child(groupID).once('value', function(snapshot) {
                                                                    //         var groupObj = snapshot.val();
                                                                    //         groupObj.groupID = groupID;
                                                                    //         userFirebaseService.asyncRecordGroupMemberApproveRejectActivity('approve', groupObj, loggedInUserObj, userID)
                                                                    //             .then(function(res) {
                                                                    //                 defer.resolve(res);
                                                                    //             }, errorHandler);
                                                                    //     });
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
                rejectMembership: function(groupID, loggedInUserObj, requestedMember, groupObj) {
                    var defer, userID,
                        errorHandler;
                    defer = $q.defer();
                    userID = requestedMember.userID;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    //step1: delete group membership request from user-membership list
                    //firebaseService.getRefUserGroupMemberships().child(userID + '/' + groupID)
                        //.remove(function(err) {
                        //    if (err) {
                        //        errorHandler();
                        //    } else {
                                //step2: delete user request from group-membership-requests
                                firebaseService.getRefGroupMembershipRequests().child(groupID + '/' + userID)
                                    .remove(function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {

                                            //publish an activity stream record -- START --
                                            var type = 'group';
                                            var targetinfo = {id: groupID, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                            var area = {type: 'membersettings', action: 'group-ignore-member'};
                                            var group_id = groupID;
                                            var memberuserID = userID;
                                            //for group activity record
                                            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                            //for group activity stream record -- END --

                                            // //step3: publish an activity
                                            // firebaseService.getRefGroups().child(groupID).once('value', function(snapshot) {
                                            //         var groupObj = snapshot.val();
                                            //         groupObj.groupID = groupID;
                                            //         userFirebaseService.asyncRecordGroupMemberApproveRejectActivity('reject', groupObj, loggedInUserObj, userID)
                                            //             .then(function(res) {
                                            //                 defer.resolve(res);
                                            //             }, errorHandler);
                                            //     });
                                        }
                                    });
                        //    }
                        //});

                    return defer.promise;
                },
                changeMemberRole: function(newType, member, groupObj, loggedInUser) {
                    var defer, self, prevType,
                        errorHandler;

                    defer = $q.defer();
                    self = this;
                    prevType = member.membershipType;

                    errorHandler = function(err) {
                        defer.reject('Error occurred in accessing server.');
                    };

                    if (newType) {
                        //update membership type in user memberships
                        userFirebaseService.asyncAddUserMembership(member.userSyncObj.$id, groupObj.$id, newType)
                            .then(function() {
                                var userMem = {};
                                userMem[member.userSyncObj.$id] = {
                                    'membership-type': newType,
                                    timestamp: firebaseTimeStamp
                                };

                                //update membership type in group memberships
                                firebaseService.getRefGroupMembers().child(groupObj.$id)
                                    .update(userMem, function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {

                                            //type: '2' is Admin, '3' is Member, '-1' is block, 'null' is delete membership for this group
                                            var typeAction = { '2': 'user-membership-from-member-to-admin', '3': 'user-membership-from-admin-to-member', '-1': 'user-membership-block', '4': 'user-membership-unblock' };

                                            //incase from block to member (we check prevType, if block then allow to be member)
                                            if(prevType == '-1'){
                                                newType = '4';
                                            }

                                            //for group activity stream record -- START --
                                            var type = 'group';
                                            var targetinfo = {id: groupObj.$id, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                            var area = {type: 'membersettings', action: (newType) ? typeAction[newType] : 'group-member-removed'};
                                            var group_id = groupObj.$id;
                                            var memberuserID = member.userID;
                                            //for group activity record
                                            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                            //for group activity stream record -- END --

                                            // if create admin of group then add subgroups admin of that group -- START
                                            // if create admin of group then add subgroups admin of that group -- END
                                            if (newType === 2) {
                                                var subgroups = activityStreamService.getSubgroupsOfGroup();
                                                subgroups[groupObj.$id].forEach(function(val,index){
                                                    self.addRemoveAdminOfGroup(groupObj.$id, val, member.userSyncObj.$id, newType);
                                                });
                                            } else {
                                                var subgroups = activityStreamService.getSubgroupsOfGroup();
                                                subgroups[groupObj.$id].forEach(function(val,index){
                                                    self.addRemoveAdminOfGroup(groupObj.$id, val, member.userSyncObj.$id, null);
                                                });
                                            }

                                            defer.resolve();

                                            // //publish an activity for membership changed.
                                            // userFirebaseService.asyncRecordMembershipChangeActivity(prevType, newType, member.userSyncObj, groupObj, loggedInUser)
                                            //     .then(function(res) {
                                            //         defer.resolve(res);
                                            //     }, errorHandler);
                                        }
                                    });

                            }, errorHandler);

                    } else {
                        self.asyncRemoveUserFromGroup(member.userSyncObj.$id, groupObj.$id)
                            .then(function() {

                                //if newType is null for Delete Member..........
                                //for group activity stream record -- START --
                                var type = 'group';
                                var targetinfo = {id: groupObj.$id, url: groupObj.$id, title: groupObj.title, type: 'user-membership-change' };
                                var area = {type: 'membersettings', action: 'group-member-removed'};
                                var group_id = groupObj.$id;
                                var memberuserID = member.userID;
                                //for group activity record
                                activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                                //for group activity stream record -- END --

                                defer.resolve();

                                //publish an activity for group-member-removed.
                                // userFirebaseService.asyncRecordMemberRemoved(prevType, newType, member.userSyncObj, groupObj, loggedInUser)
                                //     .then(function(res) {
                                //         defer.resolve(res);
                                //     }, errorHandler);

                            }, errorHandler);
                        /* confirmDialogService('Are you sure to remove this user ?')
                             .then(function () {
                                 //remove user from group

                             }, function() {
                                 defer.reject('Cancelled removing user.');
                             });*/
                    }

                    return defer.promise;
                },
                asyncRemoveUserFromGroup: function(memberID, groupID) {
                    var defer, self,
                        errorHandler;

                    self = this;
                    defer = $q.defer();
                    errorHandler = function() {
                        defer.reject('Error occurred in accessing server.')
                    };

                    self.asyncRemoveUserCheckin(memberID, groupID)
                        .then(function(res) {
                            self.asyncUpdateGroupDataForRemoveUser(res, groupID)
                                .then(function() {
                                    self.asyncRemoveUserMembership(memberID, groupID)
                                        .then(function() {
                                            defer.resolve();
                                        }, errorHandler);
                                }, errorHandler);
                        }, errorHandler);

                    return defer.promise;
                },
                asyncRemoveUserCheckin: function(memberID, groupID) {
                    var defer = $q.defer();

                    //check for current check-in/out status of user
                    var userCurrentCheckinRef = checkinService.getRefCheckinCurrent().child(groupID + '/' + memberID);
                    userCurrentCheckinRef.once('value', function(snapshot) {
                        var checkinObj = snapshot.val();

                        //if user's check-in/out exists
                        if (checkinObj) {
                            //remove user check-in/out
                            userCurrentCheckinRef.remove(function(err) {
                                if (err) {
                                    defer.reject();
                                } else {
                                    defer.resolve(checkinObj);
                                }
                            });
                        } else {
                            //if not yet checked-in, skip checkin removal
                            defer.resolve(null);
                        }
                    });

                    return defer.promise;
                },
                asyncRemoveUserMembership: function(memberID, groupID) {
                    var defer, errorHandler;

                    defer = $q.defer();

                    errorHandler = function() {
                        defer.reject('Error occurred in accessing server.');
                    };

                    firebaseService.getRefGroupMembers().child(groupID + '/' + memberID)
                        .remove(function(err) {
                            if (err) {
                                errorHandler();
                            } else {
                                firebaseService.getRefUserGroupMemberships().child(memberID + '/' + groupID)
                                    .remove(function(err) {
                                        if (err) {
                                            errorHandler();
                                        } else {
                                            defer.resolve();
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                },
                asyncUpdateGroupDataForRemoveUser: function(checkinObj, groupID) {
                    var defer = $q.defer();

                    //update group meta-data
                    var groupDataRef = firebaseService.getRefGroups().child(groupID);
                    groupDataRef.once('value', function(snapshot) {
                        var updateObj = {};
                        var dataObject = snapshot.val();

                        if (checkinObj && checkinObj.type == 1) {
                            updateObj['members-checked-in'] = {
                                   count: dataObject['members-checked-in'].count - 1
                              };
                          }


                        // if (checkinObj && checkinObj.type == 1) {
                        //     updateObj['members-checked-in'] = {
                        //         count: dataObject['members-checked-in'].count - 1
                        //     };
                        // }


                        updateObj['members-count'] = dataObject['members-count'] - 1;
                        groupDataRef.update(updateObj, function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });
                    });

                    return defer.promise;
                },
                asyncUpdateSubGroupDataForRemoveUser: function(checkinObj, groupID, userID) {
                    var defer = $q.defer();

                    // var groupDataRef = firebaseService.getRefUserSubGroupMemberships().child(userID).child(groupID).once('value', function(snapshot){});
                    //update group meta-data
                    var groupDataRef = firebaseService.getRefSubGroups().child(groupID);
                    groupDataRef.once('value', function(snapshot) {
                        var updateObj = {};
                        var dataObject = snapshot.val();

                        if (checkinObj && checkinObj.type == 1) {
                            updateObj['members-checked-in'] = {
                                   count: dataObject['members-checked-in'].count - 1
                              };
                          }


                        // if (checkinObj && checkinObj.type == 1) {
                        //     updateObj['members-checked-in'] = {
                        //         count: dataObject['members-checked-in'].count - 1
                        //     };
                        // }


                        updateObj['members-count'] = dataObject['members-count'] - 1;
                        groupDataRef.update(updateObj, function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });
                    });

                    return defer.promise;
                },
                asyncLeaveGroup: function(userObj, groupObj) {
                    var defer, errorHandler, self;

                    defer = $q.defer();
                    self = this;

                    errorHandler = function() {
                        defer.reject('could not access server data');
                    };

                    userFirebaseService.asyncRecordMemberLeft(userObj, groupObj)
                        .then(function(res) {
                            self.asyncRemoveUserFromGroup(userObj.$id, groupObj.$id)
                                .then(function() {
                                    defer.resolve(res);
                                }, errorHandler);

                        }, errorHandler);

                    return defer.promise;
                },
                asyncRemoveGroup: function(userObj, groupObj) {
                    var defer, self, errorHandler,
                        promises, dfr;

                    defer = $q.defer();
                    self = this;
                    promises = [];

                    errorHandler = function(reason) {
                        defer.reject(reason || 'could not access server data');
                    };

                    //for node: group-activity-streams > $groupid
                    self.asyncRemoveGroupActivityStreams(groupObj.$id)
                        .then(function() {

                            //for node: "group-check-in-current" and "group-check-in-records"
                            self.asyncRemoveGroupCheckin(groupObj.$id)
                                .then(function() {

                                    //for node: group-locations-defined > $groupid
                                    self.asyncRemoveGroupDefLocs(groupObj.$id)
                                        .then(function() {

                                            //for node: group-membership-requests > $groupid AND group-membership-requests-by-user
                                            self.asyncRemoveGroupMembershipRequests(groupObj.$id)
                                                .then(function() {

                                                    //for node: "group-names"
                                                    self.asyncRemoveGroupNames(groupObj.$id)
                                                        .then(function() {

                                                            //for node: "groups"
                                                            self.asyncRemoveGroupMetaDeta(groupObj.$id)
                                                                .then(function() {

                                                                    //get members list array
                                                                    self.asyncGetGroupMembersArray(groupObj.$id)
                                                                        .then(function(membersArray) {

                                                                            dfr = $q.defer();
                                                                            angular.forEach(membersArray, function(memberID) {

                                                                                //for node: group-members and user-group-memberships
                                                                                self.asyncRemoveUserMembership(memberID, groupObj.$id)
                                                                                    .then(function() {
                                                                                        dfr.resolve('You have removed "' + groupObj.title + '" group successfully.');
                                                                                    }, function() {
                                                                                        dfr.reject();
                                                                                    });

                                                                                promises.push(dfr.promise);
                                                                            });

                                                                            $q.all(promises).then(function() {
                                                                                defer.resolve('group has been removed successfully.');
                                                                            }, errorHandler);
                                                                        });
                                                                }, errorHandler);
                                                        }, errorHandler);
                                                }, errorHandler);
                                        }, errorHandler);
                                }, errorHandler);
                        }, errorHandler);

                    return defer.promise;
                },
                asyncRemoveGroupCheckin: function(groupID) {
                    //for "group-check-in-current" and "group-check-in-records"
                    var defer = $q.defer();

                    firebaseService.getRefGroupCheckinCurrent().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                firebaseService.getRefGroupCheckinRecords().child(groupID)
                                    .remove(function(err) {
                                        if (err) {
                                            defer.reject();
                                        } else {
                                            defer.resolve();
                                        }
                                    });
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupDefLocs: function(groupID) {
                    //for "group-locations-defined"
                    var defer = $q.defer();

                    firebaseService.getRefGroupLocsDefined().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupActivityStreams: function(groupID) {
                    //for "group-activity-streams"
                    var defer = $q.defer();

                    firebaseService.getRefGroupsActivityStreams().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupMembershipRequests: function(groupID) {
                    //for "group-membership-requests" and "group-membership-requests-by-user"
                    var defer, requestedMembers,
                        promises, dfr;

                    defer = $q.defer();
                    promises = [];

                    firebaseService.getRefGroupMembershipRequests().child(groupID)
                        .on('value', function(snapshot) {
                            requestedMembers = snapshot.val() || {};
                            requestedMembers = Object.keys(requestedMembers);

                            //if group does not have any membership-requests, skip requests removal step
                            if (!requestedMembers.length) {
                                defer.resolve();
                            } else {
                                //if group have membership-requests for approval or rejection.
                                angular.forEach(requestedMembers, function(requestedMemberID) {
                                    dfr = $q.defer();
                                    promises.push(dfr.promise);

                                    //remove requested Member's request from "group-membership-requests-by-user"
                                    firebaseService.getRefGroupMembershipRequestsByUser().child(requestedMemberID + '/' + groupID)
                                        .remove(function(err) {
                                            if (err) {
                                                dfr.reject();
                                            } else {
                                                dfr.resolve();
                                            }
                                        });
                                });

                                $q.all(promises)
                                    .then(function() {
                                        defer.resolve();
                                    }, function() {
                                        defer.reject();
                                    });
                            }
                        }, function() {
                            defer.reject('permission denied to access data.');
                        });

                    return defer.promise;

                },
                asyncRemoveGroupNames: function(groupID) {
                    //for "group-names"
                    var defer = $q.defer();

                    firebaseService.getRefGroupsNames().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncRemoveGroupMetaDeta: function(groupID) {
                    //for "groups"
                    var defer = $q.defer();

                    firebaseService.getRefGroups().child(groupID)
                        .remove(function(err) {
                            if (err) {
                                defer.reject();
                            } else {
                                defer.resolve();
                            }
                        });

                    return defer.promise;
                },
                asyncGetGroupMembersArray: function(groupID) {
                    //to get an array that contains userIDs of all members of group
                    var defer = $q.defer();

                    firebaseService.getRefGroupMembers().child(groupID)
                        .on('value', function(snapshot) {
                            var membersObj = snapshot.val() || {};
                            defer.resolve(Object.keys(membersObj));
                        }, function() {
                            defer.reject('permission denied to access data.');
                        });

                    return defer.promise;
                },
                addRemoveAdminOfGroup: function(groupId, subgroupId, userId, memberType) {
                    var self = this;
                    var ref = firebaseService.getRefMain();

                    var obj = (memberType) ? {'membership-type': memberType, 'timestamp': firebaseTimeStamp } : null;

                    // Create the data we want to update
                    var updatedUserData = {};
                    updatedUserData["subgroup-members/" + groupId + '/'+ subgroupId + '/' + userId] = obj;
                    updatedUserData["user-subgroup-memberships/" + userId + '/' + groupId + '/'+ subgroupId] = obj;

                    //UPDATE MULTIPATH
                    ref.update(updatedUserData, function(err){
                        if(err){
                            console.log(err);
                        } else {
                            // console.log('done');
                        }
                    });

                    //update subgroup member count
                    self.subgroupMemberUpdate(groupId, subgroupId, userId, memberType);

                }, // addRemoveAdminOfGroup
                subgroupMemberUpdate: function(groupId, subgroupId, userId, type) {
                    var ref = firebaseService.getRefMain();

                    //if type is true then increment in subgroup member-count, else decrement in subgroup member-count

                    if (type) {
                        //checking if user id already a member of this subgroup then don't increment member-count
                        ref.child('subgroup-members').child(groupId).child(subgroupId).child(userId).once('value', function(snapshot){
                            if(snapshot.val()){
                                if(snapshot.val()['membership-type'] !== 2 && snapshot.val()['membership-type'] !== 3){
                                    ref.child('subgroups').child(groupId).child(subgroupId).once('value', function(subgroup){
                                        var count = subgroup.val()['members-count'];
                                        ref.child('subgroups').child(groupId).child(subgroupId).child('members-count').set(count+1, function(){
                                            // console.log('count updated');
                                        });
                                    });
                                }
                            } else {
                                ref.child('subgroups').child(groupId).child(subgroupId).once('value', function(subgroup){
                                    var count = subgroup.val()['members-count'];
                                    ref.child('subgroups').child(groupId).child(subgroupId).child('members-count').set(count+1, function(){
                                        // console.log('count updated');
                                    });
                                });
                            }
                        }); //ref.child('subgroup-members')
                    } else {
                        //checking if user id already a member of this subgroup then decrement member-count
                        ref.child('subgroup-members').child(groupId).child(subgroupId).child(userId).once('value', function(snapshot){
                            if(snapshot.val()){
                                if(snapshot.val()['membership-type'] === 2 || snapshot.val()['membership-type'] === 3) {
                                    ref.child('subgroups').child(groupId).child(subgroupId).once('value', function(subgroup){
                                        var count = subgroup.val()['members-count'];
                                        ref.child('subgroups').child(groupId).child(subgroupId).child('members-count').set(count-1, function(){
                                            // console.log('count updated');
                                        });
                                    });
                                }
                            } //if snapshot
                        }); //ref.child('subgroup-members')
                    } // else
                } // subgroupMemberUpdate
            }; // return
        } // factory
    ]);
