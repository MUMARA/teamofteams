/**
 * Created by Aamir Hafeez on 08-Jul-15.
 */
(function() {
    'use strict';
    angular
        .module('app.quizAddBook', ['core', 'app.quiz'])
        .factory('quizAddBookService', ['userFirebaseService', '$location', 'soundService', 'userService', "messageService", '$q', '$http', 'appConfig', '$rootScope',
            function(userFirebaseService, $location, soundService, userService, messageService, $q, $http, appConfig, $rootScope) {

                var pageUserId = userService.getCurrentUser().userID;

                return {
                    'userData': function(pageUserID) {
                        return userFirebaseService.getUserMembershipsSyncObj(pageUserID);
                    },
                    'createbook': function(bookInfo, formDataFlag, form) {
                        //var pageUserId = userService.getCurrentUser().userID;
                        bookInfo.bookID = bookInfo.bookID.toLowerCase();
                        bookInfo.bookID = bookInfo.bookID.replace(/[^a-z0-9]/g, '');

                    },
                    'cancelbookCreation': function(userId) {
                        console.log("book Creation Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID)
                    },
                    'uploadPicture': function(file, bookID) {
                        var defer = $q.defer();
                        var reader = new FileReader();
                        reader.onload = function() {

                            var blobBin = atob(reader.result.split(',')[1]);
                            var array = [];
                            for (var i = 0; i < blobBin.length; i++) {
                                array.push(blobBin.charCodeAt(i));
                            }
                            var fileBlob = new Blob([new Uint8Array(array)], {
                                type: 'image/png'
                            });


                            var data = new FormData();
                            data.append('userID', pageUserId);
                            data.append('token', userService.getCurrentUser().token);
                            data.append("source", fileBlob, file.name);

                            defer.resolve($http.post(appConfig.apiBaseUrl + '/api/profilepicture', data, {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity
                            }));

                        };
                        reader.readAsDataURL(file);
                        return defer.promise;

                    },

                    'getbookImgFromServer': function() {
                        var defer = $q.defer();
                        $http({
                                url: appConfig.apiBaseUrl + '/api/profilepicture/mmm',
                                method: "GET",
                                params: {
                                    token: userService.getCurrentUser().token
                                }
                            })
                            .then(function(data) {
                                var reader = new FileReader();
                                reader.onload = function() {
                                    defer.resolve(reader.result)
                                };
                                reader.readAsDataURL(data.data.profilePicture);

                            })
                            .catch(function(err) {
                                defer.reject(err)
                            });

                        return defer.promise;

                    }

                };

                function Uint8ToString(u8a) {
                    var CHUNK_SZ = 0x8000;
                    var c = [];
                    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
                        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
                    }

                    return c.join("");

                }
            }
        ])
        .directive("checkBookExistance", checkBookExistance);

    checkBookExistance.$inject = ['firebaseService', '$q', 'appConfig', '$timeout'];

    function checkBookExistance(firebaseService, $q, appConfig, $timeout) {
        //hits a GET to server, to check userID availability.
        var asyncCheckBookExistance = function(bookId, b, v) {
            try {
                var userQuestionBanksRef = new Firebase('https://pspractice.firebaseio.com/question-bank');
                var defer = $q.defer();
                userQuestionBanksRef.child(bookId).once('value', function(snapshot) {
                    $timeout(function() {
                        var notExists = (snapshot.val() == null);
                        if (notExists) {
                            defer.resolve();
                        } else {
                            defer.reject(); // reject if group already exixts
                        }
                    })
                });
            } catch (err) {}
            return defer.promise;
        };
        return {

            require: "ngModel",
            link: function(scope, element, attributes, ngModel) {
                ngModel.$asyncValidators.checkBookExistance = asyncCheckBookExistance;
            }
        };
    }
})();
