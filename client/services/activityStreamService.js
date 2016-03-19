/**
 * Created by Usuf on 23/Feb/16.
 */
(function () {

    "use strict";

    angular.module('core').factory('activityStreamService', ['$timeout', '$firebaseObject', 'firebaseService', 'userService', '$rootScope', activityStreamService]);

    function activityStreamService($timeout, $firebaseObject, firebaseService, userService, $rootScope) {
        var user = '';
        var userID = '';
        var actor = '';
        var currentUserActivities = [];
        var currentUserGroupNamesAndMemberShips = {};
        var currentUserSubGroupNamesAndMemberShips = {};
        var currentUserSubGroupsMembersAndMemberShips = {};
        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;
        var lastSeenTimeStamp = null;

        //object for those who will be notify....

        function init() {
            user = userService.getCurrentUser();
            userID = user.userID;
            actor = {
                "type": "user",
                "id": user.userID, //this is the userID, and an index should be set on this
                "email": user.email,
                "displayName": user.firstName + " " + user.lastName,
                'profile-image': $rootScope.userImg || ''
            };

            //getting curent user groups and then getting its notification/activities but first we get timestamp of seen activities to get records of activities
            getLastSeenActivityTimeStamp();    
            //getGroupsOfCurrentUser();

            //getting current user subgroup names
            getSubGroupsOfCurrentUsers();

            //getting current user subgroup members
            //getSubGroupsMembersOfCurrentUsers ();

        } //init

        //getting last seen activity from activities-seen-by-user
        function getLastSeenActivityTimeStamp() {
            var onchnaged = 0;      //because firebaretimestamp run twice thats y use this strategy....
            var once = 0;
            firebaseService.getRefActivitySeen().child(userID).on('value', function(snapshot) {

                lastSeenTimeStamp = (snapshot.val() && snapshot.val().timestamp) ? snapshot.val().timestamp : ''  ;

                if (once === 0 && onchnaged === 0) {
                    // console.log('activitiess', 'once');
                    getGroupsOfCurrentUser(lastSeenTimeStamp);
                    once++;
                }

                onchnaged++;

                if (once !== 0 && onchnaged === 2) {
                    // console.log('activitiess', 'on update');
                    LastChildAddedClosed();
                    $timeout(function() {
                        getGroupsOfCurrentUser(lastSeenTimeStamp);
                    }, 1000);

                    onchnaged = 0;
                }
                
                //getGroupsOfCurrentUser(snapshot.val());
            });

            // firebaseService.getRefActivitySeen().child(userID).on('child_changed', function(snapshot) {
            //     //console.log(snapshot.key(), snapshot.val());
            //     getGroupsOfCurrentUser(snapshot.val());
            // });
        }

        function LastChildAddedClosed() {
            for (var group in currentUserSubGroupNamesAndMemberShips) {
                // console.log('watch group', group);
                firebaseService.getRefGroupsActivityStreams().child(group).off("child_added");
                for (var subgroup in currentUserSubGroupNamesAndMemberShips[group]) {
                    firebaseService.getRefSubGroupsActivityStreams().child(group).off('child_added');
                    firebaseService.getRefSubGroupsActivityStreams().child(group).child(subgroup).off("child_added");
                    // console.log('watch subgroup', subgroup);
                }
            }
                
        }        

        

        //for activity step1
        function getGroupsOfCurrentUser(date) {
            //child_added on user-group-memberships
            firebaseService.getRefUserGroupMemberships().child(userID).on('child_added', function (group) {
                if (group && group.key()) {
                    //create a object of group name and membership-type
                    currentUserGroupNamesAndMemberShips[group.key()] = group.val()['membership-type'];

                    $timeout(function() {
                        //getting activities by groupID
                        getActivityOfCurrentUserByGroup(group.key(), date);

                        //getting activity by subgroup
                        getActivityOfCurrentUserBySubGroup(group.key(), date);
                    }, 1000);
                                        
                }
            });
            
            //child_changed on user-group-memberships
            firebaseService.getRefUserGroupMemberships().child(userID).on('child_changed', function (group) {
                // console.log('group child_changed', group.val());
                //change membership in currentUserGroupNamesAndMemberShips
                currentUserGroupNamesAndMemberShips[group.key()] = group.val()['membership-type'];
                
                // delete all activity from user activity array of group.key()
                // if (group.val()['membership-type'] == '-1') { 
                //     currentUserActivities.forEach(function (val, index) { 
                //         if (val.groupID == group.key()) { 
                //             //remove all notifications if user blocked
                //             currentUserActivities.splice(val, 1);
                //         } 
                //     })
                // }
                
            });
            
            //child_removed on user-group-memberships
            firebaseService.getRefUserGroupMemberships().child(userID).on('child_removed', function (group) {
                // console.log('group child_removed', group.val());
                //delete group from currentUserGroupNamesAndMemberShips
                delete currentUserGroupNamesAndMemberShips[group.key()];
                
                // delete all activity from user activity array of group.key()  (remove activity related from group)
                // currentUserActivities.forEach(function (val, index) {
                //     if (val.groupID == group.key()) {
                //         //remove all notifications if user blocked
                //         currentUserActivities.splice(val, 1);
                //     }
                // });
            });

        }
        //for activity group
        function getActivityOfCurrentUserByGroup(groupID, date) {
            //getting activity streams from firebase node: group-activity-streams.startAt(startDate.setHours(0, 0, 0, 0))
            if (date) {
                firebaseService.getRefGroupsActivityStreams().child(groupID)
                    .orderByChild('published').startAt(date).on("child_added", function(snapshot) {
                    if (snapshot && snapshot.val()) {
                        currentUserActivities.push({
                            groupID: groupID,
                            displayMessage: snapshot.val().displayName,
                            activityID: snapshot.key(),
                            published: snapshot.val().published,
                            // seen: false
                        });
                    }
                });
            } else {
                firebaseService.getRefGroupsActivityStreams().child(groupID)
                    .orderByChild('published').on("child_added", function(snapshot) {
                    if (snapshot && snapshot.val()) {
                        currentUserActivities.push({
                            groupID: groupID,
                            displayMessage: snapshot.val().displayName,
                            activityID: snapshot.key(),
                            published: snapshot.val().published,
                            // seen: false
                        });
                    }
                });
            }
        }

        //for getting subgroups of current user
        function getSubGroupsOfCurrentUsers() {
            firebaseService.getRefUserSubGroupMemberships().child(userID).on('child_added', function (snapshot) {
                for (var subgroup in snapshot.val()) {
                    if (currentUserSubGroupNamesAndMemberShips && currentUserSubGroupNamesAndMemberShips[snapshot.key()]) {
                        currentUserSubGroupNamesAndMemberShips[snapshot.key()][subgroup] = snapshot.val()[subgroup]['membership-type'];
                    } else {
                        currentUserSubGroupNamesAndMemberShips[snapshot.key()] = {};
                        currentUserSubGroupNamesAndMemberShips[snapshot.key()][subgroup] = snapshot.val()[subgroup]['membership-type'];
                    }

                    //getting subgroup members
                    getSubGroupsMembersOfCurrentUsers(snapshot.key(), subgroup);
                }
            });


            firebaseService.getRefUserSubGroupMemberships().child(userID).on('child_removed', function (snapshot) {
                // console.log('subgroup child_removed', snapshot.val());
                
                for (var subgroup in snapshot.val()) {
                    //delete membership type from subgroup object     
                    delete currentUserSubGroupNamesAndMemberShips[snapshot.key()][subgroup];
                    // // delete all activity from user activity array of subgroup (remove activity related from subgroup)
                    // currentUserActivities.forEach(function (val, index) {
                    //     if (val.subgroupID == subgroup) {
                    //         //remove all notifications if user blocked
                    //         currentUserActivities.splice(val, 1);
                    //     }
                    // });    
                }
            });
        }
        
        
        
        //for activity of subgroup
        function getActivityOfCurrentUserBySubGroup(groupID, date) {
            //getting activity streams from firebase node: subgroup-activity-streams
            if (date) {
                firebaseService.getRefSubGroupsActivityStreams().child(groupID).on('child_added', function(subgroup) {
                    if (subgroup && subgroup.val()) {
                        firebaseService.getRefSubGroupsActivityStreams().child(groupID).child(subgroup.key())
                            .orderByChild('published').startAt(date).on("child_added", function(snapshot) {
                            if (snapshot && snapshot.val()) {
                                currentUserActivities.push({
                                    groupID: groupID,
                                    subgroupID: subgroup.key(),
                                    displayMessage: snapshot.val().displayName,
                                    activityID: snapshot.key(),
                                    published: snapshot.val().published,
                                    // seen: false
                                });
                            }
                        });                
                    }
                });
            } else {
                firebaseService.getRefSubGroupsActivityStreams().child(groupID).on('child_added', function(subgroup) {
                    if (subgroup && subgroup.val()) {
                        firebaseService.getRefSubGroupsActivityStreams().child(groupID).child(subgroup.key())
                            .orderByChild('published').on("child_added", function(snapshot) {
                            if (snapshot && snapshot.val()) {
                                currentUserActivities.push({
                                    groupID: groupID,
                                    subgroupID: subgroup.key(),
                                    displayMessage: snapshot.val().displayName,
                                    activityID: snapshot.key(),
                                    published: snapshot.val().published,
                                    // seen: false
                                });
                            }
                        });                
                    }
                });
            }
        }

        //for getting subgroups members of current user
        function getSubGroupsMembersOfCurrentUsers(groupID, subgroupID) {
            //getting members by child_added
            firebaseService.getRefSubGroupMembers().child(groupID).child(subgroupID).on('child_added', function (snapshot) {

                if (currentUserSubGroupsMembersAndMemberShips && currentUserSubGroupsMembersAndMemberShips[groupID]) {

                    if (currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID]) {
                        currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID].push({ 'userID': snapshot.key(), 'membership-type': snapshot.val()['membership-type'] });
                    } else {
                        currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID] = [];
                        currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID].push({ 'userID': snapshot.key(), 'membership-type': snapshot.val()['membership-type'] });
                    }

                } else {
                    currentUserSubGroupsMembersAndMemberShips[groupID] = {};
                    currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID] = [];
                    currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID].push({ 'userID': snapshot.key(), 'membership-type': snapshot.val()['membership-type'] })
                }               
                //currentUserSubGroupsMembers[groupID][subgroupID] = snapshot.key();
            }); //firebaseService.getRefSubGroupMembers
            
            //remove subgroup when child_removed from subgroup
            firebaseService.getRefSubGroupMembers().child(groupID).child(subgroupID).on('child_removed', function (snapshot) {
                // console.log('member child_removed: ', snapshot.key(), snapshot.val());
                //when member remove from subgroup then update array of  currentUserSubGroupsMembersAndMemberShips
                delete currentUserSubGroupsMembersAndMemberShips[groupID][subgroupID];
    
            });
        } //getSubGroupsMembersOfCurrentUsers



        function getActivities() {
            return currentUserActivities;
        }

        function getSubgroupNamesAndMemberships() {
            return currentUserSubGroupNamesAndMemberShips;
        } //getSubgroupNamesAndMemberships

        function getSubgroupMembersAndMemberships() {
            return currentUserSubGroupsMembersAndMemberShips;
        }

        // type = group, subgroup, policy, progressReport, firepad, chat
        //targetinfo = {id: '', url: '', title: '', type: '' }
        //area = {type: '', action: ''}
        //memberUserID = if object is user for notification

        // activities - seen - by - user
            // userid
                //timesapan: 
        function activityHasSeen() {
            firebaseService.getRefActivitySeen().child(userID).update({ timestamp: firebaseTimeStamp }, function(err) {
                if (!err) {
                    currentUserActivities.splice(0, currentUserActivities.length);
                }
            });
        }

        //calling from services or controller (public)
        function activityStream(type, targetinfo, area, activityGroupOrSubGroupID, memberID, object) {
            //function activityStream(type, targetinfo, area, activityGroupOrSubGroupID, memberUserID) {
            var obj = {}; //object: affected area for user.... (represent notification)

            if (object) {

                saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, object);

            } else {

                if (memberID) { // incase of group ceration or group edit
                    firebaseService.asyncCheckIfUserExists(memberID).then(function (res) {
                        obj = {
                            "type": type,
                            "id": memberID, //an index should be set on this
                            "email": res.user.email,
                            "displayName": res.user.firstName + " " + res.user.lastName,
                        };
                        //now calling function for save to firebase....
                        saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, obj);
                    });
                } else {
                    obj = {
                        "type": type,
                        "id": targetinfo.id, //an index should be set on this
                        "url": targetinfo.id,
                        "displayName": targetinfo.title,
                    };
                    //now calling function for save to firebase....
                    saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, obj);
                }

            }


        } //activityStream
        //calling from here  (private)
        function saveToFirebase(type, targetinfo, area, activityGroupOrSubGroupID, object) {
            //function saveToFirebase(type, targetinfo, area, groupID, memberUserID, object) {
            // ## target ##
            //if related group target is group, if related subgroup target is subgroup, if related policy target is policy, if related progressReport target is progressReport
            var target = {
                "type": type,
                "id": targetinfo.id,
                "url": targetinfo.url,
                "displayName": targetinfo.title
            };

            var displayNameObject = {
                'group': {
                    'membersettings': { //reject == ignore
                        'group-ignore-member': actor.displayName + " rejected " + object.displayName + "'s membership request for " + target.displayName,
                        'group-approve-member': actor.displayName + " approved " + object.displayName + " as a member in " + target.displayName,
                        'user-membership-from-admin-to-member': actor.displayName + " changed " + object.displayName + "'s membership from \"admin\" to \"member\" for " + target.displayName,
                        'user-membership-from-member-to-admin': actor.displayName + " changed " + object.displayName + "'s membership from \"member\" to \"admin\" for " + target.displayName,
                        'user-membership-block': actor.displayName + " changed " + object.displayName + "'s membership to \"suspend\" for " + target.displayName,
                        'user-membership-unblock': actor.displayName + " changed " + object.displayName + "'s membership from \"suspend\" to \"member\" for " + target.displayName,
                        'group-member-removed': actor.displayName + " removed " + object.displayName + " from " + target.displayName,
                    }, //membersettings
                    'group-created': actor.displayName + " created group " + target.displayName,
                    'group-updated': actor.displayName + " udpated group " + target.displayName,
                    'group-join': actor.displayName + " sent team join request of " + target.displayName,
                }, //'type: group'
                'subgroup': {
                    'subgroup-created': actor.displayName + " created subgroup " + target.displayName,
                    'subgroup-updated': actor.displayName + " updated subgroup " + target.displayName,
                    'subgroup-member-assigned': actor.displayName + " assigned " + object.displayName + " as a member of " + target.displayName,
                    'subgroup-admin-assigned': actor.displayName + " assigned " + object.displayName + " as a admin of " + target.displayName,
                    'subgroup-member-removed': actor.displayName + " removed as member " + object.displayName + " from " + target.displayName,
                    'subgroup-admin-removed': actor.displayName + " removed as admin " + object.displayName + " from " + target.displayName,
                    'subgroup-join': actor.displayName + " sent team of teams join request of " + target.displayName,
                    'subgroup-checkin': actor.displayName + " checkin " + target.displayName,
                    'subgroup-checkout': actor.displayName + " checkout from " + target.displayName,

                }, //subgroup
                'policy': {
                    'policy-created': actor.displayName + " created policy " + target.displayName,
                    'policy-updated': actor.displayName + " updated policy " + target.displayName,
                    'policy-assigned-team': actor.displayName + " assigned policy " + target.displayName + " to " + object.displayName,
                }, //policy
                'progressReport': {
                    'progressReport-created': actor.displayName + " Created progress report against " + target.displayName,
                    'progressReport-updated': actor.displayName + " Updated progress report in " + target.displayName,
                } //progressReport
            }; //displayNameObject


            var displayMessage = '';

            if (area.action) {
                displayMessage = displayNameObject[type][area.type][area.action];
            } else {
                displayMessage = displayNameObject[type][area.type];
            }

            var activity = {
                language: "en",
                verb: (area.action) ? area.action : area.type,
                published: firebaseTimeStamp,
                displayName: displayMessage,
                actor: actor,
                object: object,
                target: target,
                //seen: false
            };

            var ref = firebaseService.getRefMain();
            var pushObj = ref.child('group-activity-streams/' + activityGroupOrSubGroupID).push();
            var activityPushID = pushObj.key();

            var multipath = {};

            if (type === 'group') {
                //firebase node: group-activity-streams
                if (area.type === 'group-created' || area.type === 'group-updated') {
                    delete activity.target;
                    delete activity.object;
                } else if (area.type === 'group-join' || area.type === 'membersettings') {
                    delete activity.target;
                }

                multipath['group-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;

            } else if (type === 'subgroup') {
                //firebase node: subgroup-activity-streams
                if (area.type === 'subgroup-created' || area.type === 'subgroup-updated') {
                    delete activity.target;
                    delete activity.object;
                } else if (area.type === 'subgroup-join') {
                    delete activity.target;
                }

                multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;

            } else if (type === 'policy') {
                //firbase node:
                //if pass groupid in 'activityGroupOrSubGroupID' then save into firebase group-activity-streams
                //else if pass subgroupid in 'activityGroupOrSubGroupID' then save into firebase subgroup-activity-streams
                //checking if activityGroupOrSubGroupID contains / then location is subgroup-activity else group-activity
                if (activityGroupOrSubGroupID.indexOf('/') > -1) {
                    multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;
                } else {
                    multipath['group-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;
                }
            } else if (type === 'progressReport') {
                //progress report belongs to subgroup then activityGroupOrSubGroupID will be subgroupID
                multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;

            }

            //  console.log('activity_ activityGroupOrSubGroupID: ', activityGroupOrSubGroupID);
            //  console.log('activity_  type: ', type);
            //  console.log('activity_ : ', activity);

            firebaseService.getRefMain().update(multipath, function (err) {
                if (err) {
                    console.log('activityError', err);
                }
            });
        } //saveToFirebase

        // function currentUserActivity() {
        //    var deffer = $q.deffer();
        //    var refGroupActivitieStream = firebaseService.groupsActivityStreams().child('group002').child(userID);
        //    refGroupActivitieStream.on('child_added',function(snapshot){
        //       console.log(snapshot.val());
        //    });
        //    return deffer.promise;
        // }

        return {
            init: init,
            getActivities: getActivities,
            activityStream: activityStream,
            activityHasSeen: activityHasSeen
        };
    } //activityStreamService
})();
