/**
 * Created by Mehmood on 5/21/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.signin', ['core'])
        .factory('singInService', ['$state', '$q', 'authService', "$location", "messageService", function($state, $q, authService, $location, messageService) {

            return {
                'login': function(user, location) {

                    var defer = $q.defer();
                    authService.login(user, function(data) {
                        messageService.showSuccess('Login successful');
                        //firebaseService.addUpdateHandler();
                        // $location.path(location + data.user.userID);
                        $state.go('user.dashboard', {userID: data.user.userID})
                        defer.resolve()

                    }, function(data) {
                        if (data) {
                            if (data.statusCode == 0) {
                                messageService.showFailure(data.statusDesc);
                            } else {
                                messageService.showFailure('Network Error Please Submit Again');
                            }
                        } else {
                            messageService.showFailure('Network Error Please Submit Again');
                        }
                        defer.reject(data)

                    });
                    return defer.promise;


                }
            }
        }]);

})();
