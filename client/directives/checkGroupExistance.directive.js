/**
 * Created by Shahzad on 4/10/2015.
 */

//directive to validate userID asynchronously from server, over singup page.

(function() {
    'use strict';

    angular
        .module('core')
        .directive("checkGroupExistance", checkGroupExistance);

    checkGroupExistance.$inject = ['firebaseService', '$q', 'appConfig'];

    function checkGroupExistance(firebaseService, $q, appConfig) {
        var path;
        //hits a GET to server, to check userID availability.
        var asyncCheckGroupExistance = function(modelValue, b, v) {
            var defer = $q.defer();

            firebaseService.asyncCheckIfGroupExists(setChild(modelValue)).then(function(response) {
                if (response.exists) {
                    defer.reject(); // reject if group already exixts
                } else {
                    defer.resolve()
                }
            });
            return defer.promise;
        };

        function setChild(modelValue) {
            if (path) {
                return path + '/' + modelValue
            } else {
                return modelValue
            }

        }
        return {

            require: "ngModel",
            link: function(scope, element, attributes, ngModel) {
                path = attributes['grouppath']
                ngModel.$asyncValidators.checkGroupExistance = asyncCheckGroupExistance;
            }
        };
    }

})();
