/**
 * Created by ZiaKhan on 31/12/14.
 */

'use strict';

angular.module('core')
    .factory('userService', ["$state", "$q", "$http", "appConfig", '$localStorage', function($state, $q, $http, appConfig, $localStorage) {
        //.factory('userService',["$http","appConfig","$sessionStorage",'$localStorage','userFirebaseService', function( $http, appConfig,$sessionStorage,$localStorage, userFirebaseService) {

        var user = $localStorage.loggedInUser;

        return {
            getUserPresenceFromLocastorage: function() {
                var deferred = $q.defer();

                if (user && user.userID) {
                    var ref = new Firebase(appConfig.myFirebase);
                    ref.child("users").child(user.userID).once('value', function(snapshot) {
                        if (snapshot.hasChild('email')) {
                            $state.go('user.dashboard', {userID: user.userID})
                        } else {
                            deferred.resolve();
                        }
                        //console.log(snapshot)
                    }); //user once
                } // if userObj
                else {
                    deferred.resolve();
                }

                return deferred.promise;

            },
            getCurrentUser: function() {
                return user;
            },
            setCurrentUser: function(newuser) {
                $localStorage.loggedInUser = newuser;
                user = newuser;
            },
            removeCurrentUser: function() {
                delete $localStorage.loggedInUser;
                user = {};
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
