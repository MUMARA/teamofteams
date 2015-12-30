angular.module('core')
    .directive('subgroupcardDirective', function () {
    return {
        restrict: 'E',
        scope: {
        	subgroup: '='
        },
        templateUrl: 'directives/subgroupcardDirective.html'
	};
});
