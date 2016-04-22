/**
 * on 2/02/2016.
 */
(function() {
  'use strict';
  function findWithAttr(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i][attr] === value) {
            return i;
          }
        }
        return -1;
      }
  angular.module('app.collaborator')
    // .constant("ref", "https://luminous-torch-4640.firebaseio.com/")
    .filter('collaboratorUsers', function() {
      return function(users, groupID) {
        var filteredUsers = [];
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


    })


    .controller('CollaboratorController', ['firebaseService', "$firebaseArray", 'FileSaver', 'Blob', 'groupService', '$stateParams', 'userService', 'dataService', 'messageService', '$timeout', '$scope', '$state', '$firebaseObject', '$rootScope', 'CollaboratorService', '$q','$document', collaboratorFunction]);


  function collaboratorFunction(firebaseService, $firebaseArray, FileSaver, Blob, groupService, $stateParams, userService, dataService, messageService, $timeout, $scope, $state, $firebaseObject, $rootScope, CollaboratorService, $q,$document) {

    var globalRef = firebaseService.getRefMain();

    // componentHandler.upgradeAllRegistered();
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
    }, ];
    that.documentType = "Rich Text";
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
    that.permissionObj = {};
    that.permissionMembers = {};
    that.allUsers;
    var editorExists = false;
    that.Editors = []

    init();
    $firebaseArray(firebaseService.getRefGroupMembers().child(that.groupID)).$loaded().then(function(data) {
      data.forEach(function(member) {
        if (member["membership-type"] == 1 || member["membership-type"] == 2) {
          that.admins.push(member);
          that.permissionMembers[member.$id] = true;
        }
      });
    });

    if (!that.subgroupID) {

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


    } else {
      firebaseService.getRefUserSubGroupMemberships().child(that.user.userID).child(that.groupID).child(that.subgroupID).once('value', function(subgroups) {
        if (subgroups.val()['membership-type'] == 1) {
          that.isOwner = true;
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = that.adminOf || 'Subgroup';
        } else if (subgroups.val()['membership-type'] == 2) {
          that.isAdmin = true;
          that.isMember = true;
          that.adminOf = that.adminOf || 'Subgroup';
        } else if (subgroups.val()['membership-type'] == 3) {
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
    //   firepadRef = new Firebase(ref);
      if (that.subgroupID) {
        $state.go("user.group.subgroup-collaborator", {
          groupID: that.groupID,
          subgroupID: that.subgroupID,
          docID: openDoc.$id
        });
        // that.allUsers = $firebaseObject(globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + "/allUsers")).$value;
        // console.log(globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + "/allUsers").toString());
      } else {
        $state.go("user.group.collaborator", {
          groupID: that.groupID,
          docID: openDoc.$id
        });
        // that.allUsers = $firebaseObject(globalRef.child("firepad-groups-rules/" + that.groupID + "/" + $stateParams.docID + "/allUsers"));
      }

      // that.allUsers.$loaded(function() {
      // });
    };


    function initiateFirepad(refArgument, arg) {
      var codeMirror = CodeMirror(document.getElementById('firepad'), {
        lineNumbers: that.mode == "Rich Text" ? false : true,
        mode: that.mode,
        lineWrapping: true
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
        firepad.setUserId(that.user.userID);
        firepad.setUserColor("#ccccc");
        that.showLoader = false;
        if (arg) {
          that.document = $stateParams.docID;
        }
      })
    }


    that.toggleAllUser = function(val) {
    //   var firepadRef = new Firebase(ref);
      var obj;
      if (that.subgroupID) {
        obj = $firebaseObject(globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + "/allUsers"));
      } else {
        obj = $firebaseObject(globalRef.child("firepad-groups-rules/" + that.groupID + "/" + $stateParams.docID + "/allUsers"));
      }
      obj.$value = val;
      obj.$save();
    };

    that.checkboxClicked = function(userStatus, user) {
      if (userStatus) {
        user.id == that.createdBy.userID ? userStatus = 1 : userStatus = 2;
      } else {
        user.id == that.createdBy.userID ? userStatus = 1 : userStatus = null;
      }
      that.admins.forEach(function(admin) {
        if (admin.$id == user.id) {
          userStatus = 1
        }
      });
    //   firepadRef = new Firebase(ref);
      var updateDocument = {};
      if (that.subgroupID) {
        updateDocument["firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID + '/' + user.id] = userStatus;
        globalRef.update(updateDocument, function(err) {
          if (err) {
          }
        })
      } else {
        updateDocument["firepad-groups-access/" + that.groupID + '/' + $stateParams.docID + '/' + user.id] = userStatus;
        globalRef.update(updateDocument, function(err) {
          if (err) {
          }
        })
      }
    };
    that.createDocument = function() {
    //   var firebaseLocalRef;
    //   var updateDocument = {};
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

   function createClickEvent(node,type,callback){
    //    node.addEventListener(type, myFunc,true);
    //    function myFunc() {
    //        that.channelBottomSheet = false;
    //        document.body.removeEventListener('click', myFunc,true)
    //     }
    $('body').click(function(evt){
       if(evt.target.id == "channelBottomSheet")
          return;
          if(evt.target.id == "fabButton")
          return;
          if($(evt.target).closest('#fabButton').length)
          return;
       //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
       if($(evt.target).closest('#channelBottomSheet').length)
          return;
       console.log(evt.target);
        that.channelBottomSheet = false;
      //Do processing of click event here for every element except with id menu_content
    });
   }
     createClickEvent(document.body,'click');

    that.channelBottomSheetfunc = function() {
        // createClickEvent(document.body,'click');
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
      }

    };

    that.filterTeams = function(player) {
      var teamIsNew = indexedTeams.indexOf(player.team) == -1;
      if (teamIsNew) {
        indexedTeams.push(player.team);
      }
      return teamIsNew;
    };


    function backdropPermission() {
      if (that.subgroupID) {
        globalRef.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
          that.backdrop = snapshot.exists();
          that.permissionObj[that.user.userID] = snapshot.exists();
        });
      } else {
        globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
          that.backdrop = snapshot.exists();
          that.permissionObj[that.user.userID] = snapshot.exists();
        });
      }

    }

    function init() {

      groupService.setActivePanel('collaborator');
      groupService.setSubgroupIDPanel($stateParams.subgroupID);
      that.subgroupID = $stateParams.subgroupID || '';
      that.currentDocument = $stateParams.docID;
      CollaboratorService.setCurrentDocumentId(that.currentDocument);
      that.groupID = $stateParams.groupID;
      that.user = userService.getCurrentUser();
      that.users = dataService.getUserData();
      that.activeTitle = "Collaborator";
      var localRef = globalRef;
      // that.groupMembers = CollaboratorService.getGroupMembers(that.groupID);
      if ($stateParams.docID) {
        if (that.subgroupID) {
          that.documents = $firebaseArray(globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID));
          localRef = globalRef.child("firepad-subgroups/" + that.groupID + "/" + that.subgroupID).child($stateParams.docID); //this will be the user created documents
          globalRef.child('firepad-subgroups-access/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).on('child_added', function(snapshot) {
            backdropPermission();
          });
          globalRef.child('firepad-subgroups-access/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).on('child_removed', function(snapshot) {
            backdropPermission();
            angular.element(document).find("firepad").blur();
          });
          globalRef.child('firepad-subgroups-rules/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).on('child_changed', function(snapshot) {
            that.backdrop = that.allUsers = snapshot.val();
            if(!that.allUsers){
              globalRef.child('firepad-subgroups-access/' + that.groupID + "/" + that.subgroupID + '/' + $stateParams.docID).once('value', function(snapshot) {
              backdropPermission();
            });
            }
          });
        } else {
          that.documents = $firebaseArray(globalRef.child("firepad-groups/" + that.groupID));
          localRef = globalRef.child("firepad-groups/" + that.groupID).child($stateParams.docID);
          globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID).on('child_added', function(snapshot) {
            backdropPermission();
          });
          globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID).on('child_removed', function(snapshot) {
            backdropPermission();
            angular.element(document).find("firepad").blur();
          });
          globalRef.child('firepad-groups-rules/' + that.groupID + '/' + $stateParams.docID).on('child_changed', function(snapshot) {
            that.backdrop = that.allUsers = snapshot.val();
            if(!that.allUsers){
                $firebaseObject(globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID)).$loaded(function(response){
                    console.log(response);
                    that.permissionObj = {};
                    response.forEach(function(element,item){
                        console.log("Element:", element + "," + item);
                        that.permissionObj[item] = true;

                    })
                })
            //   globalRef.child('firepad-groups-access/' + that.groupID + '/' + $stateParams.docID).once('value', function(snapshot) {
            // //   backdropPermission();
            //     console.log(snapshot);
            // });
            }
            else {
                that.users.forEach(function(user) {
                    if (user.groupID == that.groupID) {
                        if (!that.permissionObj[user.id]) {
                            that.permissionObj[user.id] = true;
                        }
                    }
                });
            }

          });

        }
        localRef.once('value', function(snapshot) {
          that.document = snapshot.val().title;
          that.createdBy = snapshot.val().createdBy;
          that.mode = snapshot.val().type;
          that.isNormal = that.mode == "Rich Text" ? true : false;
          console.log("localRef",localRef.toString())
          initiateFirepad(localRef);
          permissions();
        });
        that.history = $firebaseArray(localRef.child("history").limitToLast(300));
      }

      localRef.child('history').on('child_added',function(snapshot){
        addEditor(snapshot.val());
      })
    }


