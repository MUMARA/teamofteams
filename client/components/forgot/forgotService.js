/**
 * Created by Mehmood on 5/21/2015.
 */
(function () {
    'use strict';
    angular
        .module('app.forgot',['core'])
        .factory('forgotService', ['$q','authService',"$location","messageService",function($q,authService,$location,messageService){

            return {
                'forgotPassword':function(user){
                    var defer = $q.defer();
                    authService.forgotPassword(user )
                        .then(function( res ) {
                            messageService.showSuccess( res );
                            defer.resolve();
                        }, function( reason ) {
                            defer.reject();
                            messageService.showFailure( reason );
                        });
                    return defer.promise;


                }
            }
        }] );

})();