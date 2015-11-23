/**
 * Created by Mehmood on 5/21/2015.
 */
(function () {
    'use strict';
    angular
        .module('app.navToolbar',['core'])
        .factory('navToolbarService', ['$q','authService',"$location","messageService",'userService','$firebaseObject','firebaseService','checkinService',
            function($q,authService,$location,messageService,userService,$firebaseObject,firebaseService,checkinService){

                return {}
        }] );

})();


