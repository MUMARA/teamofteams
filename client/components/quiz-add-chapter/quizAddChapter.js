(function () {
    'use strict';

    angular
        .module('app.quizAddChapter')
        .controller('QuizAddChapterController', QuizAddChapterController);

    QuizAddChapterController.$inject = ['$stateParams', '$location', '$timeout', 'userService', '$firebaseArray'];

    function QuizAddChapterController($stateParams, $location, $timeout, userService, $firebaseArray) {
        /*  Variables  */
        var ref = new Firebase('https://pspractice.firebaseio.com/');
        var $scope = this;
        $scope.back = back;
        $scope.bookId = $stateParams.id;
        $scope.Title = '';
        $scope.Description = '';

        /*  Functions  */
        function back() {
            $timeout(function () {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            }, 0)
        };
        $scope.prev = function () {
            $timeout(function () {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz')
            })
        };
        $scope.addChapters = function () {
            console.log($scope.Title + " " + $scope.Description)
            ref.child("question-bank-chapters").child($scope.bookId).push({
                title: $scope.Title,
                description: $scope.Description
            }, function () {
                $scope.Title = '';
                $scope.Description = '';
                $scope.prev();
            });
        };
    }
})();