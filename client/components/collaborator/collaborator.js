/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator')
    .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
    .controller('CollaboratorController', ['ref', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', 'CollaboratorService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope', collaboratorFunction]);


  function collaboratorFunction(ref, $firebaseArray, FileSaver, Blob, groupService, CollaboratorService, $stateParams, userService, dataService, messageService, $timeout, $scope) {


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
      that.default = false;
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
      console.log("Ya Khuda,", JSON.stringify(dataService.getUserData()));
      that.activeTitle = "Collaborator";



      if(that.subgroupID) {
        that.documents = $firebaseArray(globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID));
        console.log(that.documents);
        console.log(that.documents.length);
      }
      else {
        that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
        console.log(that.documents);
        console.log(that.documents.length);
      }
      // if ($stateParams.u) {
      //   $timeout(function() {
      //     that.users.forEach(function(val, index) {
      //       if (val.id === that.user.userID && val.groupID == that.groupID && val.subgroupID == that.subgroupID) {
      //         //that.dailyProgressReport = ProgressReportService.getSingleSubGroupReport(val, that.groupID, that.subgroupID);
      //       }
      //     });
      //   }, 2000);
      // } else {
      //   if ($stateParams.subgroupID) {
      //     //sub group report
      //     $timeout(function() {
      //       //that.dailyProgressReport = ProgressReportService.getSubGroupDailyProgressReport(that.users, that.groupID, that.subgroupID);
      //       // $timeout(function() {
      //       //     console.log('xxxx',that.dailyProgressReport);
      //       // }, 5000);
      //     }, 2000);
      //   } else {
      //     //group report
      //     $timeout(function() {
      //       // that.dailyProgressReport = ProgressReportService.getGroupDailyProgressReport(that.users, that.groupID);
      //     }, 2000);
      //   }
      //
      // }



    }


  }


  /*function CollaboratorController($state, messageService, $timeout, groupService, ProgressReportService, dataService, userService, $stateParams) {
   var that = this;
   console.log("in collaborator controller");
   /!*        // this.setFocus = function() {
   //     document.getElementById("#UserSearch").focus();
   // };
   // this.update = function(report) {
   //     // console.log(report);
   //     ProgressReportService.updateReport(report, function(result) {
   //         if (result) {
   //             messageService.showSuccess('Update Successfully!');
   //             $state.go('user.group.subgroup-collaborator', {groupID: that.groupID, subgroupID: that.subgroupID, u: ''});
   //         } else {
   //             messageService.showFailure('Update Failure!');
   //         }
   //     });
   // };

   function init() {
   groupService.setActivePanel('collaborator');
   groupService.setSubgroupIDPanel($stateParams.subgroupID);
   that.groupID = $stateParams.groupID;
   that.subgroupID = $stateParams.subgroupID;
   that.user = userService.getCurrentUser();
   that.users = dataService.getUserData();
   that.activeUser = ($stateParams.u) ? that.user.userID : '';
   that.activeTitle = "Collaborator";

   if ($stateParams.u) {
   $timeout(function() {
   that.users.forEach(function(val, index){
   if(val.id === that.user.userID && val.groupID == that.groupID &&  val.subgroupID == that.subgroupID){
   that.dailyProgressReport = ProgressReportService.getSingleSubGroupReport(val, that.groupID, that.subgroupID);
   }
   });
   }, 2000);
   } else {
   if ($stateParams.subgroupID) {
   //sub group report
   $timeout(function() {
   that.dailyProgressReport = ProgressReportService.getSubGroupDailyProgressReport(that.users, that.groupID, that.subgroupID);
   // $timeout(function() {
   //     console.log('xxxx',that.dailyProgressReport);
   // }, 5000);
   }, 2000);
   } else {
   //group report
   $timeout(function() {
   // that.dailyProgressReport = ProgressReportService.getGroupDailyProgressReport(that.users, that.groupID);
   }, 2000);
   }

   }



   }
   init();*!/

   } // ProgressReportController*/
})();
