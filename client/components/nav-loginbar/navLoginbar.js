(function() {
    'use strict';

    angular
        .module('app.navLoginbar', ['ngMdIcons', 'core'])
        .controller('NavLoginbarController', NavLoginbarController);

    NavLoginbarController.$inject = ['authService'];

    function NavLoginbarController(authService) {
        //console.log('test')
        /*this.canActivate = function(){
            return authService.resolveUserPage();
        }*/
    }

})();
