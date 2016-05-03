/**
 * Created on 2/2/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator', ['core'])
    .factory('CollaboratorService', ['$q', '$firebaseArray','$rootScope','firebaseService', CollaboratorService]);

  function CollaboratorService($q, $firebaseArray, $rootScope,firebaseService) {
    var currentGroup,currentSubGroup,subGroupUsers = [];
    var currentDocumentId ="";
    var firepadRef = firebaseService.getRefMain(), pushDocumentNode, firebaseDocumentId, filteredUsers = [];
    return {
      getCurrentDocumentId :getCurrentDocumentId,
      setCurrentDocumentId:setCurrentDocumentId,
      CreateDocument: CreateDocument,
      addAccessUser: addAccessUser,
      setCurrentTeam : setCurrentTeam,
      getinitGroupDocument : getinitGroupDocument,
      getinitSubGroupDocument: getinitSubGroupDocument,
      getGroupMembers:getGroupMembers,
      getSubGroupUsers:getSubGroupUsers
    }


    function getSubGroupUsers(users,subgroupID){
      users.forEach(function(user){
        if(user.subgroupID == subgroupID)
          subGroupUsers.push(user);
      })
      return subGroupUsers;
    }

    function getCurrentDocumentId() {
      return currentDocumentId;
    }

    function setCurrentDocumentId(documentId){
      currentDocumentId = documentId;
    }
    function setCurrentTeam(id,type) {
      if(type == "Group"){
        currentGroup = id;
      }
      else {
        currentSubGroup = id;
      }
    }

    var abc = '';

    function getinitGroupDocument(groupID, cb) {
      var val = "";
    //   firepadRef = new Firebase(ref)
      firepadRef.child("firepad-groups/"+groupID).limitToFirst(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }

    function getGroupMembers(groupID,subgroupID) {
      if(subgroupID){
        // firepadRef = new Firebase(ref).child("group-members/"+subgroupID+"/"+groupID);
        $firebaseArray(firepadRef.child("group-members/"+subgroupID+"/"+groupID)).$loaded().then(function(x){
           return x;
        });
      }
      else {
        // firepadRef = new Firebase(ref).child("group-members/"+groupID);
        $firebaseArray(firepadRef.child("group-members/"+groupID)).$loaded().then(function(x){
           return x;
         });
      }
    }


    function getinitSubGroupDocument(groupID,subgroupID,cb){
      var val = "";
    //   firepadRef = new Firebase(ref).child("firepad-subgroups/"+groupID+'/'+subgroupID);
      firepadRef.child("firepad-subgroups/"+groupID+'/'+subgroupID).limitToFirst(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }



    function addAccessUser(documentId, groupID, subgroupID, userID,access) {
    //   var firebaseLocalRef;
    //   firepadRef = new Firebase(ref);
      var updateDocument = {};
      if (subgroupID) {
        // firebaseLocalRef = new Firebase(ref).child('firepad-subgroups-access/' + groupID + '/' + subgroupID + '/' + documentId);
          updateDocument['firepad-subgroups-rules/' + groupID + '/' + subgroupID + '/' + documentId + '/allUsers'] = true;
          updateDocument['firepad-subgroups-access/' + groupID + '/' + subgroupID + '/' + documentId + '/' + userID] = access;
      }
      else {
        // firebaseLocalRef = new Firebase(ref).child('firepad-groups-access/' + groupID + '/' + documentId);
          updateDocument['firepad-groups-rules/' + groupID + '/' + documentId + '/allUsers'] = true;
          updateDocument['firepad-groups-access/' + groupID +  '/' + documentId + '/' + userID] = access;
      }
      firepadRef.update(updateDocument, function(error) {
        if (error) {
        }
      });
    }

    function CreateDocument(documentTitle, groupID, subgroupID,documentType,user) {
      var deferred = $q.defer();
      var firebaseObj = {};
      var firebaseLocalRef = firepadRef,pushDocumentNode,firebaseDocumentId;
      var updateDocument = {},
      createdBy = {
        firstName:user.firstName,
        userID:user.userID,
        lastName:user.lastName,
        imgUrl:$rootScope.userImg || ""

      };
        firebaseObj = {
          title: documentTitle,
          type: documentType,
          createdBy: createdBy,
          timestamp: Date.now()
      }
      if (subgroupID) {
        // firebaseLocalRef = new Firebase(ref);
        // firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID).push();
        firebaseDocumentId = pushDocumentNode.key();
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId] = firebaseObj;
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId] = firebaseObj;
        updateDocument['firepad-subgroups-access/' + groupID + "/" + subgroupID + '/' + firebaseDocumentId + '/' + user.userID] = 1;
        updateDocument['firepad-subgroups-rules/' + groupID + "/" + subgroupID + '/' + firebaseDocumentId + '/allUsers'] = true;

      } else {
        // firebaseLocalRef = new Firebase(ref);
        // firepadRef = firebaseLocalRef.child("firepad-groups/" + groupID);
         pushDocumentNode = firebaseLocalRef.child("firepad-groups/" + groupID).push();
        firebaseDocumentId = pushDocumentNode.key();
        updateDocument["firepad-groups/" + groupID + "/" + firebaseDocumentId ] = firebaseObj;
        updateDocument["firepad-groups-documents/" + groupID + "/" + firebaseDocumentId ] = firebaseObj;
        updateDocument['firepad-groups-access/' + groupID + "/" + firebaseDocumentId + '/' + user.userID] = 1;
        updateDocument['firepad-groups-rules/' + groupID + "/" + firebaseDocumentId + '/allUsers'] = true;

      }
      firebaseLocalRef.update(updateDocument, function(error) {
        if (error) {
          deferred.reject(error);
        }
        else {
          deferred.resolve({status:"Updated Successfully",docId:firebaseDocumentId});
        }
      });
      return deferred.promise;
    }
  };
})();
