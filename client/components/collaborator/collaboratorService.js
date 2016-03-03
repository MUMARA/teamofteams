/**
 * Created on 2/2/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator', ['core'])
    .factory('CollaboratorService', ['$q', '$firebaseArray', 'ref','$rootScope', CollaboratorService]);

  function CollaboratorService($q, $firebaseArray, ref,$rootScope) {
    var currentGroup,currentSubGroup;
    var firepadRef, pushDocumentNode, firebaseDocumentId, filteredUsers = [];
    return {
      CreateDocument: CreateDocument,
      addAccessUser: addAccessUser,
      setCurrentTeam : setCurrentTeam,
      getinitGroupDocument : getinitGroupDocument,
      getinitSubGroupDocument: getinitSubGroupDocument,
      getGroupMembers:getGroupMembers
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
      firepadRef = new Firebase(ref).child("firepad-groups/"+groupID);
      firepadRef.limitToFirst(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }
    
    function getGroupMembers(groupID,subgroupID) {
      if(subgroupID){
        firepadRef = new Firebase(ref).child("group-members/"+subgroupID+"/"+groupID);
        $firebaseArray(firepadRef).$loaded().then(function(x){
           return x;
        });
      }
      else {
        firepadRef = new Firebase(ref).child("group-members/"+groupID);
        $firebaseArray(firepadRef).$loaded().then(function(x){
           return x;
         });
      }
    }


    function getinitSubGroupDocument(groupID,subgroupID,cb){
      var val = "";
      firepadRef = new Firebase(ref).child("firepad-subgroups/"+groupID+'/'+subgroupID);
      firepadRef.limitToFirst(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }



    function addAccessUser(documentId, groupID, subgroupID, userID) {
      var firebaseLocalRef;
      firepadRef = new Firebase(ref);
      var updateDocument = {};
      if (subgroupID) {
        firebaseLocalRef = new Firebase(ref).child('firepad-subgroups-access/' + groupID + '/' + subgroupID + '/' + documentId);
          updateDocument['firepad-subgroups-access/' + groupID + '/' + subgroupID + '/' + documentId + '/allUsers'] = true;
          updateDocument['firepad-subgroups-access/' + groupID + '/' + subgroupID + '/' + documentId + '/' + userID] = true;
      }
      else {
        firebaseLocalRef = new Firebase(ref).child('firepad-groups-access/' + groupID + '/' + documentId);
          updateDocument['firepad-groups-access/' + groupID + '/' + documentId + '/allUsers'] = true;
          updateDocument['firepad-groups-access/' + groupID +  '/' + documentId + '/' + userID] = true;
      }
      firepadRef.update(updateDocument, function(error) {
        if (error) {
          console.log("Error From AccessUsers:", error);
        }
      });
    }
    function CreateDocument(documentTitle, groupID, subgroupID,documentType,user) {
      var deferred = $q.defer();
      var firebaseLocalRef,pushDocumentNode,firebaseDocumentId;
      var updateDocument = {},
      createdBy = {
        firstName:user.firstName,
        userID:user.userID,
        lastName:user.lastName,
        imgUrl:$rootScope.userImg || ""

      };
      if (subgroupID) {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID).push();
        firebaseDocumentId = pushDocumentNode.key();
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/title"] = documentTitle;
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/type"] = documentType;
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/createdBy"] = createdBy;
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/timestamp"] = Date.now();
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/title"] = documentTitle;
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/type"] = documentType;
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/createdBy"] = createdBy;
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/timestamp"] = Date.now();

      } else {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-groups/" + groupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-groups/" + groupID).push();
        firebaseDocumentId = pushDocumentNode.key();
        updateDocument["firepad-groups/" + groupID + "/" + firebaseDocumentId + "/title"] = documentTitle;
        updateDocument["firepad-groups/" + groupID + "/" + firebaseDocumentId + "/type"] = documentType;
        updateDocument["firepad-groups/" + groupID + "/" + firebaseDocumentId + "/createdBy"] = createdBy;
        updateDocument["firepad-groups/" + groupID + "/" + firebaseDocumentId + "/timestamp"] = Date.now();
        updateDocument["firepad-groups-documents/" + groupID + "/" +firebaseDocumentId + "/title"] = documentTitle;
        updateDocument["firepad-groups-documents/" + groupID + "/" +firebaseDocumentId + "/type"] = documentType;
        updateDocument["firepad-groups-documents/" + groupID + "/" +firebaseDocumentId + "/createdBy"] = createdBy;
        updateDocument["firepad-groups-documents/" + groupID + "/" +firebaseDocumentId + "/timestamp"] = Date.now();
      }
      firebaseLocalRef.update(updateDocument, function(error) {
        if (error) {
          console.log("error due to :", error);
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
