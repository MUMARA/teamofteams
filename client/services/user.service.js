/**
 * Created by ZiaKhan on 31/12/14.
 */

'use strict';

angular.module('core')
    .factory('userService',["$http","appConfig","$sessionStorage",'$localStorage', function( $http, appConfig,$sessionStorage,$localStorage ) {
        var userData = null;

        return {
            getCurrentUser :function(){
                //return $sessionStorage.loggedInUser;
                return $localStorage.loggedInUser;
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


