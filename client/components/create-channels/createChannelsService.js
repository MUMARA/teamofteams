/**
 * Created by sj on 7/7/2015.
 */
/**
 * Created by sj on 6/6/2015.
 */
(function () {
    'use strict';
    angular
        .module('app.createChannels',['core'])
        .factory('createChannelService',['userService','$location','authService','$http','$q','appConfig','$sessionStorage','$firebaseObject','firebaseService','userFirebaseService',function(userService,$location,authService,$http,$q,appConfig,$localStorage,$firebaseObject,firebaseService,userFirebaseService){

            return{}
        }])

})();