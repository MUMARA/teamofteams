/**
 * Created by admin on 5/13/2015.
 */

(function () {
    'use strict';

    angular
        .module('app.sign-up')
        .controller('SignUpController', SignUpController );

    SignUpController.$inject = ['signUpService','authService'];

    function SignUpController(signUpService,authService) {
      //

        /*private properties*/
        var that = this;
        var routeToRedirectAfterSuccess = '/signin';

        /*VM properties*/
        this.user = {
            email: "",
            userID: "",
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: ""
        };
        /*VM function*/
        this.signup = signup;

        /*function declarations*/
        function signup() {

            that.user.userID = that.user.userID.toLowerCase();
            that.user.userID = that.user.userID.replace(/[^a-zA-Z0-9]/g, '');

            signUpService.signup(that.user,routeToRedirectAfterSuccess)
                .then(function(){
                console.log('Success')
                })
                .catch(function(){
                    console.log('failed')
                })
        };
        /*this.canActivate = function(){
            return authService.resolveUserPage();
        }
*/
    }

})();
