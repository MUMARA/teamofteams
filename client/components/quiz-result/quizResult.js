(function () {
    'use strict';

    angular
        .module('app.quizResult')
        .controller('QuizResultController', QuizResultController);

    QuizResultController.$inject = ["quizService", "$location", "userService", "$firebaseArray", "$timeout", "$mdToast", "firebaseService", "QuizResultService", "QuizAttemptingService"];

    function QuizResultController(quizService, $location, userService, $firebaseArray, $timeout, $mdToast, firebaseService, QuizResultService, QuizAttemptingService) {
        var $scope = this;
        var bookId = quizService.getBook();
        $scope.questionArr = [];
        $scope.totalQuestion = $scope.questionArr.length;
        $scope.OutOf = QuizAttemptingService.getTotalQuestion();

        var myNewFirebaseRef = new Firebase("https://pspractice.firebaseio.com/quiz-create/" + bookId);
        myNewFirebaseRef.on('child_added', function (snapShot) {
            var quizId = myNewFirebaseRef.child(snapShot.key());
            quizId.on('child_added', function (dataSnapShot) {
                var chId = quizId.child(dataSnapShot.key());
                chId.on('child_added', function (dataSnapShot1) {
                    var topicId = chId.child(dataSnapShot1.key());
                    topicId.on('child_added', function (dataSnapShot2) {
                        var quesId = topicId.child(dataSnapShot2.key());
                        quesId.on('child_added', function (dataSnapShot3) {
                            var aId = quesId.child(dataSnapShot3.key());
                            aId.on('child_added', function (dataSnapShot4) {
                                var bId = aId.child(dataSnapShot4.key());
                                bId.on('child_added', function (dataSnapShot5) {
                                    var cId = bId.child(dataSnapShot5.key());
                                    cId.on('child_added', function (dataSnapShot6) {
                                        $scope.questionArr.push(dataSnapShot6.val());
                                        console.log($scope.questionArr);
                                        $scope.totalQuestion = $scope.questionArr.length / 5;
                                        /*QuizAttemptService.setTotalQuestion($scope.totalQuestion);*/
                                        console.log("data aaaaa");
                                        console.log(dataSnapShot6.val());
                                        console.log("keyyyyyyy aaaaa");
                                        console.log(dataSnapShot6.key());

                                    })
                                })
                            })
                        })
                    })
                })
            })
        });
        $scope.goToMain = function () {
            $timeout(function () {
                document.getElementById('navBar').style.display="block";
                $location.path('/user/' + userService.getCurrentUser().userID);

            })
        }
    }
})();

