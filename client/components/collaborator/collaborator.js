/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  angular.module('app.collaborator')
    .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
    .filter('collaboratorUsers', function() {
      return function(users, groupID) {
        var filteredUsers = [];
        // console.log(JSON.stringify(users));
        users.forEach(function(user) {
          if (user.groupID == groupID) {
            var userNew = findWithAttr(filteredUsers, 'fullName', user.fullName) == -1;
            if (userNew) {
              filteredUsers.push(user);
            }
          }
        });
        return filteredUsers;
      };

      function findWithAttr(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i][attr] === value) {
            return i;
          }
        }
        return -1;
      }
    })
    .controller('CollaboratorController', ['firebaseService', 'ref', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope', '$state', '$firebaseObject', '$rootScope', 'CollaboratorService', '$q', collaboratorFunction]);


  function collaboratorFunction(firebaseService, ref, $firebaseArray, FileSaver, Blob, groupService, $stateParams, userService, dataService, messageService, $timeout, $scope, $state, $firebaseObject, $rootScope, CollaboratorService, $q) {


    componentHandler.upgradeAllRegistered();
    var firepadRef;
    var that = this;

    that.documentTypes = [{
      displayName: "Rich Text",
      codeMirrorName: "Rich Text"
    }, {
      displayName: "JavaScript",
      codeMirrorName: "text/javascript"
    }, {
      displayName: "Swift",
      codeMirrorName: "text/x-swift"
    }, {
      displayName: "Java",
      codeMirrorName: "text/x-java"
    }, {
      displayName: "C#",
      codeMirrorName: "text/x-csharp"
    },
    ];
    that.isNormal = true;
    that.mode = "Rich Text";
    var pushDocumentNode, firebaseDocumentId, firepad;
    that.ready = true;
    that.clicked = false;
    that.channelBottomSheet = false;
    that.default = true;
    that.document = "Create/Open Document";
    that.showLoader = false;
    that.admins = [];
    var globalRef = new Firebase(ref);
    init();

    if(!that.subgroupID){
      $firebaseArray(firebaseService.getRefGroupMembers().child(that.groupID)).$loaded().then(function (data) {
        data.forEach(function (member) {
          if(member["membership-type"] == 1){
            that.admins.push(member);
          }
        });
        console.log("that.admins",that.admins);
      });

      firebaseService.getRefUserGroupMemberships().child(that.user.userID).child(that.groupID).once('value', function(groups) {
        if (groups.val() && groups.val()['membership-type'] == 1) {
          that.isOwner = true;
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = "Group"
        } else if (groups.val() && groups.val()['membership-type'] == 2) {
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = "Group"
        } else if (groups.val() && groups.val()['membership-type'] == 3) {
          that.isMember = true;
        }
      });

      //var allowBackDrop = globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID);
      //allowBackDrop.on('child_changed', function (snapshot) {
      //  console.log("child has been changed", snapshot);
      //  globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID+'/'+that.user.userID).once("value", function (snapshot) {
      //    that.backdrop = snapshot.exists();
      //    console.log("backdrop",that.backdrop);
      //  })
      //});
      //allowBackDrop.on('child_removed', function (snapshot) {
      //  console.log("child has been changed", snapshot);
      //  globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID+'/'+that.user.userID).once("value", function (snapshot) {
      //    that.backdrop = snapshot.exists();
      //    console.log("backdrop",that.backdrop);
      //  })
      //});
      //    .once("value", function (snapshot) {
      //  that.backdrop = snapshot.exists();
      //  console.log("backdrop",that.backdrop);
      //})
    }
    else {
      firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(that.subgroupID).once('value', function(subgroups){
        if (subgroups.val()[subgroup]['membership-type'] == 1) {
          that.isOwner = true;
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = that.adminOf || 'Subgroup';
        } else if (subgroups.val()[subgroup]['membership-type'] == 2) {
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = that.adminOf || 'Subgroup';
        } else if (subgroups.val()[subgroup]['membership-type'] == 3) {
          that.isMember = true;
        }
      });
    }

    function clearDiv() {
      var div = document.getElementById("firepad");
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
    }

    that.gotoDocument = function(openDoc) {
      if (that.subgroupID) {
        $state.go("user.group.subgroup-collaborator", {
          groupID: that.groupID,
          subgroupID: that.subgroupID,
          docID: openDoc.$id
        });
        that.allUsers = $firebaseObject(firepadRef.child("firepad-subgroups-rules/"+that.groupID+"/"+that.subgroupID+'/'+$stateParams.docID+"/allUsers")).$value;
      } else {
        $state.go("user.group.collaborator", {
          groupID: that.groupID,
          docID: openDoc.$id
        });
        that.allUsers = $firebaseObject(firepadRef.child("firepad-groups-rules/"+that.groupID+"/"+$stateParams.docID+"/allUsers"));
      }

      that.allUsers.$loaded(function(){
        console.log(openDoc.$id,that.allUsers)
      });
    };


    function initiateFirepad(refArgument, arg) {
      var codeMirror = CodeMirror(document.getElementById('firepad'), {
        lineNumbers: that.mode == "Rich Text" ? false : true,
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
        if (arg) {
          that.document = $stateParams.docID;
        }
      })
    }


    that.toggleAllUser = function(val){
     var firepadRef = new Firebase(ref);
      var obj;
      if (that.subgroupID) {
        obj = $firebaseObject(firepadRef.child("firepad-subgroups-rules/"+that.groupID+"/"+that.subgroupID+'/'+$stateParams.docID+"/allUsers"));
      }
      else {
        obj = $firebaseObject(firepadRef.child("firepad-groups-rules/"+that.groupID+"/"+$stateParams.docID+"/allUsers"));
      }
      obj.$value = val;
      obj.$save();
    };

        that.checkboxClicked = function (userStatus,user) {
          console.log("called");
          if(userStatus){
            user.id == that.createdBy.userID ? userStatus = 1 : userStatus = 2;
          }
          else {
            user.id == that.createdBy.userID ? userStatus = 1 : userStatus = null;
          }
          that.admins.forEach(function (admin) {
            if(admin.$id == user.id){
              userStatus = 1
            }
          });
          console.log(user);
            firepadRef = new Firebase(ref);
            var updateDocument = {};
            if(that.subgroupID){
              updateDocument["firepad-subgroups-access/"+that.groupID+"/"+that.subgroupID+'/'+$stateParams.docID+'/'+ user.id] = userStatus;
              //that.allUsers = $firebaseObject(firepadRef.child("firepad-subgroups-rules/"+that.groupID+"/"+that.subgroupID+'/'+$stateParams.docID+"/allUsers")).$value;
              firepadRef.update(updateDocument,function(err){
                if(err){
                  console.log(err);
                }
              })
            }
            else {
              updateDocument["firepad-groups-access/"+that.groupID+'/'+$stateParams.docID+'/'+ user.id] = userStatus;
              //that.allUsers = $firebaseObject(firepadRef.child("firepad-groups-rules/"+that.groupID+"/"+$stateParams.docID+"/allUsers"));
              firepadRef.update(updateDocument,function(err){
                if(err){
                  console.log(err);
                }
              })
            }
        console.log(that.allUsers);
      // that.backdrop = userStatus;
      // console.log(that.permission[user]);
    };
    that.createDocument = function() {
      var firebaseLocalRef;
      var updateDocument = {};
      that.showLoader = true;
      that.createdBy = {
        firstName: that.user.firstName,
        lastName: that.user.lastName,
        userID: that.user.userID,
        imgUrl: $rootScope.userImg || ""
      };

      if (that.subgroupID) {
        CollaboratorService.CreateDocument(that.documentTitle, that.groupID, that.subgroupID, that.documentType, that.user)
          .then(function(response) {
            if (response.status) {
              $state.go("user.group.subgroup-collaborator", {
                groupID: that.groupID,
                subgroupID: that.subgroupID,
                docID: response.docId
              });
            }
          });
      } else {
        CollaboratorService.CreateDocument(that.documentTitle, that.groupID, that.subgroupID, that.documentType, that.user)
          .then(function(response) {
            if (response.status) {
              $state.go("user.group.collaborator", {
                groupID: that.groupID,
                docID: response.docId
              });
            }
          });
      }
    };

    that.channelBottomSheetfunc = function() {
      if (that.channelBottomSheet)
        that.channelBottomSheet = false;
      else
        that.channelBottomSheet = true;
    };
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
      CollaboratorService.setCurrentDocumentId(that.currentDocument);
      that.groupID = $stateParams.groupID;
      that.user = userService.getCurrentUser();
      that.users = dataService.getUserData();
      console.log("All Users:", that.users);
      that.activeTitle = "Collaborator";
      // that.groupMembers = CollaboratorService.getGroupMembers(that.groupID);
      // console.log(that.groupMembers);
      if ($stateParams.docID) {
        if (that.subgroupID) {
          that.documents = $firebaseArray(globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID));
          globalRef = new Firebase(ref).child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID); //this will be the user created documents
        } else {
          that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
          globalRef = new Firebase(ref).child("firepad-groups/" + that.groupID).child($stateParams.docID);
        }
        globalRef.once('value', function(snapshot) {
          that.document = snapshot.val().title;
          that.createdBy = snapshot.val().createdBy;
          that.mode = snapshot.val().type;
          that.isNormal = that.mode == "Rich Text" ? true : false;
          initiateFirepad(globalRef);
          permissions();
        });
      }

      // that.allUsers = false;
      that.history = $firebaseArray(globalRef.child("history").limitToLast(300));
    }

   /* function getUserPermissions(userID) {
      //var defered = $q.defer();

      // firepadRef.once("value",function(snapshot){
      //   if(that.allUsers){
      //     that.backdrop = true;
      //   }
      // });
      //$firebaseArray(firepadRef).$loaded().then(function(arr) {
      //    cb(arr);
      //  })
      return firepadRef;
        // return $firebaseArray(firepadRef);
    }*/

    function permissions() {
      that.permissionObj = {};
      var firepadPermissions = new Firebase(ref);
      if (that.subgroupID) {
        firepadRef = firepadPermissions.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID);
        console.log(firepadRef.toString());
      } else {
        firepadRef = firepadPermissions.child("firepad-groups-rules").child(that.groupID).child($stateParams.docID);
        console.log(firepadRef.toString());
      }

      firepadRef.once('value', function(snapshot) {
        that.allUsers = snapshot.val().allUsers;
        if (!that.allUsers) {
          var firepadPermissions = new Firebase(ref);
          if (that.subgroupID){
            firepadPermissions.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID+'/'+that.user.userID).once("value", function (snapshot) {
              that.backdrop = snapshot.exists();
              console.log("backdrop",that.backdrop);
            });
            $firebaseArray(firepadPermissions.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID)).$loaded().then(function (data) {
              that.permission = data;
              console.log("permissions:",that.permission);
              that.permission.forEach(function(val){
                that.permissionObj[val.$id] = true;
              });
            })
          }
          else{
            firepadPermissions.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID+'/'+that.user.userID).once("value", function (snapshot) {
                that.backdrop = snapshot.exists();
              console.log("backdrop",that.backdrop);
            })
            $firebaseArray(firepadPermissions.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID)).$loaded().then(function (data) {
              that.permission = data;
              console.log("permissions:",that.permission);
              console.log("permissions:",that.permission[0]["$id"]);
              that.permission.forEach(function(val){
                that.permissionObj[val.$id] = true;
              });
              console.log(that.permissionObj);
            })
          }





            //console.log(that.permission);
            //console.log(that.permission[0].$id);
            //that.permission.forEach(function(user){
            //  if(user.$id == that.user.userID)
            //    that.backdrop = true;
            //})
            // that.backdrop = that.permission[that.user.userID];
        } else {
          that.backdrop = true;
        }
      })

    }
  }
})();
