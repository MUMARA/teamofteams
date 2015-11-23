/**
 * Created by sj on 6/6/2015.
 */
(function () {
    'use strict';
    angular
        .module('app.group',['core'])
        .factory('groupService',['userService','$location','authService','$http','$q','appConfig','$sessionStorage','$firebaseObject','firebaseService','userFirebaseService',function(userService,$location,authService,$http,$q,appConfig,$localStorage,$firebaseObject,firebaseService,userFirebaseService){

            var $scope = this
            return {
                'openCreateSubGroupPage':function(){

                    $location.path('/user/group/create-subgroup')

                },
                'openJoinGroupPage':function(){

                    $location.path('/user/joinGroup')

                },
                'canActivate' :function(){
                    return authService.resolveUserPage();
                },
                'uploadPicture': function (file ) {
                    var defer = $q.defer();
                    var reader = new FileReader();
                    reader.onload = function () {

                        var data = new FormData();
                        data.append('userID', $localStorage.loggedInUser.userID);
                        data.append('token', $localStorage.loggedInUser.token);

                        var blobBin = atob(reader.result.split(',')[1]);
                        var array = [];
                        for (var i = 0; i < blobBin.length; i++) {
                            array.push(blobBin.charCodeAt(i));
                        }

                        var fileBlob = new Blob([new Uint8Array(array)], {type: 'image/png'});
                        data.append("source", fileBlob, file.name);
                        defer.resolve($http.post(appConfig.apiBaseUrl + '/api/profilepicture', data, {
                            withCredentials: true,
                            headers: {'Content-Type': undefined},
                            transformRequest: angular.identity
                        }));

                    };
                    reader.readAsDataURL(file);
                    return defer.promise;

                },
                'userObj':function(pageUserId){
                    return $firebaseObject(firebaseService.getRefUserGroupMemberships().child(pageUserId.userID));
                    //var userData = userFirebaseService.getUserMembershipsSyncObj(pageUserId.userID);
                    /* objUser.$loaded()
                     .then(function(data) {
                     console.log(data)
                     /!*objUser.$bindTo($scope, "user");

                     $scope.groups = userData.groupArray;
                     $scope.activities = userData.userActivityStream;*!/
                     })
                     .catch(function(error) {
                     console.error("Error:", error);
                     soundService.playFail();
                     });*/
                }

            }


        }])

})();