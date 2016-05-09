(function () {

    angular
        .module('app.quiz', ['core'])


        /*********************Local Service For Testing UI**************/

        .service("myQuizData", function(){
            var QuizDatah = [];
            this._saveQuizData = function(qData){
                //console.log(studentObj);
                QuizDatah.push(qData);
               // console.log(qData);
            };

            this._getQuizData = function(){
                return QuizDatah;

            }
        })
    })