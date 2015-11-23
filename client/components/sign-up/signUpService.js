/**
 * Created by Mehmood on 5/21/2015.
 */
(function () {
    'use strict';
    angular
        .module('app.sign-up',['core'])
        .factory('signUpService', ['$q','authService',"$location","messageService",function($q,authService,$location,messageService){

            return {
                'signup':function(user,location){
                    var defer = $q.defer();
                    authService.signup(user,function(data, firebaseData){
                            if(data.statusCode == 1) {
                                messageService.showSuccess('Sign up successful please login.');
                                $location.path(location);
                            }
                            else {
                                messageService.showFailure( data.statusDesc );
                            }
                        },
                        function(){
                            messageService.showFailure('Network Error Please Submit Again.');
                        });
                    return defer.promise;


                }
            }
        }] );

})();
