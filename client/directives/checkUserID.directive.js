/**
 * Created by Shahzad on 4/10/2015.
 */

//directive to validate userID asynchronously from server, over singup page.

(function() {
    'use strict';

    angular
        .module('core')
        .directive("checkUserId", checkUserId)
        .directive("checkUserPassword", checkUserPassword);

    checkUserId.$inject = ['$http', '$q', 'appConfig'];

    function checkUserId($http, $q, appConfig) {

        //hits a GET to server, to check userID availability.
        var asyncCheckUserId = function(modelValue) {
            var defer = $q.defer();

            $http.get(appConfig.apiBaseUrl + '/api/checkuserid/' + modelValue)
                .success(function(data) {
                    if (data.statusCode === 1) {
                        defer.resolve();
                    } else if (data.statusCode === 2) {
                        defer.reject();
                    } else {
                        defer.resolve();
                    }
                })
                .error(function(data) {
                    //handle this case
                    defer.resolve();
                });

            return defer.promise;
        };

        return {
            require: "ngModel",
            link: function(scope, element, attributes, ngModel) {

                ngModel.$asyncValidators.checkUserId = asyncCheckUserId;
            }
        };
    }

    function checkUserPassword($http, $q, appConfig) {
        var el;

        //hits a GET to server, to check userID availability.
        var asyncCheckUserPassword = function(modelValue) {
            var defer = $q.defer();
            var dataToCheck = {
                userID: el.scope().personalSettings.userData.$id,
                password: modelValue
            }
            if (modelValue) {
                $http.post(appConfig.apiBaseUrl + '/api/checkpassword', dataToCheck)
                    .success(function(data) {
                        console.log('1', data);
                        if (data.statusCode === 1) {
                            defer.resolve();

                        } else {
                            defer.reject();
                        }
                    })
                    .error(function(data) {
                        console.log('2', data);
                        //handle this case
                        defer.reject();
                    });
            }
            return defer.promise;
        };

        return {
            require: "ngModel",
            link: function(scope, element, attributes, ngModel) {
                //debugger
                el = element;
                ngModel.$asyncValidators._oldPassword = asyncCheckUserPassword;
            }
        };
    }

})();
