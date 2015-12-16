/**
 * Created by sj on 6/10/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.subgroup')
        .controller('SubgroupController', ['$rootScope', 'messageService', '$stateParams', '$localStorage', 'groupFirebaseService', 'firebaseService', '$location', 'createSubGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', '$mdSidenav', '$mdUtil', '$q', 'appConfig', SubgroupController])
        //  .controller("DialogController", ["$mdDialog", DialogController]);
    function SubgroupController($rootScope, messageService, $stateParams, $localStorage, groupFirebaseService, firebaseService, $location, SubGroupService, userService, authService, $timeout, utilService, $mdDialog, $mdSidenav, $mdUtil, $q, appConfig) {
        /*private variables*/
        var that = this;
        var user = userService.getCurrentUser();


        var localStorage = $localStorage.loggedInUser;
        var groupID = $stateParams.groupID;
        this.groupid = groupID;
        /*VM functions*/
        this.groupPath = '';
        this.queryUsers = queryUsers;
        this.answer = answer;
        this.hide = hide;
        this.saveFile = saveFile
        this.upload_file = upload_file
        this.selectedMemberArray = [];
        this.selectedAdminArray = [];
        this.filterUser = filterUser;
        this.filterUser2 = filterUser2;


        /*VM properties*/
        this.filteredUsers = [];
        this.Subgroup = {
            subgroupID: "",
            title: "",
            desc: "",
            members: "",
            membersArray: []

        };
        this.openUserSettingPage = function() {
            $location.path('/user/group/' + groupID + '/user-setting');
        };
        this.openEditGroup = function() {
            $location.path('user/group/' + groupID + '/edit-group');
        }

        //query for users names list
        function queryUsers(val) {
            if (val) {
                var filteredUsersRef = firebaseService.getRefUsers()
                    .orderByKey()
                    .startAt(val)
                    .endAt(val + '~');

                that.filteredUsers = Firebase.getAsArray(filteredUsersRef);
            } else {
                that.filteredUsers = [];
            }
        }

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
                console.log("this is image" + picture)
            }, function(err) {
                console.log(err)

            })

        };



        this.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync(groupID, localStorage.userID)
            .then(function(syncObj) {
                that.groupSyncObj = syncObj;
                // that.groupSyncObj.groupSyncObj.$bindTo(that, "group");
                that.group = that.groupSyncObj.groupSyncObj;
                that.members = that.groupSyncObj.membersSyncArray;
                that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                that.pendingRequests = that.groupSyncObj.pendingMembershipSyncArray;
                that.activities = that.groupSyncObj.activitiesSyncArray;


            });
        this.selectedMember = function(userObj) {
            console.log(userObj);
            console.log("-----------------------------------");
            this.selectedMemberArray.push(userObj)
            that.Subgroup.membersArray.push(userObj.$id);
            this.Subgroup.members = this.Subgroup.membersArray;
        };
        this.selectedAdmin = function(newType, member) {
            console.log(member.userSyncObj.$id);
            console.log(member.user.profile.firstName);
            this.selectedAdminArray.push(member.user.profile)


        };

        function filterUser(userID) {
            var disableItem = false;
            for (var i = 0; i < that.members.length; i++) {
                if (userID === localStorage.userID) {
                    disableItem = true;
                } else if (that.Subgroup.membersArray.indexOf(userID) >= 0) {
                    disableItem = true;
                }
            }

            return disableItem;
        }

        function filterUser2(userID) {
            var disableItem = false;
            for (var i = 0; i < that.members.length; i++) {
                if (that.Subgroup.membersArray.indexOf(userID) >= 0) {
                    disableItem = true;
                }
            }

            return disableItem;
        }

        function answer(groupForm) {

            var fromDataFlag;
            that.abc = true;
            //return if form has invalid model.
            if (groupForm.$invalid) {
                return;
            }

            that.Subgroup.members = that.Subgroup.membersArray.join();
            //if ($rootScope.croppedImage && $rootScope.croppedImage.src) {
            if ($rootScope.newImg) {

                var x = utilService.base64ToBlob($rootScope.newImg);

                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                that.saveFile(x, mimeType, this.Subgroup.subgroupID).then(function(data) {
                        console.log('subgroup img  uploaded ' + data)
                        SubGroupService.createSubGroup(localStorage.userID, that.group, that.Subgroup, that.subgroups, fromDataFlag, groupID)
                            //  $location.path('/user/group/'+groupID);
                    })
                    .catch(function() {

                        return alert('picture upload failed')
                    });
                console.log(x);
            } else {
                fromDataFlag = false;
                SubGroupService.createSubGroup(localStorage.userID, that.group, that.Subgroup, that.subgroups, fromDataFlag, groupID)
                    //$location.path('/user/group/'+groupID);
            }
        }

        function saveFile(file, type, groupID) {
            var defer = $q.defer();

            var xhr = new XMLHttpRequest();

            //xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?file_name="+ groupID + '_'+that.Subgroup.subgroupID + "." + type.split('/')[1]+ "&file_type=" + type);
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?groupID=" + groupID + '&subgroupID' + that.Subgroup.subgroupID + "&file_type=" + type);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(that.upload_file(file, response.signed_request, response.url));
                    } else {
                        defer.reject(alert("Could not get signed URL."))
                    }
                }
            };
            xhr.send();
            return defer.promise;
        }


        this.signupModeDisabled = function(val) {
            return val === '3'
        }

        //Cropper Code start
        this.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue1.tmpl.html',
                targetEvent: ev
            }).then(function(picture) {
                $rootScope.newImg = picture;
                console.log("this is image" + picture)
            }, function(err) {
                console.log(err)

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
                        console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFn;
        };

        function AdminToggler(navID) {
            var debounceFnc = $mdUtil.debounce(function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        console.log("toggle " + navID + " is done");
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
                // alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded....')
                    console.log(url);
                    //document.getElementById("preview").src = url;
                    that.Subgroup.imgLogoUrl = url + '?random=' + new Date();
                    defer.resolve(url)
                        //document.getElementById("avatar_url").value = url;
                }
            };
            xhr.onerror = function(error) {
                defer.reject(alert("Could not upload file."));
            };
            xhr.send(file);
            return defer.promise;
        }
        this.close = function() {
            $mdSidenav('right').close()
                .then(function() {
                    console.log("close LEFT is done");
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
            console.log("dialog box pic" + picture)
            $mdDialog.hide(picture);
        };


    }

})();
