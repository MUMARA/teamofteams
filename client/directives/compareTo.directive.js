/**
 * Created by Shahzad on 4/10/2015.
 */

//Can be used to validate form fields for confirmPassword, confirmEmail and etc.

(function () {
    'use strict';

    angular
        .module('core')
        .directive("compareTo", compareTo )
        .directive("compareAgainst", compareAgainst );

    function compareTo() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function( scope, element, attributes, ngModel ) {

                ngModel.$validators.compareTo = function( modelValue ) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    }
    function compareAgainst() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareAgainst"
            },
            link: function( scope, element, attributes, ngModel ) {

                ngModel.$validators.compareAgainst = function( modelValue ) {
                    return modelValue !== scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    }

})();
