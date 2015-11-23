/**
 * Created by Hasnain on 09-Jul-15.
 */
(function () {
    'use strict';
    angular
        .module('app.quizAddQuestion', ['core', 'app.quiz'])
        .factory('quizAddQuestionService', ['$q', 'authService', "$location", "messageService", 'userService', '$firebaseObject', 'firebaseService', 'checkinService',
            function ($q, authService, $location, messageService, userService, $firebaseObject, firebaseService, checkinService) {


            }
        ])

})();