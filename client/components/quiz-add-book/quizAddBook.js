/**
 * Created by Aamir Hafeez on 29-Jul-15.
 */

(function () {
    'use strict';

    angular
        .module('app.quizAddBook')
        .controller('QuizAddBookController', QuizAddBookController);

    QuizAddBookController.$inject = ['$location', 'userService', '$mdDialog', '$rootScope', '$timeout', 'quizService', 'utilService', '$q', 'appConfig'];
    function QuizAddBookController($location, userService, $mdDialog, $rootScope, $timeout, quizService, utilService, $q, appConfig) {

        /*Variables*/

        var $scope = this;
        $scope.addBook = addBook;
        $scope.back = back;
        $scope.name = "";
        $scope.desc = "";
        $scope.newImg = null;
        $scope.imgLogoUrl;

        var userQuestionBanksRef = new Firebase('https://pspractice.firebaseio.com/user-question-banks/' + userService.getCurrentUser().userID);
        var userQuestionBanksRef1 = new Firebase('https://pspractice.firebaseio.com/');

        //All Function
        function back() {
            $timeout(function () {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            }, 0)
        };

        function addBook() {

            $scope.temps = {

                title: $scope.name,
                description: $scope.desc,
                imgLogoUrl:$scope.imgLogoUrl
            };

            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                $scope.saveFile(x, mimeType, $scope.bookID).then(function (url) {
                    $scope.temps.imgLogoUrl = url + '?random=' + new Date();
                    //its for sending data on firebase by Name's node
                    userQuestionBanksRef1.child('user-question-banks').child(userService.getCurrentUser().userID).child($scope.bookID).set({'membership-type': 1});

                    userQuestionBanksRef1.child("question-bank-memberships").child($scope.bookID).child(userService.getCurrentUser().userID).set({"membership-type": 1});
                    userQuestionBanksRef1.child("question-bank").child($scope.bookID).set($scope.temps);

                    // quizService.setBookAfterCreation($scope.bookID)
                    // ref.child($scope.bookID).set(temp);
                    $scope.name = "";
                    $scope.desc = "";
                    //$scope.newImg = null;
                    alert('book creation successful')
                    $location.path('/user/' + user.userID)
                })
                    .catch(function () {
                        //bookForm.$submitted = false;
                        //return messageService.showSuccess('picture upload failed')
                        alert('picture upload failed')
                    });
            } else {
                $location.path('/user/' + user.userID)
            }

            $scope.back()
        }


        this.saveFile = function (file, type, quizID) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savequizBookPicture?quizID=" + quizID + "&file_type=" + type);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(upload_file(file, response.signed_request, response.url));
                    }
                    else {
                        defer.reject(alert("Could not get signed URL."))
                    }
                }
            };
            xhr.send();
            return defer.promise;
        };

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function (data) {
                console.log(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    //messageService.showSuccess('Picture uploaded....');
                    console.log('picture upload successful')
                    console.log(url);

                    defer.resolve(url)

                }
            };
            xhr.onerror = function (error) {
                defer.reject(messageService.showSuccess("Could not upload file."));
            };
            xhr.send(file);
            return defer.promise;
        }

        /*function answer(bookForm) {
         var allowedDomain = {};
         var fromDataFlag;
         //return if form has invalid model.
         if (bookForm.$invalid) {
         return;
         }
         $scope.book.ownerImgUrl = ownerImg || 'https://s3-us-west-2.amazonaws.com/defaultimgs/user.png'
         $scope.book.members = $scope.book.membersArray.join();
         if ($scope.book.domain) {
         $scope.book.allowedDomain = {}

         var temp = $scope.book.domain.split(',');
         temp.forEach(function (el, i) {
         $scope.book.allowedDomain[i] = el;
         })

         }
         if ($rootScope.newImg) {
         var x = utilService.base64ToBlob($rootScope.newImg);
         var temp = $rootScope.newImg.split(',')[0];
         var mimeType = temp.split(':')[1].split(';')[0];
         $scope.saveFile(x, mimeType, $scope.book.bookID).then(function (data) {
         quizAddBookService.createbook($scope.book, fromDataFlag, bookForm)
         $location.path('/user/' + user.userID)
         })
         .catch(function () {
         bookForm.$submitted = false;
         return messageService.showSuccess('picture upload failed')
         });
         } else {
         fromDataFlag = false;
         quizAddBookService.createbook($scope.book, fromDataFlag, bookForm)
         $location.path('/user/' + user.userID)
         }

         }*/


        this.selectFile = function (_this) {
            var file = _this.files[0];
            console.log(file.name);

        };

        this.signupModeDisabled = function (val) {
            return val === '3'
        };

        //Cropper Code start
        this.showAdvanced = function (ev) {
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue.tmpl.html',
                targetEvent: ev
            }).then(function (picture) {
                $rootScope.newImg = picture;
                console.log("this is image" + picture)
            }, function (err) {
                console.log(err)

            })

        };

    }


})();