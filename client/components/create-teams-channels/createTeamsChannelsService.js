/**
 * Created by sj on 7/15/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.createTeamsChannels', ['core'])
        .factory('createTeamsChannelsService', ['userService', '$location', 'authService', '$http', '$q', 'appConfig', '$firebaseObject', 'firebaseService', 'userFirebaseService', function(userService, $location, authService, $http, $q, appConfig, $firebaseObject, firebaseService, userFirebaseService) {

            return {}
        }])

})();
