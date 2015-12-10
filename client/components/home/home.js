/**
 * Created by admin on 5/13/2015.
 */

(function() {
        'use strict';

        angular
            .module('app.home', [])
            .controller('HomeController', HomeController);

        HomeController.$inject = ['authService', 'userService', "$state", "$localStorage"]

        function HomeController(authService, userService, $state, $localStorage) {

        }
})();
