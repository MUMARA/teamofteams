/**
 * Created by Aamir Hafeez on 29-Jul-15.
 */
(function() {
    'use strict';

    angular
        .module('app.quizAttempt', ['core', 'app.quiz'])
        .factory('QuizAttemptService', ['quizService', function(quizService) {

            var $scope = this;
            $scope.length = null;
            return {
                'setTotalQuestion': function(length) {
                    $scope.length = length;
                },
                'getTotalQuestion': function() {
                    return $scope.length;
                }

            }

        }])
})();
