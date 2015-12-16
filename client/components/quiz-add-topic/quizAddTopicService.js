/**
 * Created by Adnan Irfan on 09-Jul-15.
 */
(function() {
    'use strict';
    angular
        .module('app.quizAddTopic', ['core'])
        .factory('quizAddTopicService', ['$q', 'authService', "$location", "messageService", 'userService', '$firebaseObject', 'firebaseService', 'checkinService',
            function($q, authService, $location, messageService, userService, $firebaseObject, firebaseService, checkinService) {}
        ])
        .directive("checkTopicExistance", ['firebaseService', '$q', 'appConfig', '$timeout', 'quizService',
            function(firebaseService, $q, appConfig, $timeout, quizService) {
                //hits a GET to server, to check userID availability.
                var asyncCheckTopicExistance = function(topicId, b, v) {
                    try {
                        var userQuestionBanksTopicRef = new Firebase('https://pspractice.firebaseio.com/question-bank-topic/');
                        var defer = $q.defer();
                        userQuestionBanksTopicRef.child(quizService.getBook()).child(quizService.getChapter()).on('child_added', function(snapshot) {
                            $timeout(function() {
                                var Exists = (snapshot.val().title.toLowerCase() == topicId.toLowerCase() || snapshot.val().title == topicId);
                                if (Exists) {
                                    defer.reject(); // reject if Topic already exixts
                                } else {
                                    defer.resolve();
                                }
                            })
                        });
                    } catch (err) {}
                    return defer.promise;
                };
                return {
                    require: "ngModel",
                    link: function(scope, element, attributes, ngModel) {
                        ngModel.$asyncValidators.checkTopicExistance = asyncCheckTopicExistance;
                    }
                };
            }
        ]);
})();
