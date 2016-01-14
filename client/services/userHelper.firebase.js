/**
 * Created by Shahzad on 6/9/2015.
 */

(function() {
    'use strict';
    angular.module('core')
        .factory('userHelperService', ["$q", "$http", "appConfig", "$firebaseAuth", "$location", '$firebaseArray', "firebaseService",
            function($q, $http, appConfig, $firebaseAuth, $location, $firebaseArray, firebaseService) {


                return {
                    getAllUsers: function() {
                        //return $firebaseObject(firebaseService. getRefUsers());
                        return $firebaseArray(toDoListRef)(firebaseService.getRefUsers());

                    },
                    getUserGroupMemberShip: function() {
                        //return $firebaseObject(firebaseService.getRefUserGroupMemberships());
                        return Firebase.getAsArray(firebaseService.getRefGroupMembers());

                    }



                }

            }
        ]);
})();
