(function () {
    'use strict';
    angular
        .module('app.createGroup')
        .controller('CreateGroupController', ['messageService','$http', '$rootScope', 'firebaseService','$firebaseObject', '$location', 'createGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', 'appConfig', '$q', CreateGroupController]);

    function CreateGroupController(messageService,$http, $rootScope, firebaseService,$firebaseObject, $location, createGroupService, userService, authService, $timeout, utilService, $mdDialog, appConfig, $q) {


        $rootScope.newImg = '';

        /*private variables*/

        var that = this;
        var user = userService.getCurrentUser();
        var fileUrl;
        var ownerImg;
        $firebaseObject (firebaseService.getRefUsers().child(userService.getCurrentUser().userID).child('profile-image'))
            .$loaded()
            .then(function(img){
                ownerImg = img.$value
            })


        /*VM functions*/
        this.groupPath = '';
        this.queryUsers = queryUsers;
        this.answer = answer;
        this.hide = hide;


        /*VM properties*/
        this.filteredUsers = [];
        this.group = {
            groupID: "",
            title: "",
            desc: "",
            members: "",
            membersArray: [],
            signupMode : "2",
            address: '',
            phone: ''
        };
        this.group.timeZone = getTiemZoneOffset()

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
            createGroupService.cancelGroupCreation();
        }



        this.saveFile = function (file, type, groupID) {
            var defer = $q.defer();

            var xhr = new XMLHttpRequest();
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?groupID=" + groupID + "&file_type=" + type);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(upload_file(file, response.signed_request, response.url));
                    }
                    else {
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
            xhr.onload = function (data) {
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded....')
                    that.group.imgLogoUrl = url + '?random=' + new Date();
                    defer.resolve(url)

                }
            };
            xhr.onerror = function (error) {
                defer.reject( messageService.showSuccess("Could not upload file."));
            };
            xhr.send(file);
            return defer.promise;
        }


        function answer(groupForm) {
            var allowedDomain = {};
            var fromDataFlag;
            //return if form has invalid model.
            if (groupForm.$invalid) {
                return;
            }
            that.group.ownerImgUrl = ownerImg || 'https://s3-us-west-2.amazonaws.com/defaultimgs/user.png'
            that.group.members = that.group.membersArray.join();
            if (that.group.domain) {
                that.group.allowedDomain = {}

                var temp = that.group.domain.split(',');
                temp.forEach(function (el, i) {
                    that.group.allowedDomain[i] = el;
                })

            }
            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                that.saveFile(x, mimeType, that.group.groupID).then(function (data) {
                    createGroupService.createGroup(that.group, fromDataFlag,groupForm, function(){
                        $location.path('/user/'+ user.userID);    
                    })
                })
                .catch(function () {
                    groupForm.$submitted = false;
                    return  messageService.showSuccess('picture upload failed')
                });
            } else {
                fromDataFlag = false;
                createGroupService.createGroup(that.group, fromDataFlag,groupForm, function(){
                    $location.path('/user/'+ user.userID);
                });
            }

        }




            this.selectFile = function (_this) {
                var file = _this.files[0];
                //console.log(file.name);

            };

            this.signupModeDisabled = function (val) {
                return val === '3'
            };

            //Cropper Code start
            this.showAdvanced = function (ev) {
                $mdDialog.show({
                    controller: "DialogController as ctrl",
                    templateUrl: 'directives/dilogue1.tmpl.html',
                    targetEvent: ev
                }).then(function (picture) {
                    $rootScope.newImg = picture;
                    // console.log("this is image" + picture)
                }, function (err) {
                    console.log(err)

                })

            };


            //Cropper Code End

            this.canActivate = function () {
                return authService.resolveUserPage();
            }


        }
    function getTiemZoneOffset () {
        return ' +' + (new Date().getTimezoneOffset()/60)* -1 + ':' + '00';
    }
        function DialogController($mdDialog) {
            this.my = {model: {img: ''}};
            this.hide = function (picture) {
                //console.log(picture)
                $mdDialog.hide(picture);
            };


        }
}

)();
