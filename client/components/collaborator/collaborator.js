/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator')
    .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
    .controller('CollaboratorController', ['ref', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope', collaboratorFunction]);


  function collaboratorFunction(ref, $firebaseArray, FileSaver, Blob, groupService, $stateParams, userService, dataService, messageService, $timeout, $scope) {


    componentHandler.upgradeAllRegistered();
    var firepadRef;
    var that = this;
    var pushDocumentNode,firebaseDocumentId,firepad;
    that.ready = true;
    that.clicked = false;
    that.channelBottomSheet = false;
    that.default = true;
    that.document = "Create/Open Document"
    that.documentready = false;
    that.hideLoader = true;
    var globalRef = new Firebase(ref);


    function clearDiv(){
      var div = document.getElementById("firepad");
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
    }

    that.gotoDocument = function(openDoc) {


      clearDiv();
      if(that.subgroupID) {
        globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child(openDoc.$id);
      }
      else {
        globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID + "/" + that.subgroupID).child(openDoc.$id);
      }
      that.history = $firebaseArray(globalRef.child("history"));
      that.documentready = true;
      initiateFirepad(globalRef);
      that.document = openDoc.title;
      that.default = false;
      console.log(openDoc.$id);
    }


    function initiateFirepad(refArgument){
      var codeMirror = CodeMirror(document.getElementById('firepad'), {
        lineWrapping: true
      });
      firepad = Firepad.fromCodeMirror(refArgument, codeMirror, {
        richTextShortcuts: true,
        richTextToolbar: true,
        // userId: null,
        defaultText: null
          /*'Welcome to firepad!'*/
      });
      firepad.on("ready", function() {
        that.ready = false;
        console.log("Usera", that.user);
        firepad.setUserId(that.user.userID);
        firepad.setUserColor("#ccccc");
        that.hideLoader = true;
      })

    }



    that.createDocument = function() {
      clearDiv();
      var firebaseLocalRef;
      var updateDocument = {};
      that.hideLoader = false;
      that.document = that.documentTitle;
      that.channelBottomSheet = false;
      that.documentready = true;
      if (that.subgroupID) {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).push();
        that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-subgroups/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/title"] = that.document
        updateDocument["firepad-subgroups-documents/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/title"] = that.document;
      } else {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-groups/" + that.groupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-groups/" + that.groupID).push();
        that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-groups/" + that.groupID + "/" + firebaseDocumentId + "/title"] = that.document
        updateDocument["firepad-groups-documents/" + that.groupID + "/" +firebaseDocumentId + "/title"] = that.document;
      }

      firebaseLocalRef.update(updateDocument, function(error) {
        if (error) {
          console.log("error due to :", error);
        }
      })
      initiateFirepad(firepadRef);
    }

    that.channelBottomSheetfunc = function() {
      if (that.channelBottomSheet)
        that.channelBottomSheet = false;
      else
        that.channelBottomSheet = true;
    }
    that.export = function() {

      if (that.clicked) {
        that.clicked = false;
      } else {
        that.clicked = true;
        var content = firepad.getHtml();
        var data = new Blob([content], {
          type: 'html;charset=utf-8'
        });
        FileSaver.saveAs(data, 'data.html');
        console.log(firepad.getHtml())
      }

    };
    init();

    function init() {
      groupService.setActivePanel('collaborator');
      groupService.setSubgroupIDPanel($stateParams.subgroupID);
      that.subgroupID = $stateParams.subgroupID || '';
      that.groupID = $stateParams.groupID;
      that.user = userService.getCurrentUser();
      that.users = dataService.getUserData();
      console.log(that.users);
      console.log("Users Array: ",that.users.length);
      that.activeTitle = "Collaborator";

      if($stateParams.docID) {
        if(that.subgroupID) {
          that.documents = $firebaseArray(globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID));
          console.log(that.documents);
          console.log(that.documents.length);
          globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID);
          // initiateFirepad(globalRef);
        }
        else {
          that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
          globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID);
          initiateFirepad(globalRef);
          that.document = $stateParams.docID;
          console.log(that.documents);
          console.log(that.documents.length);
        }
      }




    }
  }
})();
