/**
 * Created on 2/2/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator', ['core'])
    .factory('CollaboratorService', ['$q','$firebaseArray','ref', CollaboratorService]);

  function CollaboratorService($q,$firebaseArray,ref) {

    var firepadRef,pushDocumentNode,firebaseDocumentId;
    return {
      CreateDocument:CreateDocument
    };

    function CreateDocument(documentTitle,groupID,subgroupID) {
      var firebaseLocalRef;
      var updateDocument = {};
      if (subgroupID) {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID).push();
        // that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/title"] = documentTitle;
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/" + firebaseDocumentId + "/title"] = documentTitle;
      } else {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-groups/" + groupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-groups/" + groupID).push();
        // that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-groups/" + groupID + "/" + firebaseDocumentId + "/title"] = documentTitle;
        updateDocument["firepad-groups-documents/" + groupID + "/" +firebaseDocumentId + "/title"] = documentTitle;
      }

      firebaseLocalRef.update(updateDocument, function(error) {
        if (error) {
          console.log("error due to :", error);
        }
      });
    }
  };
})();
