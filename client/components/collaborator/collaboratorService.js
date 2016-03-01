/**
 * Created on 2/2/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator', ['core'])
    .factory('CollaboratorService', ['$q','$firebaseArray','ref', CollaboratorService]);

  function CollaboratorService($q,$firebaseArray,ref) {

    var firepadRef,pushDocumentNode,firebaseDocumentId,filteredUsers = [];
    return {
      CreateDocument:CreateDocument,
      // getUsers:getUsers
    }


    function CreateDocument(documentTitle,groupID,subgroupID) {
      var firebaseLocalRef;
      var updateDocument = {};
      if (subgroupID) {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-subgroups/" + groupID + "/" + subgroupID);
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/init/title"] = documentTitle;
        updateDocument["firepad-subgroups/" + groupID + "/" + subgroupID + "/init/type"] = "Rich Text";
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/init/title"] = documentTitle;
        updateDocument["firepad-subgroups-documents/" + groupID + "/" + subgroupID + "/init/type"] = "Rich Text";

      } else {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-groups/" + groupID);
        updateDocument["firepad-groups/" + groupID + "/init/title"] = documentTitle;
        updateDocument["firepad-groups/" + groupID + "/init/type"] = "Rich Text";
        updateDocument["firepad-groups-documents/" + groupID + "/init/title"] = documentTitle;
        updateDocument["firepad-groups-documents/" + groupID + "/init/type"] = "Rich Text";
      }

      firebaseLocalRef.update(updateDocument, function(error) {
        if (error) {
          console.log("error due to :", error);
        }
      });
    }
  };
})();
