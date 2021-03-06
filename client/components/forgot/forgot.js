/**
 * Created by admin on 5/13/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.forgot')
        .controller('ForgotController', ForgotController);

    ForgotController.$inject = ["forgotService", "$state"];

    function ForgotController(forgotService, $state) {

        /*private properties*/
        var that = this;

        /*VM functions*/
        this.forgotPassword = forgotPassword;

        this.submitting = false;

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
                    $state.go("signin");
                    that.submitting = false;

                }, function(reason) {
                    that.submitting = false;
                });
        }
    }

})();
