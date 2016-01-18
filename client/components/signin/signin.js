/**
 * Created by admin on 5/13/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.signin')
        .controller('SigninController', SigninController);

    SigninController.$inject = ["singInService", '$mdToast', 'authService'];

    function SigninController(singInService, $mdToast, authService) {
        /*Private Variables*/
        var that = this;
        var pageToRoutAfterLoginSuccess = "/";
        /* VM variables*/
        this.user = {
            email: "",
            password: ""
        };
        this.submitting = false;

        /*VM functions*/
        this.login = loginFn;


        /*private functions*/

        function loginFn(form) {
            that.submitting = true;

            singInService.login(form.user, pageToRoutAfterLoginSuccess)
                .then(function(data) {
                    that.submitting = false;
                })
                .catch(function() {
                    that.submitting = false;
                });

        }
        /*this.canActivate = function(){
            return authService.resolveUserPage();
        }*/

    }

})();
