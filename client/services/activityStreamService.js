/**
 * Created by Usuf on 23/Feb/16.
 */
(function() {

    "use strict";

    angular.module('core').factory('activityStreamService', ["$http", "appConfig", '$firebaseObject', 'firebaseService', 'userService', '$rootScope', activityStreamService]);

    function activityStreamService($http, appConfig, $firebaseObject, firebaseService, userService, $rootScope) {
        var user = '';
        var userID = '';
        var actor = '';
        var currentUserActivities = [];
        var currentUserSubGroups = [];
        var currentUserSubGroupsMembers = {};
        var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;

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

            //getting curent use groups and then getting its notification/activities
            getGroupsOfCurrentUser();

            //getting current user subgroup names
            getSubGroupsOfCurrentUsers();

            //getting current user subgroup members
            //getSubGroupsMembersOfCurrentUsers ();

        } //init

        //for activity step1
        function getGroupsOfCurrentUser() {
            firebaseService.getRefUserGroupMemberships().child(userID).on('child_added', function(group) {
                if (group && group.key()) {

                    //getting activities by groupID
                    getActivityOfCurrentUserByGroup(group.key());

                }
            });
        }
        //for activity group
        function getActivityOfCurrentUserByGroup(groupID) {
            //getting activity streams from firebase node: group-activity-streams
            firebaseService.getRefGroupsActivityStreams().child(groupID).orderByChild('published').on("child_added", function(snapshot) {
                if (snapshot && snapshot.val()) {
                    currentUserActivities.push({
                        groupID: groupID,
                        displayMessage: snapshot.val().displayName,
                        activityID: snapshot.key(),
                        published: snapshot.val().published
                    });
                }
            });
        }
        //for activity of subgroup
        function getActivityOfCurrentUserBySubGroup(groupID, subgroupID) {
            //getting activity streams from firebase node: group-activity-streams
            firebaseService.getRefSubGroupsActivityStreams().child(groupID).child(subgroupID).orderByChild('published').on("child_added", function(snapshot) {
                if (snapshot && snapshot.val()) {
                    currentUserActivities.push({
                        groupID: groupID,
                        subgroupID: subgroupID,
                        displayMessage: snapshot.val().displayName,
                        activityID: snapshot.key(),
                        published: snapshot.val().published
                    });
                }
            });
        }


        //for getting subgroups of current user
        function getSubGroupsOfCurrentUsers() {
            firebaseService.getRefUserSubGroupMemberships().child(userID).on('child_added', function(snapshot) {
                for (var subgroup in snapshot.val()) {
                    console.log('snapshot_',snapshot.val()[subgroup]);
                    currentUserSubGroups.push({
                        groupID: snapshot.key(),
                        subgroupID: subgroup
                    }); //subgroup array

                    //getting activity by subgroup
                    getActivityOfCurrentUserBySubGroup(snapshot.key(), subgroup);

                    //getting subgroup members
                    getSubGroupsMembersOfCurrentUsers(snapshot.key(), subgroup);
                }
            });
        }

        //for getting subgroups members of current user
        function getSubGroupsMembersOfCurrentUsers(groupID, subgroupID) {
            firebaseService.getRefSubGroupMembers().child(groupID).child(subgroupID).on('child_added', function(snapshot) {
                currentUserSubGroupsMembers[groupID][subgroupID] = snapshot.key();
            }); //firebaseService.getRefSubGroupMembers
        } //getSubGroupsMembersOfCurrentUsers



        function getActivities() {
            return currentUserActivities;
        }

        function getSubgroupNames() {
            return currentUserSubGroups;
        }

        function getSubgroupMembers() {
            return currentUserSubGroupsMembers;
        }

        // type = group, subgroup, policy, progressReport, firepad, chat
        //targetinfo = {id: '', url: '', title: '', type: '' }
        //area = {type: '', action: ''}
        //memberUserID = if object is user for notification

        function activityHasSeen(){
            var multipath = {};
            currentUserActivities.forEach(function(val, index){
                if (val.seen === false) {
                    multipath['/user-activity-streams/'+userID+'/'+val.activityID+'/seen'] = true;
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
                    firebaseService.asyncCheckIfUserExists(memberID).then(function(res) {
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
                if(activityGroupOrSubGroupID.indexOf('/') > -1) {
                    multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;
                } else {
                    multipath['group-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;
                }

            } else if (type === 'progressReport') {
                //progress report belongs to subgroup then activityGroupOrSubGroupID will be subgroupID
                multipath['subgroup-activity-streams/' + activityGroupOrSubGroupID + '/' + activityPushID] = activity;

            }

            // console.log('activityGroupOrSubGroupID', activityGroupOrSubGroupID);
            // console.log('type', type);
            // console.log('activity_', activity);

            firebaseService.getRefMain().update(multipath, function(err) {
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
            activityStream: activityStream
        };
    } //activityStreamService
})();
