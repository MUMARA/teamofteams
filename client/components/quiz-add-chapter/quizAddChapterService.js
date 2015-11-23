/**
 * Created by Adnan Irfan on 09-Jul-15.
 */
(function () {
    'use strict';
    angular
        .module('app.quizAddChapter', ['core'])
        .factory('quizAddChapterService', ['$q', 'authService', "$location", "messageService", 'userService', '$firebaseObject', 'firebaseService', 'checkinService',
            function ($q, authService, $location, messageService, userService, $firebaseObject, firebaseService, checkinService) {


            }
        ])
        .directive("checkChapterExistance", ['firebaseService', '$q', 'appConfig', '$timeout', 'quizService',
            function(firebaseService, $q, appConfig, $timeout, quizService) {
                //hits a GET to server, to check userID availability.
                var asyncCheckChapterExistance = function (chapterId, b, v) {
                    try {
                        var userQuestionBanksChapterRef = new Firebase('https://pspractice.firebaseio.com/question-bank-chapters/' + quizService.getBook());
                        var defer = $q.defer();
                        console.log(quizService.getBook())
                        userQuestionBanksChapterRef.on('child_added', function (snapshot) {
                            $timeout(function () {
                                var Exists = (snapshot.val().title == chapterId);
                                if (!Exists) {
                                    defer.resolve();
                                }
                                else {
                                    defer.reject(); // reject if group already exixts
                                }
                            })
                        });
                    }catch(err){
                    }
                    return defer.promise;
                };
                return {

                    require: "ngModel",
                    link: function (scope, element, attributes, ngModel) {
                        ngModel.$asyncValidators.checkChapterExistance = asyncCheckChapterExistance;
                    }
                };
            }]);



})();