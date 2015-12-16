/**
 * Created by admin on 5/13/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.forgot')
        .controller('ForgotController', ForgotController);

    ForgotController.$inject = ["forgotService", "authService"];

    function ForgotController(forgotService, authService) {

        /*private properties*/
        var that = this;

        /*VM functions*/
        this.forgotPassword = forgotPassword;

        /*VM properties*/
        this.user = {
            email: ''
        };

        /*function declarations*/
        //sends email address to get password via that email address
        function forgotPassword() {
            that.submitting = true;
            forgotService.forgotPassword(that.user)
                .then(function(res) {
                    that.submitting = false;

                }, function(reason) {
                    that.submitting = false;

                });
        }
        /* this.canActivate = function(){
             return authService.resolveUserPage();
         }*/


    }

})();
