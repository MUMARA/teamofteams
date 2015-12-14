/**
 * Created by ZiaKhan on 31/12/14.
 */

'use strict';

angular.module('core')
        .factory('userService',["$http","appConfig","$sessionStorage",'$localStorage', '$firebaseObject', function($http,appConfig,$sessionStorage,$localStorage, $firebaseObject) {
        //.factory('userService',["$http","appConfig","$sessionStorage",'$localStorage','userFirebaseService', function( $http, appConfig,$sessionStorage,$localStorage, userFirebaseService) {

        var ref = new Firebase(appConfig.myFirebase).child('users').child($localStorage.loggedInUser.userID);
        //console.log($firebaseObject(ref));
        var userExit = $firebaseObject(ref);
        // var userExit = userFirebaseService.userExists($localStorage.loggedInUser.userID);
        // console.log(userExit)

        return {
            getCurrentUser :function(){
                // return $sessionStorage.loggedInUser;
                if (userExit) {
                    return $localStorage.loggedInUser;
                } else {
                     return false;
                }
            },
            isUserAccessingOwnHome: function( path, userLoggedInfo ){
                return true;
            },
            isUserGroupAdmin: function(){

            },
            isUserGroupMember: function(){

            }
        };
    }]);


