/**
 * Created by sj on 6/10/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.createSubGroup')
        .controller('CreateSubGroupController', ['$firebaseArray', 'checkinService', 'subgroupFirebaseService', '$rootScope', 'messageService', '$firebaseObject', '$stateParams', '$localStorage', 'groupFirebaseService', 'firebaseService', '$location', 'createSubGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', '$mdSidenav', '$mdUtil', '$q', 'appConfig', CreateSubGroupController])
        .controller("DialogController", ["$mdDialog", DialogController]);

    function CreateSubGroupController($firebaseArray, checkinService, subgroupFirebaseService, $rootScope, messageService, $firebaseObject, $stateParams, $localStorage, groupFirebaseService, firebaseService, $location, createSubGroupService, userService, authService, $timeout, utilService, $mdDialog, $mdSidenav, $mdUtil, $q, appConfig) {


        $rootScope.croppedImage = {};
        //debugger;
        /*private variables*/
        var that = this;
        var user = userService.getCurrentUser();
        $rootScope.newImg = '';
        this.teamsettingpanel = false;
        var localStorage = $localStorage.loggedInUser;
        var groupID = $stateParams.groupID;
        var groupData = subgroupFirebaseService.getFirebaseGroupObj(groupID)
            /*VM functions*/
            // this.searchUser = '';
            // this.processTeamAttendance =false;
            // this.showEditSubGroup = false;
        this.groupid = groupID;
        this.activeID;
        this.subgroupData = 0;
        this.answer = answer;
        this.hide = hide;
        this.saveFile = saveFile
        this.upload_file = upload_file
        this.selectedMemberArray = [];
        this.selectedAdminArray = [];
        this.membersArray = [];
        var SubgroupObj;
        this.selectedindex = undefined;
        this.selectedindex2 = 0;
        this.filterUser = filterUser;
        this.filterUser2 = filterUser2;
        this.submembers = 0;
        this.closeToggleAdmin = closeToggleAdmin
        this.closeAdminToggler = closeAdminToggler
        this.memberss = {
            memberIDs: "",
            selectedUsersArray: []

        };

        /*VM properties*/

        /*   this.Subgroup = {
         subgroupID: "",
         title: "",
         desc: "",
         members: "",
         membersArray: []

         };*/


        this.openUserSettingPage = function() {
            $location.path('/user/group/' + groupID + '/user-setting');
        };
        this.openEditGroup = function() {
            $location.path('user/group/' + groupID + '/edit-group');
        }
        this.openGeoFencingPage = function() {
            $location.path('/user/group/' + groupID + '/geoFencing');
        };
        this.subgroupPage = function() {
            $location.path('user/group/' + this.groupid + '/subgroup');
        }

        this.veiwSubgroup = function(subgroupData, index) {

            that.teamsettingpanel = true;
            // this.showEditSubGroup = true;
            // that.showTeamAttendace = false;
            that.selectedindex = index;
            that.activeID = subgroupData.$id;
            var sub = subgroupFirebaseService.getSubgroupSyncObjAsync(groupID, that.activeID, localStorage.userID)
                .then(function(syncObj) {
                    that.subgroupSyncObj = syncObj;

                    //console.log(data === obj); // true
                    // $scope.subgroupSyncObj.subgroupSyncObj.$bindTo($scope, "subgroup");


                    that.submembers = that.subgroupSyncObj.membersSyncArray;
                    // $scope.subgroups = $scope.subgroupSyncObj.subgroupsSyncArray;
                    //$scope.pendingRequests = $scope.subgroupSyncObj.pendingMembershipSyncArray;
                    //$scope.activities = $scope.subgroupSyncObj.activitiesSyncArray;
                    //$scope.groupMembersSyncArray = $scope.subgroupSyncObj.groupMembersSyncArray;

                })
            SubgroupObj = $firebaseObject(firebaseService.getRefSubGroups().child(groupID).child(that.activeID));
            // console.log(1)
            // console.log(SubgroupObj)
            SubgroupObj.$loaded().then(function(data) {
                $timeout(function() {
                        that.subgroupData = data;
                        //that.group.groupID = data.$id;
                        that.img = data['logo-image'] && data['logo-image'].url ? data['logo-image'].url : ''

                    })
                    // console.log(2)
                    // console.log(SubgroupObj)
            })


        };


        //cancels create group modal
        function hide() {
            /*   createGroupService.cancelGroupCreation();*/
            /* $mdDialog.cancel();*/
            $rootScope.newImg = null;
            $location.path('/user/group/' + groupID);

        }


        this.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue1.tmpl.html',
                targetEvent: ev
            }).then(function(picture) {
                $rootScope.newImg = picture;
                //console.log("this is image" + picture)
            }, function(err) {
                //console.log(err)

            })

        };


        this.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync(groupID, localStorage.userID)
            .then(function(syncObj) {
                $timeout(function() {

                    that.groupSyncObj = syncObj;
                    // that.groupSyncObj.groupSyncObj.$bindTo(that, "group");
                    that.group = that.groupSyncObj.groupSyncObj;
                    that.members = that.groupSyncObj.membersSyncArray;
                    that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                    that.pendingRequests = that.groupSyncObj.pendingMembershipSyncArray;
                    that.activities = that.groupSyncObj.activitiesSyncArray;
                    // that.veiwSubgroup(that.subgroups[0])
                    ;
                });


            });


        this.selectedMember = function(userObj, index) {
            that.selectedindex2 = index;
            // console.log(userObj);
            // console.log("-----------------------------------");
            //this.selectedMemberArray.push(userObj)
            // that.membersArray.push(userObj.$id);
            //that.subgroupData.members=that.membersArray;
            // that.subgroupData.members =that.membersArray.join();
            that.memberss.selectedUsersArray.push(userObj.$id)
            that.memberss.memberIDs = that.memberss.selectedUsersArray.join();
            var membersArray = that.memberss.memberIDs.split(',');

            var subgroupObj = angular.extend({}, that.subgroupSyncObj.subgroupSyncObj, {
                groupID: groupID,
                subgroupID: that.activeID
            });

            subgroupFirebaseService.asyncUpdateSubgroupMembers(localStorage, subgroupObj, that.memberss.memberIDs, that.subgroupSyncObj.membersSyncArray, groupData)
                .then(function(response) {
                    // console.log("Adding Members Successful");
                    var unlistedMembersArray = response.unlistedMembersArray,
                        notificationString;

                    if (unlistedMembersArray.length && unlistedMembersArray.length === membersArray.length) {
                        notificationString = 'Adding Members Failed ( ' + unlistedMembersArray.join(', ') + ' ).';
                        messageService.showFailure(notificationString);
                    } else if (unlistedMembersArray.length) {
                        notificationString = 'Adding Members Successful, except ( ' + unlistedMembersArray.join(', ') + ' ).';
                        messageService.showSuccess(notificationString);
                    } else {
                        notificationString = 'Adding Members Successful.';
                        messageService.showFailure(notificationString);
                    }
                }, function(reason) {
                    messageService.showFailure(reason);
                });


        };
        this.selectedAdmin = function(newType, member) {
            // console.log(member.userSyncObj.$id);
            // console.log(member.user.profile.firstName);
            this.selectedAdminArray.push(member.user.profile)
            createSubGroupService.changeMemberRole(newType, member, groupID, that.activeID)
                .then(function() {
                    messageService.showSuccess("New Admin selected");
                }, function(reason) {
                    messageService.showFailure(reason);
                });


        };

        function filterUser(userID) {
            var disableItem = false;
            for (var i = 0; i < that.submembers.length; i++) {
                if (userID === that.submembers[i].userID) {
                    disableItem = true;
                } else if (that.membersArray.indexOf(userID) >= 0) {
                    disableItem = true;
                }
            }

            return disableItem;
        }

        function filterUser2(userID) {
            var disableItem = false;
            for (var i = 0; i < that.members.length; i++) {
                if (that.membersArray.indexOf(userID) >= 0) {
                    disableItem = true;
                }

            }
            return disableItem;
        }

        function answer(groupForm) {
            that.abc = true;
            var fromDataFlag;
            //return if form has invalid model.
            if (groupForm.$invalid) {
                return;
            }
            //if ($rootScope.croppedImage && $rootScope.croppedImage.src) {
            if ($rootScope.newImg) {

                var x = utilService.base64ToBlob($rootScope.newImg);

                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                that.saveFile(x, mimeType, that.subgroupData.$id).then(function(data) {
                        // console.log('subgroup img  uploaded ' + data)
                        // console.log(3)
                        // console.log(SubgroupObj)
                        SubgroupObj['logo-image'].url = data;
                        createSubGroupService.editSubgroup(that.subgroupData, SubgroupObj, groupID)
                            // $rootScope.newImg=null;
                        that.abc = false;
                    })
                    .catch(function(err) {
                        // return alert('picture upload failed' + err)
                        that.abc = false;
                        return messageService.showFailure('picture upload failed' + err)
                    });
                // console.log(x);
            } else {
                fromDataFlag = false;
                createSubGroupService.editSubgroup(that.subgroupData, SubgroupObj, groupID)
                that.abc = false;
            }
        }

        function saveFile(file, type, groupID) {
            var defer = $q.defer();
            //if(!that.group.groupID)return alert('Pleas provide group url firstt');
            //var groupID= that.group.groupID;
            var xhr = new XMLHttpRequest();

            //xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?file_name="+ groupID + '_' + that.subgroupData.$id + "." + type.split('/')[1]+ "&file_type=" + type);
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?groupID=" + groupID + '&subgroupID' + that.subgroupData.$id + "&file_type=" + type);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {

                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(that.upload_file(file, response.signed_request, response.url));
                    } else {
                        defer.reject(essageService.showFailure("Could not get signed URL."))
                    }
                }
            };
            xhr.send();
            return defer.promise;
        }


        //Cropper Code start
        this.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue1.tmpl.html',
                targetEvent: ev
            }).then(function(picture) {
                $rootScope.newImg = picture;
                // console.log("this is image" + picture)
            }, function(err) {
                //console.log(err)

            })

        };


        //Cropper Code End

        this.canActivate = function() {
            return authService.resolveUserPage();
        }


        // side navigation

        this.toggleRight = buildToggler('right');
        this.toggleAdmin = AdminToggler('rights');

        function buildToggler(navID) {
            var debounceFn = $mdUtil.debounce(function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        // console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFn;
        };

        function AdminToggler(navID) {
            var debounceFnc = $mdUtil.debounce(function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        // console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFnc;
        };

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function(data) {
                // alert(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded....')
                        // console.log(url);
                        //document.getElementById("preview").src = url;
                        // that.subgroupData.imgLogoUrl = url;
                    defer.resolve(url + '?random=' + new Date())
                        //document.getElementById("avatar_url").value = url;
                }
            };
            xhr.onerror = function(error) {
                defer.reject(messageService.showSuccess('Could not upload file.'));
            };
            xhr.send(file);
            return defer.promise;
        }

        that.OwnerRef = $firebaseObject(firebaseService.getRefGroups().child(groupID))
            .$loaded()
            .then(function(groupData) {

                if (groupData['group-owner-id']) {
                    //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                    that.picRef = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']) /*.child('profile-image')*/ )
                        .$loaded()
                        .then(function(userData) {

                            that.userObj = userData;

                        })

                }
            });

        function closeAdminToggler() {
            $mdSidenav('rights').close()
                .then(function() {
                    // console.log("close LEFT is done");
                });
        };

        function closeToggleAdmin() {
            $mdSidenav('right').close()
                .then(function() {
                    // console.log("close LEFT is done");
                });
        };
    }

    function DialogController($mdDialog) {
        this.my = {
            model: {
                img: ''
            }
        };
        this.hide = function(picture) {
            // console.log("dialog box pic" + picture)
            $mdDialog.hide(picture);
        };


    }
})();
