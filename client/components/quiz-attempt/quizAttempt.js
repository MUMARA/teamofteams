/**
 * Created by Aamir Hafeez on 29-Jul-15.
 */

(function () {
    'use strict';

    angular
        .module('app.quizAttempt')
        .controller('QuizAttemptController', QuizAttemptController);
    QuizAttemptController.$inject = ['$location', 'userService', '$timeout', 'quizService', 'QuizAttemptService'];

    function QuizAttemptController($location, userService, $timeout, quizService, QuizAttemptService) {
        var $scope = this;

        /*var myNewFirebaseRef = new Firebase("https://pspractice.firebaseio.com/quiz-attempt/ionic101");*/
        var newRefForAns = new Firebase("https://pspractice.firebaseio.com/");

        //private variables

        var bookId = quizService.getBook();
        console.log(bookId + " book name");
        //$scope.back = back;
        $scope.bookName = bookId;
        $scope.counter = 1;//question Number
        $scope.button123 = 'next';
        $scope.enbNext = true;
        $scope.questionArr = [];
        $scope.rulesArray = [];
        $scope.questionArr1 = [];
        $scope.back = back;
        //itrating variable
        $scope.show=false;
        $scope.quizAttemptQuestion = 0;   //---------------------------------------------quiz attempt question
        $scope.questionAnswer = 0;        //---------------------------------------------question Answer
        $scope.quizAttemptOption = 1;     //---------------------------------------------quiz attempt option
        $scope.quizAttemptType = 3;       //---------------------------------------------quiz attempt type
        $scope.quizAttemptTitle = 2;      //---------------------------------------------quiz attempt title
        $scope.n = 3;                     //---------------------------------------------question title
        $scope.OutOf = QuizAttemptService.getTotalQuestion();
        $scope.userChoice = [];
        $scope.answer;                    //---------------------------------------------radio button ng-model
        $scope.selectd = [];              //---------------------------------------------check box array
        $scope.ans = [];                  //---------------------------------------------radio button ans
        $scope.Ans;                       //---------------------------------------------check box answer
        $scope.showClose = true;
        $scope.startQuiz = false;
        //check box code

        $scope.toggl = function (itrate, list) {
            var idx = list.indexOf(itrate);
            if (idx > -1) {
                list.splice(idx, 1);
                $scope.ans.splice(idx, 1);
                console.log(list);
            }
            else {
                list.push(itrate);
                $scope.Ans = list;
                console.log(list);
                console.log(list.length);
            }

            if (list.length === 0) {
                $scope.enbNext = true;
            }
            else {
                $scope.enbNext = false;
            }
        };


        /*RULES OF QUIZ*/
        $scope.rules = [
            "Do not press the back button,If you press you will be rejected from quiz.",
            "Do not escape in the middle of quiz,complete your quiz time limit",
            "At the end of the Quiz, your total score will be displayed.",
            "Passing percentage is 60%."
        ];

        $scope.check12 = function(rule){


            var idx = $scope.rulesArray.indexOf(rule);
            if (idx > -1) { $scope.rulesArray.splice(idx, 1); console.log($scope.rulesArray); }
            else { $scope.rulesArray.push(rule); console.log($scope.rulesArray); }

            if($scope.rulesArray.length === 4) {
                $scope.startQuiz = true;

            }
            else {
                $scope.startQuiz = false;

            }

        };




        //timer function

        function startTimer(duration) {
            var start = Date.now(),
                diff,
                minutes,
                seconds;

            function timer() {
                // get the number of seconds that have elapsed since
                // startTimer() was called
                diff = duration - (((Date.now() - start) / 1000) | 0);

                // does the same job as parseInt truncates the float
                minutes = (diff / 60) | 0;
                seconds = (diff % 60) | 0;

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                $scope.textContent = minutes + ":" + seconds;

                if (diff === 0) {
                    // add one second so that the count down starts at the full duration
                    // example 05:00 not 04:59
                    //start = Date.now() + 1000;
                    //alert('paper finished')
                    $timeout(function () {
                        $location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizResult');

                    })
                }
            }

            // we don't want to wait a full second before the timer starts
            //timer();
            $scope.timesMap = setInterval(timer, 1000);
        }

        // FIREBASE PART
        var myNewFirebaseRef = new Firebase("https://pspractice.firebaseio.com/quiz-attempt/" +bookId);

        $timeout(function () {
            /*            myFirebaseRef.on('child_added', function (snapShot) {
             var abc = myFirebaseRef.child(snapShot.key());
             abc.on('child_added', function (dataSnapShot) {
             $scope.questionArr.push(dataSnapShot.val());
             /!*console.log($scope.questionArr);*!/
             }
             );
             $scope.totalQuestion = $scope.questionArr.length / 4;
             });*/

            myNewFirebaseRef.on('child_added', function (snapShot) {
                var abcd = myNewFirebaseRef.child(snapShot.key());
                abcd.on('child_added', function (dataSnapShot) {
                    var abcde = abcd.child(dataSnapShot.key());
                    abcde.on('child_added', function (dataSnapShot1) {
                        var abcdef = abcde.child(dataSnapShot1.key());
                        abcdef.on('child_added', function (dataSnapShot2) {
                            var abcdefg = abcdef.child(dataSnapShot2.key());
                            abcdefg.on('child_added', function (dataSnapShot3) {


                                $scope.questionArr.push(dataSnapShot3.val());
                                $scope.totalQuestion = $scope.questionArr.length / 5;
                                QuizAttemptService.setTotalQuestion($scope.totalQuestion);

                            })
                        })
                    })
                })
            })
        }, 0);
        function back(){
            $timeout(function () {
                $location.path('/user/' + userService.getCurrentUser().userID)
            })
        }


        //Next Button
        this.next123 = function () {
            $scope.counter++;
            $scope.quizAttemptQuestion += 5;    //----------------------------------quiz attempt question
            $scope.quizAttemptOption += 5;      //----------------------------------quiz attempt option
            $scope.quizAttemptType += 5;        //----------------------------------quiz attempt type
            $scope.quizAttemptTitle += 5;       //----------------------------------quiz attempt title
            /*  $scope.n += 5;
             $scope.questionAnswer += 5;*/
            $scope.selectd = [];
            $scope.enbNext = true;

            if ($scope.questionArr[$scope.quizAttemptType - 5] === 'Radio Button') {
                newRefForAns.child('quiz-ans').push(
                    {
                        ans: $scope.answer
                    }
                );

            }

            else {
                newRefForAns.child('quiz-ans').push(
                    {
                        ans: $scope.Ans
                    }
                );
                /*$scope.ans.push(
                 {
                 ans: $scope.Ans
                 }
                 );*/

            }
            console.log($scope.ans);


            if ($scope.counter === $scope.totalQuestion) {
                $scope.button123 = 'submit';

            }

            if ($scope.counter > $scope.totalQuestion) {
                //alert("Result");
                $timeout(function () {
                    clearInterval($scope.timesMap)
                    $location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizResult');

                })

            }

            /* if ($scope.questionArr[$scope.l - 4] === $scope.questionArr1[$scope.n - 5]) {

             }
             */
            $scope.answer = "";
            /*console.log($scope.questionArr1);*/
        };

        //1st page for Description
        $scope.click=false;
        $scope.click1=true;
        $scope.nowClick =function(){
            $scope.showClose = false;
            $scope.click=true;
            $scope.click1=false;
            startTimer(10 * 60);


        }


    }


})();