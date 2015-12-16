(function() {
    'use strict';

    angular
        .module('app.quizAddQuestion')
        .controller('QuizAddQuestionController', QuizAddQuestionController);
    QuizAddQuestionController.$inject = ["$mdDialog", "$stateParams", "$location", "userService", "quizService", "$timeout"];

    function QuizAddQuestionController($mdDialog, $stateParams, $location, userService, quizService, $timeout) {
        var that = this;
        var myFirebaseRef = new Firebase("https://pspractice.firebaseio.com/");
        var idCounter = 3;
        this.showRadioOptions = false;
        this.showCheckOptions = false;
        this.showAddButton = false;
        this.myAnswer = undefined;
        this.myType = '';
        that.answerTag = [];
        that.myTop = ['40px', '50px'];
        var topMargin = 50;
        this.showCheckText = false;
        this.topicId = $stateParams.id;

        //Answer Types.
        this.types = [{
            name: 'Radio Button'
        }, {
            name: 'CheckBox'
        }];
        this.question = {
            Title: '',
            Description: '',
            Type: '',
            QuestionOptions: [{
                optionText: '',
                id: 2,
                rightAnswer: false
            }, {
                optionText: '',
                id: 3,
                rightAnswer: false
            }]
        };
        //If Answer Type Changes.
        this.typeChanged = function() {

            that.radioValue = '';
            that.myAnswer = undefined;
            that.myTop = ['40px', '50px'];
            topMargin = 50;
            angular.forEach(that.question.QuestionOptions, function(data) {
                if (data.id === true) {
                    data.id = false;
                }
            });
        };
        //Setting different inputs.
        this.setBoxValue = function() {
            this.showAddButton = true;
            that.question.QuestionOptions = [{
                optionText: '',
                id: 2,
                rightAnswer: false
            }, {
                optionText: '',
                id: 3,
                rightAnswer: false
            }];
            if (that.myType.name === 'Radio Button') {
                that.showRadioOptions = true;
                that.showCheckOptions = false;
                that.answerTag = [];
                that.myAnswer = undefined;
            } else if (that.myType.name === 'CheckBox') {
                that.showCheckOptions = true;
                that.showRadioOptions = false;
                that.answerTag = [];
                that.myAnswer = undefined;
            }
        };
        //Push new input fields.
        this.addOption = function() {

            //Radio margin.
            if (topMargin < 90) {
                topMargin += 20;
            }
            that.myTop.push(topMargin + 'px');
            idCounter++;
            that.question.QuestionOptions.push({
                optionText: '',
                id: idCounter,
                rightAnswer: false
            });
        };
        //Delete Option
        this.deleteOption = function(optionIndex) {
            if (optionIndex > -1) {
                that.question.QuestionOptions.splice(optionIndex, 1);
            }
        };

        //Sets Answer if Type CheckBox is selected.
        that.setCheckBoxValue = function(questionId) {
            if (that.question.QuestionOptions[questionId].id == true) {
                that.question.QuestionOptions[questionId].rightAnswer = true;
                that.answerTag.push('one');
            } else if (that.question.QuestionOptions[questionId].id == false) {
                that.question.QuestionOptions[questionId].rightAnswer = false;
                that.answerTag.pop();
            }
        };
        //Add more Questions, Saves data to firebase and clears input fields.
        that.addQuestionsAndContinue = function() {
            that.showRadioOptions = false;
            that.showCheckOptions = false;
            that.showAddButton = false;
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function(data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    } else {
                        data.rightAnswer = false;
                    }
                });
            }
            angular.forEach(that.question.QuestionOptions, function(data) {
                delete data.$$hashKey;
                delete data.$$mdSelectId;
                delete data.id;
            });
            that.question.Type = that.myType.name;
            myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(that.question);
            that.question = {
                Title: '',
                Description: '',
                Type: '',
                Answer: [],
                QuestionOptions: [{
                    optionText: '',
                    id: 2,
                    rightAnswer: false
                }, {
                    optionText: '',
                    id: 3,
                    rightAnswer: false
                }]
            };
            that.myAnswer = undefined;
        };
        //Redirect on close
        this.prev = function() {
            $timeout(function() {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            });
        };
        //Save and Exit Button
        this.showAnswer = function() {
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function(data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    } else {
                        data.rightAnswer = false;
                    }
                });
            }
            angular.forEach(that.question.QuestionOptions, function(data) {
                delete data.$$hashKey;
                delete data.$$mdSelectId;
                delete data.id;
            });
            that.question.Type = that.myType.name;
            myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(that.question);
            that.myAnswer = undefined;
        };
        //View Dialog Box.
        this.showAdvanced = function(ev) {
            that.question.Type = that.myType.name;
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function(data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    } else {
                        data.rightAnswer = false;
                    }
                });
            }
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: './components/quiz-add-question/dialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        questionData: that.question
                    }
                })
                .then(function(answer) {

                }, function() {

                });
        };

    }
})();
//Dialog Box definition.
function DialogController($scope, $mdDialog, questionData) {
    $scope.questionData = questionData;
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
