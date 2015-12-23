angular.module('core')
    .directive('groupcardDirective', function () {
    return {
        restrict: 'E',
        scope: {
        	group: '='
        },
        templateUrl: 'directives/groupcardDirective.html'
	};
});
