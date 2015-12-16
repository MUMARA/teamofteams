/**
 * Created by Adnan Irfan on 09-Jul-15.
 */
(function() {
    'use strict';

    angular
        .module('app.quizAddTopic')
        .controller('QuizAddTopicController', QuizAddTopicController);

    QuizAddTopicController.$inject = ["$stateParams", "$location", "userService", "quizService", "$timeout"];

    function QuizAddTopicController($stateParams, $location, userService, quizService, $timeout) {
        /*Private Variables*/
        var ref = new Firebase('https://pspractice.firebaseio.com/');
        var $scope = this;
        $scope.back = back;
        $scope.Title = '';
        $scope.Description = '';
        $scope.chapterId = $stateParams.id;

        function back() {
            $timeout(function() {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            }, 0)
        };

        $scope.addTopics = function() {
            console.log($scope.Title + ' ' +
                $scope.Description)
            ref.child("question-bank-topic").child(quizService.getBook()).child($scope.chapterId).push({
                description: $scope.Description,
                title: $scope.Title
            }, function() {
                $scope.prev();
            });
        };
        $scope.prev = function() {
            $timeout(function() {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz')
            })
        };
    }

})();