function editTimestamp(user) {
  for (var i = 0; i < that.Editors.length; i++) {
    if(that.Editors[i].id == user.a){
      that.Editors[i].timestamp = user.t;
      // editorExists = false;
    }
  }
}
function addEditor(snapshot){
    angular.forEach(that.Editors,function(item){
      if(item.id == snapshot.a){
        editorExists = true;
        editTimestamp(snapshot);
      }
    })
  if(!editorExists){
    userService.getUserProfile(snapshot.a,function(user){
      angular.forEach(that.Editors,function(item){
        if(item.id == snapshot.a){
          editorExists = true;
          editTimestamp(snapshot);
        }
      })
      if(!editorExists){
        that.Editors.push({
          id: snapshot.a,
          timestamp: snapshot.t,
          name : user.firstName + " " + user.lastName,
          img: user['profile-image'] != undefined ? user['profile-image'] : ""
        })
      }
      })
  }
  else {
    editorExists = false;
  }
  console.log("that.Editors:", that.Editors);
}
// that.EditorDetails = function(userId) {
//    console.log(userId);
// }


    function userAccessToggles() {
         that.users.forEach(function(user) {
             if (user.groupID == that.groupID) {
                 if (!that.permissionObj[user.id]) {
                     that.permissionObj[user.id] = true;
                     }
              }
        });
    }

    function permissions() {

      var firepadRef = "";
      if (that.subgroupID) {
        firepadRef = globalRef.child("firepad-subgroups-rules/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID);
      } else {
        firepadRef = globalRef.child("firepad-groups-rules").child(that.groupID).child($stateParams.docID);
      }

      firepadRef.once('value', function(snapshot) {
        that.allUsers = snapshot.val().allUsers;
        if (!that.allUsers) {
        //   var firepadPermissions = new Firebase(ref);
          if (that.subgroupID) {
            globalRef.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
              that.backdrop = snapshot.exists();
            });
            $firebaseArray(globalRef.child("firepad-subgroups-access/" + that.groupID + "/" + that.subgroupID + "/" + $stateParams.docID)).$loaded().then(function(data) {
              that.permission = data;
              that.permission.forEach(function(val) {
                that.permissionObj[val.$id] = true;
              });
            })
          } else {
            globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID + '/' + that.user.userID).once("value", function(snapshot) {
              that.backdrop = snapshot.exists();
            })
            $firebaseArray(globalRef.child("firepad-groups-access/" + that.groupID + "/" + $stateParams.docID)).$loaded().then(function(data) {
              that.permission = data;
              that.permission.forEach(function(val) {
                that.permissionObj[val.$id] = true;
              });
            })
          }

          //  if(user.$id == that.user.userID)
          //    that.backdrop = true;
          //})
          // that.backdrop = that.permission[that.user.userID];
        } else {
          that.backdrop = true;
          userAccessToggles();
        }
      })

    }
  }
})();
