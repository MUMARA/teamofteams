/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator')
      .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
      .controller('CollaboratorController', ['ref', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope','$state','$firebaseObject','$rootScope', collaboratorFunction]);



  function collaboratorFunction(ref, $firebaseArray, FileSaver, Blob, groupService, $stateParams, userService, dataService, messageService, $timeout, $scope,$state,$firebaseObject,$rootScope) {


    componentHandler.upgradeAllRegistered();
    var firepadRef;
    var that = this;

    that.documentTypes = [
      {displayName:"Rich Text",codeMirrorName: "Rich Text"},
      {displayName:"JavaScript",codeMirrorName: "text/javascript"},
      {displayName:"Swift",codeMirrorName: "text/x-swift"},
      {displayName:"Java",codeMirrorName: "text/x-java"},
      {displayName:"C#",codeMirrorName: "text/x-csharp"},];
    that.isNormal = true;
    that.mode = "Rich Text";
    var pushDocumentNode,firebaseDocumentId,firepad;
    that.ready = true;
    that.clicked = false;
    that.channelBottomSheet = false;
    that.default = true;
    that.document = "Create/Open Document"
    that.showLoader = false;
    var globalRef = new Firebase(ref);
    init();

    function clearDiv(){
      var div = document.getElementById("firepad");
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
    }

    that.gotoDocument = function(openDoc) {
      if(that.subgroupID) {
        $state.go("user.group.subgroup-collaborator",{groupID: that.groupID, subgroupID: that.subgroupID, docID: openDoc.$id})
      } else {
        $state.go("user.group.collaborator",{groupID: that.groupID,docID: openDoc.$id})
      }
    }


    function initiateFirepad(refArgument,arg){
      var codeMirror = CodeMirror(document.getElementById('firepad'), {
        lineNumbers: that.mode == "Rich Text" ? false: true,
        mode: that.mode
      });
      firepad = Firepad.fromCodeMirror(refArgument, codeMirror, {
        richTextShortcuts: that.isNormal,
        richTextToolbar: that.isNormal,
        // userId: null,
        defaultText: null
        /*'Welcome to firepad!'*/
      });
      firepad.on("ready", function() {
        that.ready = false;
        console.log("Usera", that.user);
        firepad.setUserId(that.user.userID);
        firepad.setUserColor("#ccccc");
        that.showLoader = false;
        if(arg){
          that.document = $stateParams.docID;
        }
      })

    }

    that.checkboxClicked = function() {
      console.log(that.allow);
    }
    that.createDocument = function() {
      var firebaseLocalRef;
      var updateDocument = {};
      that.showLoader = true;
      that.createdBy = {
        firstName:that.user.firstName,
        lastName:that.user.lastName,
        userID:that.user.userID,
        imgUrl:$rootScope.userImg || ""
      };
      
      if (that.subgroupID) {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).push();
        that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-subgroups/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/title"] = that.documentTitle;
        updateDocument["firepad-subgroups/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/type"] = that.documentType;
        updateDocument["firepad-subgroups/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/createdBy"] = that.createdBy;
        updateDocument["firepad-subgroups/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/timestamp"] = Date.now();
        updateDocument["firepad-subgroups-documents/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/title"] = that.documentTitle;
        updateDocument["firepad-subgroups-documents/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/type"] = that.documentType;
        updateDocument["firepad-subgroups-documents/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/createdBy"] = that.createdBy;
        updateDocument["firepad-subgroups-documents/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/timestamp"] = Date.now();
      } else {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-groups/" + that.groupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-groups/" + that.groupID).push();
        that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-groups/" + that.groupID + "/" + firebaseDocumentId + "/title"] = that.documentTitle;
        updateDocument["firepad-groups/" + that.groupID + "/" + firebaseDocumentId + "/type"] = that.documentType;
        updateDocument["firepad-groups/" + that.groupID + "/" + firebaseDocumentId + "/createdBy"] = that.createdBy;
        updateDocument["firepad-groups/" + that.groupID + "/" + firebaseDocumentId + "/timestamp"] = Date.now();
        updateDocument["firepad-groups-documents/" + that.groupID + "/" +firebaseDocumentId + "/title"] = that.documentTitle;
        updateDocument["firepad-groups-documents/" + that.groupID + "/" +firebaseDocumentId + "/type"] = that.documentType;
        updateDocument["firepad-groups-documents/" + that.groupID + "/" +firebaseDocumentId + "/createdBy"] = that.createdBy;
        updateDocument["firepad-groups-documents/" + that.groupID + "/" +firebaseDocumentId + "/timestamp"] = Date.now();
      }

      firebaseLocalRef.update(updateDocument, function(error) {
        if (error) {
          console.log("error due to :", error);
        }
        //that.document = that.documentTitle;
        that.channelBottomSheet = false;
        that.showLoader = false;
        //initiateFirepad(firepadRef);
        if(that.subgroupID) {
          $state.go("user.group.subgroup-collaborator",{groupID: that.groupID, subgroupID: that.subgroupID, docID:firebaseDocumentId})
        } else {
          $state.go("user.group.collaborator",{groupID: that.groupID,docID: firebaseDocumentId})
        }
      });

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


    function init() {

      groupService.setActivePanel('collaborator');
      groupService.setSubgroupIDPanel($stateParams.subgroupID);
      that.subgroupID = $stateParams.subgroupID || '';
      that.currentDocument = $stateParams.docID;
      that.groupID = $stateParams.groupID;
      that.user = userService.getCurrentUser();
      that.users = dataService.getUserData();
      that.activeTitle = "Collaborator";

      if($stateParams.docID) {
        if(that.subgroupID) {
          that.documents = $firebaseArray(globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID));
          //console.log(that.documents);
          //console.log(that.documents.length);
          if($stateParams.docID === "Team of Teams Information"){
            globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child("init"); // this will be the reference of the Default Document

          } else {
            globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID);  //this will be the user created documents

          }
        }
        else {
          that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
          if($stateParams.docID === "Team Information") {
            globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID).child("init");
            that.mode = 'Rich Text';
          }else {
            globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID).child($stateParams.docID);
            var array = $firebaseArray(globalRef)
            console.log(array);
            console.log(array.length);

          }
        }
        globalRef.once('value', function(snapshot){
          that.document = snapshot.val().title;
          that.mode = snapshot.val().type;
          that.isNormal = that.mode == "Rich Text" ? true : false;
          initiateFirepad(globalRef);

          console.log("Snap :",snapshot.val())
        });

      }
      that.history = $firebaseArray(globalRef.child("history").limitToLast(300));
      //console.log("DataService:", that.users);
      console.log("DDAAAA : ",that.documents);
    }
  }
})();
