angular.module('core')
    .directive('subgroupcardDirective', function () {
    return {
        restrict: 'E',
        scope: {
        	subgroup: '='
        },
        templateUrl: 'directives/subgroupcardDirective.html',
        controller: function($scope, $stateParams, checkinService) {
        	checkinService.hasSubGroupCurrentLocation($stateParams.groupID, $scope.subgroup.$id).then(function(has){
        		$scope.hasLocation = has;
        	})
        } //controller
	};
});
