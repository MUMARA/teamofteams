/**
 * Created by Usuf on 23/Feb/16.
 */
(function(){

"use strict";

angular.module('core').factory('activityStreamService', ['$firebaseObject', 'firebaseService', 'userService', activityStreamService]);
function activityStreamService($firebaseObject, firebaseService, userService) {
    var user = '';
    var userID = '';
    var actor = '';
    var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;

    function init() {
        user = userService.getCurrentUser();
        userID = user.userID;
        actor = {
                   "type": "user",
                   "id": user.userID, //this is the userID, and an index should be set on this
                   "email": user.email,
                   "displayName": user.firstName + " " + user.lastName
               };
      userGroupsmembership(userID)
    } //init
    init();
    function userGroupsmembership(userID) {
        user = firebaseService.getRefUserGroupMemberships().child(userID).on('child_added',function(snapshot){

           tepActivityArray(snapshot.key());

           //console.log(snapshot.val(),snapshot.key(), 'okjkhjkhdjkdhdjkhdjkdhjkdhdjkhdjkdhdjkhdjkdhjd');
        });

    }

    function tepActivityArray(groupID) {
      firebaseService.getRefGroupsActivityStreams().child(groupID).child("object/id/usuf53").once('value',function(snapshot){
         if(snapshot && snapshot.val()) {
            console.log(snapshot.val(),snapshot.key(), 'okjkhjkhdjkdhdjkhdjkdhjkdhdjkhdjkdhdjkhdjkdhjd');
         }

      });



   }
     //actor; current user is our actor

    //type; group, subgroup, policy, profile, chat, progressReport

    //targetinfo;
    //  if (type group)     { id: targetinfo.groupID, url: targetinfo.groupID, title: targetinfo.groupTitle}
    //  if (type subgroup)  { id: targetinfo.subgroupID, url: targetinfo.subgroupID, title: targetinfo.subgroupTitle}
    //  if (type policy)    { id: targetinfo.policyID, url: targetinfo.policyID, title: targetinfo.policyTitle}

    //area;
    //  if (type group):    membersettings, group-create, group-update
    //  if (type subgroup): subgroup-create, subgroup-update, subgroup-add-member, subgroup-add-admin
    //  if (type policy):   policy-create, policy-update, policy-assign-to-team

    //verb;
    //  if(type group     & area = group-create):           'group-creation'
    //  if(type group     & area = group-update):           'group-update'
    //  if(type group     & area = membersettings):         'group-reject-member' || 'group-approve-member' || 'user-membership-change' || 'group-member-removed'
    //  if(type subgroup  & area = subgroup-create):        'subgroup-creation'
    //  if(type subgroup  & area = subgroup-update):        'subgroup-update'
    //  if(type subgroup  & area = subgroup-add-member):    'user-membership-change'
    //  if(type subgroup  & area = subgroup-add-admin):     'user-membership-change'
    //  if(type policy    & area = policy-create):          'policy-creation'
    //  if(type policy    & area = policy-update):          'policy-update'
    //  if(type policy    & area = policy-assigned):        'policy-assigned'

    //we have decide to create user-activity-streams
    /* node will be user-activity-streams -> userid -> {
               userName: 'usuf qutubuddin'
               email: 'usuf53@gmail.com'
               userId: 'usuf53'
               displayMessage: 'Usuf Qutubuddin approved Usuf Qutubuddin as a member in Team of teams 01."',
               seen : false
      }
    */

    //object: affected area for user.... (represent notification)




    //multi path node...
    var multipath = {};
    multipath['group-activity-streams/'+groupid+ '/actor'] = actor;
    multipath['group-activity-streams/'+groupid+ '/displayName'] = '';
    multipath['group-activity-streams/'+groupid+ '/language'] = "en";
    multipath['group-activity-streams/'+groupid+ '/object'] = {
      displayName: "usuf53",
      email: 'usuf53@gmail.com',
      id: 'usuf53',
      type:  'user'
   };
   multipath['group-activity-streams/'+groupid+ '/published'] = firebaseTimeStamp;
   multipath['group-activity-streams/'+groupid+ '/target'] = {
      displayName: "usuf53",
      url: 'tot01',
      id: 'usuf53',
      type:  'user'
   };
   multipath['group-activity-streams/'+groupid+ '/verb'] = "group-approve-member";
   multipath['user-activity-streams/'+userid] = {
             userName: 'usuf qutubuddin',
             email: 'usuf53@gmail.com',
             userId: 'usuf53',
             displayMessage: 'Usuf Qutubuddin approved Usuf Qutubuddin as a member in Team of teams 01."',
             seen : false,
             published: firebaseTimeStamp
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



   function currentUserActivity() {
      var deffer = $q.deffer();
      var refGroupActivitieStream = firebaseService.groupsActivityStreams().child('group002').child(userID);
      refGroupActivitieStream.on('child_added',function(snapshot){
         console.log(snapshot.val());
      });
      return deffer.promise;
   }

    return {
      init : init
    };

} //activityStreamService
})();
