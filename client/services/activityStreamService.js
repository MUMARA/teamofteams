/**
 * Created by Usuf on 23/Feb/16.
 */
(function(){

"use strict";

angular.module('core').factory('activityStreamService', ['$firebaseObject', 'firebaseService', 'userService', '$rootScope', activityStreamService]);
function activityStreamService($firebaseObject, firebaseService, userService, $rootScope) {
    var user = '';
    var userID = '';
    var actor = '';
    var currentUserActivities = [];
    var currentUserSubGroups = [];
    var currentUserSubGroupsMembers = [];
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
         getSubGroupsOfCurrentUsers ()

    } //init

   //for activity step1
   function getGroupsOfCurrentUser(){
      firebaseService.getRefUserGroupMemberships().child(userID).on('child_added', function(group){
         getActivityOfCurrentUserByGroup(group.key());
      });
   }
   //for activity step2
   function getActivityOfCurrentUserByGroup (groupID) {
      firebaseService.getRefGroupsActivityStreams().child(groupID).orderByChild('object/id').equalTo(userID).on("child_added", function(snapshot) {
         console.log('11111111111111111111', snapshot.key(), snapshot.val());
         if(snapshot && snapshot.val()) {
            currentUserActivities.push({groupID: groupID, displayMessage: snapshot.val().displayName});
         }
      });
   }

   //for getting subgroups of current user
   function getSubGroupsOfCurrentUsers () {
      firebaseService.getRefUserSubGroupMemberships().child(userID).on('child_added', function(snapshot){
         for(var subgroup in snapshot.val()){
            currentUserSubGroups.push({groupID: snapshot.key(), subgroupID: subgroup}); //subgroup array
            getSubGroupsMembersOfCurrentUsers (snapshot.key(), subgroup);
         }
      });
   }

   //for getting subgroups members of current user
   function getSubGroupsMembersOfCurrentUsers (groupID, subgroupID) {
      firebaseService.getRefSubGroupMembers().child(groupID).child(subgroupID).on('child_added', function(snapshot){
         if(currentUserSubGroupsMembers.length === 0){
            currentUserSubGroupsMembers.push({groupID: groupID, subgroupID: subgroupID, member: snapshot.key()});
         } else {
            for(var i = 0; i < currentUserSubGroupsMembers.length; i++){
               if(currentUserSubGroupsMembers[i].groupID === groupID && currentUserSubGroupsMembers[i].subgroupID == subgroupID && currentUserSubGroupsMembers[i].member == snapshot.key()){
                  break;
               } else {
                  if (i == currentUserSubGroupsMembers.length-1) {
                     currentUserSubGroupsMembers.push({groupID: groupID, subgroupID: subgroupID, member: snapshot.key()});
                  } //for else if
               } //for else
            } //for
         } //else
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


   function activityStream(type, targetinfo, area, groupID, memberUserID) {

      var object = {};  //object: affected area for user.... (represent notification)

      if (memberUserID) {  // incase of group ceration or group edit
         firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
            object = {
               "type": type,
               "id": memberUserID, //an index should be set on this
               "email": res.user.email,
               "displayName": res.user.firstName + " " + res.user.lastName
            };
            //now calling function for save to firebase....
            saveToFirebase(type, targetinfo, area, groupID, memberUserID, object);
         });
      } else {
         object = {
            "type": type,
            "id": targetinfo.id, //an index should be set on this
            "url": targetinfo.id,
            "displayName": targetinfo.title,
            "seen": false
         };
         //now calling function for save to firebase....
         saveToFirebase(type, targetinfo, area, groupID, memberUserID, object);
      }
   } //activityStream


   function saveToFirebase(type, targetinfo, area, groupID, memberUserID, object){
      // console.log('saveToFirebase', object);
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
                  'membersettings': {  //reject == ignore
                              'group-ignore-member': actor.displayName +" rejected " + object.displayName +"'s membership request for " + target.displayName,
                              'group-approve-member': actor.displayName +" approved " + object.displayName + " as a member in "+ target.displayName,
                              'user-membership-from-admin-to-member': actor.displayName +" changed " + object.displayName +"'s membership from \"admin\" to \"member\" for " + target.displayName,
                              'user-membership-from-member-to-admin': actor.displayName +" changed " + object.displayName +"'s membership from \"member\" to \"admin\" for " + target.displayName,
                              'user-membership-block': actor.displayName +" changed " + object.displayName +"'s membership to \"suspend\" for " + target.displayName,
                              'user-membership-unblock': actor.displayName +" changed " + object.displayName +"'s membership from \"suspend\" to \"member\" for " + target.displayName,
                              'group-member-removed': actor.displayName +" removed " + object.displayName +" from " + target.displayName,
                           }, //membersettings
                  'group-created': actor.displayName +" created group " + target.displayName,
                  'group-updated': actor.displayName +" udpated group " + target.displayName,
                  'group-join': actor.displayName +" sent team join request of " + target.displayName,
               }, //'type: group'
         'subgroup': {
                  'subgroup-created': actor.displayName +" created subgroup " + target.displayName,
                  'subgroup-updated': actor.displayName +" updated subgroup " + target.displayName,
                  'subgroup-member-assigned': actor.displayName +" assigned " + object.displayName + " as a member of " + target.displayName,
                  'subgroup-admin-assigned': actor.displayName +" assigned " + object.displayName +" as a admin of " + target.displayName,
                  'subgroup-join': actor.displayName +" sent team of teams join request of " + target.displayName,
                  }, //subgroup
         'policy': {
                  'policy-created': actor.displayName +" created policy " + target.displayName,
                  'policy-updated': actor.displayName +" updated policy " + target.displayName,
                  'policy-assigned-team': actor.displayName +" assigned policy " + target.displayName + " to " + object.displayName,
                  }, //policy
         'progressReport': {
                  'progressReport-created': actor.displayName + " Created progress report against " + target.displayName,
                  'progressReport-updated': actor.displayName + " Updated progress report in " + target.displayName,
                  } //progressReport
      }; //displayNameObject


      var displayMessage = '';

      if(area.action){
       displayMessage = displayNameObject[type][area.type][area.action];
       console.log('displayNameObject[type][area.type][area.action]', displayNameObject[type][area.type][area.action])
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
             target: target
      };

      // console.log('activity', activity);

      var ref = firebaseService.getRefMain();
      var pushObj = ref.child('group-activity-streams').child(groupID).push();
      var activityPushID = pushObj.key();

      //Sets a priority for the data at this Firebase location.
      // pushObj.setPriority(0 - Date.now());

      var multipath = {};

      if(groupID){
         multipath['group-activity-streams/'+groupID+'/'+activityPushID] = activity;
      }

      multipath['user-activity-streams/'+actor.id+'/'+activityPushID] = {
                displayName: displayMessage,
                seen : false,
                published: firebaseTimeStamp,
                verb: (area.action) ? area.action : area.type
      };


      firebaseService.getRefMain().update(multipath, function(err){
         if (err) { console.log('activityError', err); }
      });



   }




























   //  function groupActivityStream (type, requestFor, group, user, memberUserID) {
   //    var deferred = $q.defer();
   //    var refGroupActivities = firebaseService.getRefGroupsActivityStreams().child(group.groupID);
   //
   //    var target = {
   //       "type": "group",         //we are using group activity streams
   //       "id": group.groupID,
   //       "url": group.groupID,
   //       "displayName": group.title
   //    };
   //
   //    //type:
   //    //for membership in user-settings we will use memberSettings,
   //    //on team (create/edit) we will use TeamSettings
   //    if(type === 'memberSettings') {
   //       firebaseService.asyncCheckIfUserExists(memberUserID).then(function(res) {
   //          var object = {
   //             "type": "user",
   //             "id": memberUserID, //an index should be set on this
   //             "email": res.user.email,
   //             "displayName": res.user.firstName + " " + res.user.lastName
   //          };
   //          //create an appropriate display message.
   //          var displayName;
   //          if (requestFor === "approve") {
   //              displayName = actor.displayName + " approved " + object.displayName +
   //                 " as a member in " + group.title + "."
   //          } else {
   //              displayName = actor.displayName + " rejected " + object.displayName +
   //                 "'s membership request for " + group.title + "group."
   //          }
   //
   //          var activity = {
   //             language: "en",
   //             verb: requestFor === "approve" ? "group-approve-member" : "group-reject-member",
   //             published: firebaseTimeStamp,
   //             displayName: displayName,
   //             actor: actor,
   //             object: object,
   //             target: target
   //          };
   //
   //          var newActivityRef = refGroupActivities.push();
   //          newActivityRef.set(activity, function(error) {
   //             if (error) {
   //                 deferred.reject();
   //             } else {
   //
   //                var activityID = newActivityRef.key();
   //                var activityEntryRef = refGroupActivities.child(activityID);
   //                activityEntryRef.once("value", function(snapshot) {
   //                   var timestamp = snapshot.val().published;
   //                   newActivityRef.setPriority(0 - timestamp, function(error2) {
   //                      if (error2) {
   //                         deferred.reject();
   //                      } else {
   //                         deferred.resolve(displayName);
   //                      }
   //                   });
   //                });
   //
   //             } //else
   //          }); //newActivityRef.set
   //       }); //firebaseService.asyncCheckIfUserExists
   //    }
   //    return deferred.promise;
   // } //groupActivityStream
   //


   // function currentUserActivity() {
   //    var deffer = $q.deffer();
   //    var refGroupActivitieStream = firebaseService.groupsActivityStreams().child('group002').child(userID);
   //    refGroupActivitieStream.on('child_added',function(snapshot){
   //       console.log(snapshot.val());
   //    });
   //    return deffer.promise;
   // }

    return {
      init : init,
      getActivities: getActivities,
      activityStream: activityStream
    };

} //activityStreamService
})();
