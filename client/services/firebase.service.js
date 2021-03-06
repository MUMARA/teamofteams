/**
 * Created by ZiaKhan on 02/01/15.
 */

'use strict';

angular.module('core')
  .factory('firebaseService', ["$firebaseAuth", "appConfig", "$q", "$location",
    "$timeout", "messageService", "$firebaseObject", "userPresenceService",
    "userService",
    function($firebaseAuth, appConfig, $q, $location, $timeout,
      messageService, $firebaseObject, userPresenceService, userService) {

      var ref = new Firebase(appConfig.myFirebase);

      var currentAuthData = null;
      var refUsers = null;
      var refGroups = null;
      var refSubGroups = null;
      var refMicroGroups = null;
      var refUserGroupMemberships = null;
      var refUserSubGroupMemberships = null;
      var refUserMicroGroupMemberships = null;
      var groupsUserInvites = null;
      var groupMembershipRequests = null;
      var groupsMembershipRequestsByUser = null;
      var subgroupMembershipRequests = null;
      var subgroupMembershipRequestsByUser = null;
      var groupMembers = null;
      var subgroupMembers = null;
      var microgroupMembers = null;
      var groupsNames = null;
      var subgroupsNames = null;
      var microgroupsNames = null;
      var groupsActivityStreams = null;
      var subgroupsActivityStreams = null;
      var microgroupsActivityStreams = null;
      var groupCheckinCurrent = null;
      var groupCheckinRecords = null;
      var subgroupCheckinRecords = null;
      var groupLocsDefined = null;
      var flattenedGroups = null;
      var loggedUserRef = null;
      var policies = null;
      var userPolicies = null;
      var progressReport = null;
      var subgroupPolicies = null;
      var activitySeen = null;
      var questionBank = null;
      var userQuestionBanks = null;
      var questionBankMemberships = null;
      var questionBankNames = null;
      var quizNames = null;
      var userQuiz = null;
      var quiz = null;

      return {
        addUpdateHandler: function() {
          ref.onAuth(function(authData) {
            if (authData) {
              currentAuthData = authData;
              //console.info("User " + authData.uid + " is logged in with " + authData.provider);
            } else {
              //console.info("User is logged out");
              //delete $sessionStorage.loggedInUser;
              userService.removeCurrentUser();
              appConfig.firebaseAuth = false;
              messageService.showFailure(
                "User is logged out, Please login again.");
              //$location.path("/user/login");
            }
          });

        },
        getRefMain: function() {
          return ref;
        },
        getAuthData: function() {
          return ref.getAuth();
        },
        getRefUsers: function() {
          return refUsers;
        },
        getRefUserGroupMemberships: function() {
          return refUserGroupMemberships;
        },
        getRefUserSubGroupMemberships: function() {
          return refUserSubGroupMemberships;
        },
        getRefUserMicroGroupMemberships: function() {
          return refUserMicroGroupMemberships;
        },
        getRefGroupsUserInvites: function() {
          return groupsUserInvites;
        },
        getRefGroupMembershipRequests: function() {
          return groupMembershipRequests;
        },
        getRefGroupMembershipRequestsByUser: function() {
          return groupsMembershipRequestsByUser;
        },
        getRefSubgroupMembershipRequests: function() {
          return subgroupMembershipRequests;
        },
        getRefSubgroupMembershipRequestsByUser: function() {
          return subgroupMembershipRequestsByUser;
        },
        getRefGroupMembers: function() {
          return groupMembers;
        },
        getRefSubGroupMembers: function() {
          return subgroupMembers;
        },
        getRefMicroGroupMembers: function() {
          return microgroupMembers;
        },
        getRefGroupsNames: function() {
          return groupsNames;
        },
        getRefSubGroupsNames: function() {
          return subgroupsNames;
        },
        getRefMicroGroupsNames: function() {
          return microgroupsNames;
        },
        getRefGroupsActivityStreams: function() {
          return groupsActivityStreams;
        },
        getRefSubGroupsActivityStreams: function() {
          return subgroupsActivityStreams;
        },
        getRefMicroGroupsActivityStreams: function() {
          return microgroupsActivityStreams;
        },
        getRefGroups: function() {
          return refGroups;
        },
        getRefSubGroups: function() {
          return refSubGroups;
        },
        getRefMicroGroups: function() {
          return refMicroGroups;
        },
        getRefGroupCheckinCurrent: function() {
          return groupCheckinCurrent;
        },
        getRefGroupCheckinRecords: function() {
          return groupCheckinRecords;
        },
        getRefsubgroupCheckinRecords: function() {
          return subgroupCheckinRecords;
        },
        getRefGroupLocsDefined: function() {
          return groupLocsDefined;
        },
        getSignedinUserRef: function() {
          return loggedUserRef;
        },
        getRefFlattendGroups: function() {
          return flattenedGroups;
        },
        getRefPolicies: function() {
          return policies;
        },
        getRefUserPolicies: function() {
          return userPolicies;
        },
        getRefProgressReport: function() {
          return progressReport;
        },
        getRefSubgroupPolicies: function() {
          return subgroupPolicies;
        },
        getRefActivitySeen: function() {
          return activitySeen;
        },
        getRefQuestionBank: function() {
          return questionBank;
        },
        getRefUserQuestionBanks: function() {
          return userQuestionBanks;
        },
        getRefQuestionBankMemberships: function() {
          return questionBankMemberships;
        },
        getRefQuestionBankNames: function() {
          return questionBankNames;
        },
        getRefUserQuiz: function() {
          return userQuiz;
        },
        getRefQuiz: function() {
          return quiz;
        },
        getRefQuizNames: function() {
          return quizNames;
        },
        logout: function() {
          console.log('unauth the firebase');
          ref.unauth();
          var authdata = ref.getAuth();
          console.log(authdata);
        },
        asyncLogin: function(userID, token) {
          var deferred = $q.defer();
          if (token) { // means user logged in from web server
            Firebase.goOnline(); // if previously manually signed out from firebase.
            var auth = $firebaseAuth(ref);
            auth.$authWithCustomToken(token).then(function(authData) {
              if (authData.uid == userID) {

                //authenticated
                appConfig.firebaseAuth = true;
                userService.setExpiry(authData.expires)

                /*storing references*/
                currentAuthData = authData;
                refUsers = ref.child("users");
                refGroups = ref.child("groups");
                refSubGroups = ref.child("subgroups");
                refMicroGroups = ref.child("microgroups");
                refUserGroupMemberships = ref.child(
                  "user-group-memberships");
                refUserSubGroupMemberships = ref.child(
                  "user-subgroup-memberships");
                refUserMicroGroupMemberships = ref.child(
                  "user-microgroup-memberships");
                groupsUserInvites = ref.child("groups-user-invites");
                groupMembershipRequests = ref.child(
                  "group-membership-requests");
                groupsMembershipRequestsByUser = ref.child(
                  "group-membership-requests-by-user");
                subgroupMembershipRequests = ref.child(
                  "subgroup-membership-requests");
                subgroupMembershipRequestsByUser = ref.child(
                  "subgroup-membership-requests-by-user");
                groupMembers = ref.child("group-members");
                subgroupMembers = ref.child("subgroup-members");
                microgroupMembers = ref.child("microgroup-members");
                groupsNames = ref.child("groups-names");
                subgroupsNames = ref.child("subgroups-names");
                microgroupsNames = ref.child("microgroups-names");
                groupsActivityStreams = ref.child(
                  "group-activity-streams");
                subgroupsActivityStreams = ref.child(
                  "subgroup-activity-streams");
                microgroupsActivityStreams = ref.child(
                  "microgroup-activity-streams");
                groupCheckinCurrent = ref.child(
                  "group-check-in-current");
                groupCheckinRecords = ref.child(
                  "group-check-in-records");
                subgroupCheckinRecords = ref.child(
                  "subgroup-check-in-records");
                groupLocsDefined = ref.child("group-locations-defined");
                flattenedGroups = ref.child("flattened-groups");
                policies = ref.child("policies");
                userPolicies = ref.child("user-policies");
                progressReport = ref.child('subgroup-progress-reports');
                subgroupPolicies = ref.child('subgroup-policies');
                activitySeen = ref.child('activities-seen-by-user');
                questionBank = ref.child('question-bank');
                userQuestionBanks = ref.child('user-question-banks');
                questionBankMemberships = ref.child(
                  'question-bank-memberships');
                questionBankNames = ref.child('question-bank-names');
                quizNames = ref.child('quiz-name');
                userQuiz = ref.child('user-quiz');
                quiz = ref.child('quizes');


                /*presence API work*/
                //explicitly passing references to avoid circular dependency issue.
                userPresenceService.init({
                  main: ref,
                  users: refUsers
                });

                //listen for firebase connection state and register presence
                userPresenceService.syncUserPresence(userID);

                deferred.resolve({
                  loggedUserRef: loggedUserRef
                });
              } else {
                deferred.reject();
              }
            }).catch(function(error) {
              // console.error("Firebase Authentication failed: ", error);
              deferred.reject(error);
            });
          } else {
            deferred.reject(); //token not provided
          }
          return deferred.promise;
        },
        asyncCheckIfGroupExists: function(groupID) {
          var deferred = $q.defer();
          groupsNames.child(groupID).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            deferred.resolve({
              exists: exists,
              group: snapshot.val()
            });
          });
          return deferred.promise;
        },
        asyncCheckIfUserExists: function(userID) {
          var deferred = $q.defer();
          refUsers.child(userID).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            deferred.resolve({
              exists: exists,
              userID: userID,
              user: snapshot.val()
            });
          });
          return deferred.promise;
        },
        asyncCheckIfQuestionBankExists: function(questionBankUniqueID) {
          var deferred = $q.defer();
          questionBankNames.child(questionBankUniqueID).once('value',
            function(
              snapshot) {
              var exists = (snapshot.val() !== null);
              deferred.resolve({
                exists: exists,
                questionbank: snapshot.val()
              });
            });
          return deferred.promise;
        },
        asyncCheckIfQuizExists: function(quizID) {
          var deferred = $q.defer();
          quizNames.child(quizID).once('value',
            function(
              snapshot) {
              var exists = (snapshot.val() !== null);
              deferred.resolve({
                exists: exists,
                quizbank: snapshot.val()
              });
            });
          return deferred.promise;
        }
      };
    }
  ]);
