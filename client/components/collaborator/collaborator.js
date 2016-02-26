/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator')
    .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
    .controller('CollaboratorController', ['ref', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope','$state','$firebaseObject', collaboratorFunction]);


  function collaboratorFunction(ref, $firebaseArray, FileSaver, Blob, groupService, $stateParams, userService, dataService, messageService, $timeout, $scope,$state,$firebaseObject) {


    componentHandler.upgradeAllRegistered();
    var firepadRef;
    var that = this;
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
        $state.go("user.group.subgroup-collaborator",{groupID: that.groupID, subgroupID: that.panel.subgroupID, docID: openDoc.$id})
      } else {
        $state.go("user.group.collaborator",{groupID: that.groupID,docID: openDoc.$id})

      }
      // that.history = $firebaseArray(globalRef.child("history"));
      // initiateFirepad(globalRef);
      // that.document = openDoc.title;
      // that.default = false;
      // console.log(openDoc.$id);
    }


    function initiateFirepad(refArgument,arg){
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
        that.showLoader = false;
        if(arg){
          that.document = $stateParams.docID;
        }
      })

    }

    that.createDocument = function() {
      // clearDiv();
      var firebaseLocalRef;
      var updateDocument = {};
      that.showLoader = true;
      if (that.subgroupID) {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).push();
        that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-subgroups/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/title"] = that.documentTitle
        updateDocument["firepad-subgroups-documents/" + that.groupID + "/" + that.subgroupID + "/" + firebaseDocumentId + "/title"] = that.documentTitle;
      } else {
        firebaseLocalRef = new Firebase(ref);
        firepadRef = firebaseLocalRef.child("firepad-groups/" + that.groupID);
        pushDocumentNode = firebaseLocalRef.child("firepad-groups/" + that.groupID).push();
        that.documents = $firebaseArray(firepadRef);
        firebaseDocumentId = pushDocumentNode.key();
        firepadRef = firepadRef.child(firebaseDocumentId);
        updateDocument["firepad-groups/" + that.groupID + "/" + firebaseDocumentId + "/title"] = that.documentTitle
        updateDocument["firepad-groups-documents/" + that.groupID + "/" +firebaseDocumentId + "/title"] = that.documentTitle;
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
          $state.go("user.group.subgroup-collaborator",{groupID: that.groupID, subgroupID: that.panel.subgroupID, docID:firebaseDocumentId})
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
          console.log(that.documents);
          console.log(that.documents.length);
          if($stateParams.docID === "Team of Teams Information"){
            globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child("init"); // this will be the reference of the Default Document
            that.document = $stateParams.docID;
          } else {
            globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID);  //this will be the user created documents
            globalRef.once('value', function(snapshot){
              that.document = snapshot.val().title;
           });
          }
        }
        else {
          that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
          if($stateParams.docID === "Team Information") {
            globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID).child("init");
            that.document = $stateParams.docID;
          }else {
          globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID).child($stateParams.docID);
          globalRef.once('value', function(snapshot){
            that.document = snapshot.val().title;
         });

          var array = $firebaseArray(globalRef)
          console.log(array);
          console.log(array.length);
          // console.log(JSON.parse(JSON.stringify(array)));

            // for(var i in array){
            //   console.log('i', i)
            //   console.log('[i]', array[i])
            // }
            // array.forEach(function(v,l){
            //   console.log('v', v);
            //   console.log('L', l);
            // })
            // console.log(array.$id);
            // console.log(array.title);
          // that.document = globalRef.$getRecord($stateParams.docID)[0].title;
          }
        }
        initiateFirepad(globalRef);

      }
      that.history = $firebaseArray(globalRef.child("history"));
    }
  }
})();
