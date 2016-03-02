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
      getinitSubGroupDocument: getinitSubGroupDocument
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
      firepadRef.limitToLast(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }


    function getinitSubGroupDocument(groupID,subgroupID,cb){
      var val = "";
      firepadRef = new Firebase(ref).child("firepad-subgroups/"+groupID+'/'+subgroupID);
      firepadRef.limitToLast(1).once('value',function(snapshot){
        for(var a in snapshot.val()){
           val = a;
        }
        cb(val);
      })
    }



    function addAccessUser(documentId, groupID, subgroupID, userID) {
      var firebaseRef;
      var updateDocument = {};
      if (!subgroupID) {
        firebaseRef = new Firebase(ref).child('firepad-groups-access/' + groupID + '/' + subgroupID + '/' + documentId);
        firebaseRef.once('value', function(snapshot) {
          var isPresent = snapshot.exists();
          if (!isPresent) {
            updateDocument['firepad-groups-access/' + groupID + '/' + subgroupID + '/' + documentId + '/allUsers'] = true;
          }
          updateDocument['firepad-groups-access/' + groupID + '/' + subgroupID + '/' + documentId + '/' + userID] = true;
        });
      }
      else {
        firebaseRef = new Firebase(ref).child('firepad-subgroups-access/' + groupID + '/' + documentId);
        firebaseRef.once('value', function(snapshot) {
          var isPresent = snapshot.exists();
          if (!isPresent) {
            updateDocument['firepad-subgroups-access/' + groupID + '/' + documentId + '/allUsers'] = true;
          }
          updateDocument['firepad-subgroups-access/' + groupID +  '/' + documentId + '/' + userID] = true;
        });
      }
      firebaseRef.update(updateDocument, function(error) {
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
