/**
 * Created by Shahzad on 3/24/2015.
 */

// directive for get gravatar image
angular.module('core')
    .directive('activitiesList', function() {
        return {
            restrict: 'A',
            templateUrl: 'core/views/activitiesList.view.html',
            link: function($scope, element, attr) {
                //do some cool stuff.
            }
        }
    });
