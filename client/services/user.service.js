/**
 * Created by ZiaKhan on 31/12/14.
 */

'use strict';

angular.module('core')
    .factory('userService', ["$q", "$http", "appConfig", "$sessionStorage", '$localStorage', '$firebaseObject', function($q, $http, appConfig, $sessionStorage, $localStorage, $firebaseObject) {
        //.factory('userService',["$http","appConfig","$sessionStorage",'$localStorage','userFirebaseService', function( $http, appConfig,$sessionStorage,$localStorage, userFirebaseService) {


        return {
            getUserPresenceFromLocastorage: function() {
                var deferred = $q.defer();

                var userObj = $localStorage.loggedInUser;
                var userExit = false;

                if (userObj) {
                    var ref = new Firebase(appConfig.myFirebase);
                    var user = ref.child("users").child(userObj.userID);

                    user.once('value', function(snapshot) {
                        if (snapshot.hasChild('email')) {
                            userExit = true;
                            deferred.resolve(userExit);
                        } else {
                            userExit = false;
                            deferred.resolve(userExit);
                        }
                        //console.log(snapshot)
                    }); //user once
                } // if userObj
                else {
                    deferred.resolve(false);
                }

                return deferred.promise;

            },
            getCurrentUser: function() {
                return $localStorage.loggedInUser;
            },
            isUserAccessingOwnHome: function(path, userLoggedInfo) {
                return true;
            },
            isUserGroupAdmin: function() {

            },
            isUserGroupMember: function() {

            }
        };
    }]);
