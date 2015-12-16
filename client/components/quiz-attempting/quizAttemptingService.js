/**
 * Created by QASEEM WAKEEL on 9/4/2015.
 */

(function() {
    'use strict';

    angular
        .module('app.quizAttempting', ['core', 'app.quiz'])
        .factory('QuizAttemptingService', ['quizService', function(quizService) {

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
