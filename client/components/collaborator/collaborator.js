/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator')
    .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
    .filter('collaboratorUsers',function(){
      return function(users,groupID) {
        var filteredUsers = [];
        users.forEach(function(user){
          if(user.groupID == groupID){
              var userNew = findWithAttr(filteredUsers,'fullName',user.fullName) == -1;
              if(userNew) {
                filteredUsers.push(user);
              }
          }
        })
        return filteredUsers;
      }

      function findWithAttr(array, attr, value) {
      for(var i = 0; i < array.length; i += 1) {
          if(array[i][attr] === value) {
              return i;
          }
      }
      return -1;
  }
    })
    .controller('CollaboratorController', ['ref', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope','$state','$firebaseObject','$rootScope','CollaboratorService', collaboratorFunction]);



  function collaboratorFunction(ref, $firebaseArray, FileSaver, Blob, groupService, $stateParams, userService, dataService, messageService, $timeout, $scope,$state,$firebaseObject,$rootScope,CollaboratorService) {


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
        CollaboratorService.CreateDocument(that.documentTitle,that.groupID,that.subgroupID,that.documentType,that.user)
        .then(function(response){
          if(response.status){
            $state.go("user.group.subgroup-collaborator",{groupID: that.groupID, subgroupID: that.subgroupID, docID:response.docId});
          }
        });
      } else {
        CollaboratorService.CreateDocument(that.documentTitle,that.groupID,that.subgroupID,that.documentType,that.user)
        .then(function(response){
          if(response.status){
            $state.go("user.group.collaborator",{groupID: that.groupID,docID: response.docId});
          }
        });
      }
    };

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

    that.filterTeams = function(player) {
        var teamIsNew = indexedTeams.indexOf(player.team) == -1;
        if (teamIsNew) {
            indexedTeams.push(player.team);
        }
        return teamIsNew;
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
            globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID);  //this will be the user created documents
        }
        else {
          that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
            globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID).child($stateParams.docID);
        }
        globalRef.once('value', function(snapshot){
          that.document = snapshot.val().title;
          that.mode = snapshot.val().type;
          that.isNormal = that.mode == "Rich Text" ? true : false;
          initiateFirepad(globalRef);
       });
      }
      that.history = $firebaseArray(globalRef.child("history").limitToLast(300));
    }
  }
})();
