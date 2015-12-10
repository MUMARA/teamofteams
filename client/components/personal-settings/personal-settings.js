(function () {
    'use strict';

    angular.module('app.personalSettings')
        .controller('PersonalSettingsController', ['$location','personalSettingsService', '$rootScope', '$mdDialog', '$firebaseArray', 'firebaseService', 'userService', 'utilService','$q','appConfig','$firebaseObject','$http','authService','$timeout','messageService',

            function ($location,personalSettingsService, $rootScope, $mdDialog, $firebaseArray, firebaseService, userService, utilService, $q,appConfig,$firebaseObject,$http,authService,$timeout,messageService) {

                /*Private Variables*/
                var that = this;
                var firstName,lastName;

                /*VM Properties*/
                this.showAdvanced = showAdvanced;
                this.answer = answer;
                this.hide = hide;
                this.loggedInUserData = userService.getCurrentUser();
                $rootScope.newImg = false;
                this.userData = $firebaseObject(firebaseService.getRefUsers().child(this.loggedInUserData.userID))
                this.userData.$loaded()
                    .then(function (data) {
                        firstName = data.firstName;
                        lastName = data.lastName;
                        // console.log(data)
                    })
                    .catch(function (err) {
                        console.log(err)
                    })

                /*VM Functions*/

                function answer(perSettingForm) {
                    var uploadFile,editUser,changePassword,data1,data2,pFlag,eFlag,imgFlag;
                    var promiseArray =[];
                  /*  if (perSettingForm.$invalid) {
                        return;
                    }*/

                    function saveDataToServer(){
                        if( that.userData.firstName != firstName || that.userData.lastName != lastName){
                            data1 = {
                                userID : that.userData.$id,
                                token : userService.getCurrentUser().token,
                                firstName : that.userData['firstName'],
                                lastName : that.userData['lastName']
                            };
                            eFlag = true;
                            editUser = $http.post(appConfig.apiBaseUrl + '/api/edituser',data1);
                        }

                        if(that.userData.oldPassword && that.userData.newPassword && that.userData.oldPassword != that.userData.newPassword ){
                            data2 = {
                                userID : that.userData.$id,
                                password : that.userData.oldPassword,
                                newPassword : that.userData.newPassword
                            };
                            pFlag = true;
                            changePassword = $http.post(appConfig.apiBaseUrl+'/api/changepassword',data2);
                        }else{
                            if(that.userData.oldPassword && that.userData.newPassword && that.userData.oldPassword == that.userData.newPassword ){
                                if (perSettingForm.oldPassword.$pristine)
                                    perSettingForm.oldPassword.$pristine = true;
                                if (perSettingForm.oldPassword.$dirty) {
                                    perSettingForm.oldPassword.$dirty = false;
                                }
                                messageService.showFailure('Passwords are same!');
                            }

                        }

                        if ($rootScope.newImg) {
                            var x = utilService.base64ToBlob($rootScope.newImg);
                            var temp = $rootScope.newImg.split(',')[0];
                            var mimeType = temp.split(':')[1].split(';')[0];
                            imgFlag = true
                            uploadFile = saveFile(x, mimeType, userService.getCurrentUser().userID);
                        }
                        eFlag ? promiseArray.push(editUser): promiseArray.push($q.when(false));
                        pFlag ? promiseArray.push(changePassword): promiseArray.push($q.when(false));
                        imgFlag ? promiseArray.push(uploadFile) : promiseArray.push($q.when(false));

                        return $q.all(promiseArray)

                    }



                    saveDataToServer().then(function(data){
                        if(data[2]) {
                            that.userData['profile-image'] = data[2]+'?random='+ new Date();
                        }
                        delete that.userData.oldPassword;
                        delete that.userData.newPassword;
                        if(!that.userData['date-created'])that.userData['date-created']= new Date().getTime();
                        that.userData['status'] = -1;
                        // console.log(that.userData)
                        that.userData.$save().then(function(data){
                            $location.path('/user/'+userService.getCurrentUser().userID)
                            perSettingForm.$submitted = false                          
                            messageService.showSuccess('User profile updated')
                        },function(err){
                            perSettingForm.$submitted = false;
                            messageService.showFailure('Error occurred updating user profile')
                            //console.log('Error occurred updating user profile')
                        })

                    })
                    .catch(function () {
                            perSettingForm.$submitted = false;
                             messageService.showFailure('Error occurred updating user profile')
                    });
                }

                function hide() {
                    personalSettingsService.cancelPersonalSettings()
                }
/*
                this.validateForm = function validateForm(form){
                    if(form.$invalid){
                        form._oldPassword.$invalid
                    }
                }
*/
                function saveFile(file, type, userID) {
                    var defer = $q.defer();
                    var xhr = new XMLHttpRequest();
                    //xhr.open("GET", appConfig.apiBaseUrl + "/api/saveuserprofilepicture?file_name=" + userID + "." + type.split('/')[1] + "&file_type=" + type);
                    xhr.open("GET", appConfig.apiBaseUrl + "/api/saveuserprofilepicture?userID=" + userID + "&file_type=" + type);
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
                }
                function upload_file(file, signed_request, url) {
                    var defer = $q.defer();
                    var xhr = new XMLHttpRequest();
                    xhr.open("PUT", signed_request);
                    xhr.setRequestHeader('x-amz-acl', 'public-read');
                    xhr.onload = function (data) {
                        // console.log(xhr.status);
                        // console.log(xhr.responseText);
                        if (xhr.status === 200) {
                            //console.log(url);
                            messageService.showSuccess('Picture uploaded')
                            //document.getElementById("preview").src = url;
                            //that.group.imgLogoUrl = url;
                            // console.log(url);
                            defer.resolve(url)
                        }
                    };
                    xhr.onerror = function (error) {
                        defer.reject(console.log("Could not upload file."));
                    };
                    xhr.send(file);
                    return defer.promise;
                }
                function showAdvanced(ev) {
                    $mdDialog.show({
                        controller: "DialogController as ctrl",
                        templateUrl: 'directives/dilogue1.tmpl.html',
                        targetEvent: ev
                    }).then(function (picture) {
                        $rootScope.newImg = picture;
                        //console.log("this is image" + picture)
                    }, function (err) {
                        //console.log(err)

                    })

                }
            }

        ]);
})();
<!--waste-->