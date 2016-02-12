(function() {
    'use strict';
    angular
        .module('app.editGroup')
        .controller('EditGroupController', ['messageService', '$http', '$rootScope', 'firebaseService', '$state', '$location', 'editGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', 'appConfig', '$q', '$firebaseObject', '$stateParams', EditGroupController]);

    function EditGroupController(messageService, $http, $rootScope, firebaseService, $state, $location, editGroupService, userService, authService, $timeout, utilService, $mdDialog, appConfig, $q, $firebaseObject, $stateParams) {


        $rootScope.croppedImage = {};
        //debugger;
        /*private variables*/
        var that = this;
        var user = userService.getCurrentUser();
        var groupId = $stateParams.groupID;
        this.groupId = groupId;
        $rootScope.newImg = '';
        /*VM functions*/
        this.groupPath = '';
        this.queryUsers = queryUsers;
        this.answer = answer;
        this.hide = hide;
        this.submitProgress = false;



        /*VM properties*/
        this.filteredUsers = [];
        var groupObj = $firebaseObject(firebaseService.getRefGroups().child(groupId));
        groupObj.$loaded().then(function(data) {
            $timeout(function() {

                // console.log(data);
                that.group = data;
            //    that.group.signupMode = "2";

                //debugger
            })


        })

        this.openCreateSubGroupPage = function() {
            // $location.path('/user/group/' + groupId + '/create-subgroup');
            $state.go('user.create-subgroup', {groupID: groupId})
        }
        this.openUserSettingPage = function() {
            // $location.path('/user/group/' + groupId + '/user-setting');
            $state.go('user.user-setting', {groupID: groupId})
        };
        this.subgroupPage = function() {
            // $location.path('user/group/' + groupId + '/subgroup');
            $state.go('user.subgroup', {groupID: groupId})
        }

        this.openGeoFencingPage = function() {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.geo-fencing', {groupID: groupId})
        }
        this.openPolicyPage = function() {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.policy', {groupID: groupId})
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
            editGroupService.cancelGroupCreation(groupId);


        }
        var fileUrl;

        this.saveFile = function(file, type, groupID) {
            var defer = $q.defer();

            var xhr = new XMLHttpRequest();

            //xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?file_name="+ groupID + "." + type.split('/')[1]+ "&file_type=" + type);
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?groupID=" + groupID + "&file_type=" + type);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(upload_file(file, response.signed_request, response.url));
                    } else {
                        defer.reject(alert("Could not get signed URL."))
                    }
                }
            };
            xhr.send();
            return defer.promise;
        };

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function(data) {
                //alert(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded ....')
                    that.group['logo-image'].url = url || '';
                        //debugger
                    defer.resolve(url)
                }
            };
            xhr.onerror = function(error) {
                defer.reject(alert("Could not upload file."));
            };
            xhr.send(file);
            return defer.promise;
        }
        //answers create group modal and sends back some data modal.
        function answer(groupForm) {
            that.submitProgress = true;
            var fromDataFlag;
            //return if form has invalid model.
            if (groupForm.$invalid) {
                return;
                that.submitProgress = false;
            }
            //that.group.members = that.group.membersArray.join();
            if (that.group.domain) {
                var temp = that.group.domain.split(',');
                that.group.domain = temp
            }
            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                that.saveFile(x, mimeType, that.group.$id).then(function(data) {
                    editGroupService.editGroup(that.group, groupObj, groupForm, function(){
                        that.submitProgress = false;
                    })
                })
                .catch(function() {
                    groupForm.$submitted = false;
                    that.submitProgress = false;
                    return messageService.showFailure('picture upload failed')
                });


                //console.log(x);

            } else {

                editGroupService.editGroup(that.group, groupObj, groupForm, function(){
                    that.submitProgress = false;
                })

            }


        }

        /*haseeb works*/

        this.getTiemZoneOffset = function() {
            return new Date().getTimezoneOffset().toString()
        }


        this.signupModeDisabled = function(val) {
            return val === '3'
        }

        //Cropper Code start
        this.showAdvanced = function(ev) {
            $rootScope.tmpImg = $rootScope.newImg;
            $rootScope.newImg = '';
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue1.tmpl.html',
                targetEvent: ev,
                escapeToClose: false
            }).then(function(picture) {
                $rootScope.newImg = picture;
                // console.log("this is image" + picture)
            }, function(err) {
                // console.log(err)

            })

        };


        //Cropper Code End

        /*this.canActivate  = function(){
            return authService.resolveUserPage();
        }*/



    }


    function DialogController($mdDialog) {
        this.my = {
            model: {
                img: ''
            }
        };
        this.hide = function(picture) {
            // console.log(picture)
            $mdDialog.hide(picture);
        };


    };
})();
