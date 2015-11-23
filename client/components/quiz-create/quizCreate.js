(function () {
    'use strict';

    angular
        .module('app.quizCreate')
        .controller('QuizCreateController', QuizCreateController);

    QuizCreateController.$inject = ["$firebaseArray", "$timeout", "$location", "userService", "quizService", "quizCreateService"];

    function QuizCreateController($firebaseArray, $timeout, $location, userService, quizService, quizCreateService) {
        //Local Variables
        var that = this;
        var bookId = '';
        var chapId = '';
        that.awaisObject = {};
        that.flagChapters = [];
        that.flagTopics = [];
        that.showQuestionView1 = false;
        that.quizObject = {};
        var marker = 0;
        //temporary
        this.showTick = true;
        this.buttonText = 'Next';
        this.quizTitle = '';
        var topicCounter = 0;
        this.quizDescription = '';
        this.quizTime = '';
        var myCounter = 0;
        this.questionIndex = 0;
        that.tempQuestions = [];
        that.myChapterIndex = 0;
        that.viewAllQuestions = [];
        that.viewAllTopics = [];
        //bring the chapters from firebase

        that.secondBookName = 'angular101';
        that.secondChapters = [];
        that.secondChaptersKey = [];


        /*This will show hide quiz tabs*/
        var counter = 1;
        var tabCounter = 1;
        var arr = [], name = '';
        that.myChapters = [];
        that.myChaptersKey = [];
        that.thirdTopics = [];
        //Data fetching from firebase
        that.chapters = [];
        that.chaptersId = [];
        that.nestedQuestions = [];
        that.topics = [];
        that.topicsId = [];
        that.questions = [];
        that.questionsId = [];

        that.prev = function () {
            $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
        };
        //Firebase
        var ref = new Firebase('https://pspractice.firebaseio.com');
        that.showOne = true;
        that.showTwo = false;
        that.showThree = false;
        that.showFour = false;
        //Tab Icons
        this.oneTab = true;
        this.twoTab = false;
        this.threeTab = false;

        //Show Hide Head Buttons.
        this.one = function () {
            counter = 1;
            this.buttonText = 'Next';
            that.showOne = true;
            that.showTwo = false;
            that.showThree = false;
        };

        this.two = function () {
            this.buttonText = 'Next';
            counter = 2;
            that.showOne = false;
            that.showTwo = true;
            that.showThree = false;
        };

        this.three = function () {
            counter = 3;
            that.showOne = false;
            that.showTwo = false;
            that.showThree = true;
        };


        this.four = function () {
            counter = 4;
            that.showOne = false;
            that.showTwo = false;
            that.showThree = false;

        };

        //Next Button
        this.goToNext = function () {
            counter++;
            if (counter == 2) {
                that.showOne = false;
                that.showTwo = true;
                that.showThree = false;
                if (tabCounter == 1) {
                    //Tab Icons
                    that.oneTab = true;
                    that.twoTab = true;
                    that.threeTab = false;
                    tabCounter++;

                }
                //Second Page
                // all variables
                that.show = false;
                that.showView = false;
                that.showQuizBar = false;
                that.showTick = false;
                that.bookId = '';
                that.chapterId = '';
                that.topicId = null;
                that.SelectedBook = null;
                that.SelectedChapter = null;
                that.SelectedTopic = null;
                that.SelectedQuestion = null;
                that.quizes = [];
                that.chaptersId = [];
                that.chapters = [];
                that.topicsId = [];
                that.topics = [];
                that.questions = [];
                that.questionView = '';
                that.latestNode = [];

                // seleted data start
                that.setSelectedQuestion = function (thisScope) {
                    if (that.lastSelectedTopic.selectedTopic) {
                        $('.selectedTopic').addClass('previousSelected');
                        if (that.lastSelectedQuestion) {
                            that.lastSelectedQuestion.selectedQuestion = '';
                        }
                        thisScope.selectedQuestion = 'selectedQuestion';
                        that.lastSelectedQuestion = thisScope;
                    }
                };

                that.setSelectedTopic = function (thisScope) {
                    if (that.lastSelectedChapter.selected) {
                        $('.previousSelected').removeClass('previousSelected');
                        $('.selectedChapter').addClass('previousSelected');
                        if (that.lastSelectedTopic) {
                            that.lastSelectedTopic.selectedTopic = '';
                        }
                        thisScope.selectedTopic = 'selectedTopic';
                        that.lastSelectedTopic = thisScope;
                    }
                };

                that.setSelectedChapter = function (thisScope) {
                    $('.selectedChapter').removeClass('previousSelected');
                    if (that.lastSelectedChapter) {
                        that.lastSelectedChapter.selected = '';
                    }
                    quizCreateService.setSelectedChapter(thisScope);
                    thisScope.selected = 'selectedChapter';
                    that.lastSelectedChapter = thisScope;
                };
                //selected data end
                //2nd Tab Functions
                var chapterCounter = 0;
                //Chapters
                ref.child('question-bank-chapters').child(quizService.getBook()).on('child_added', function (snapShot) {
                    //$timeout(function () {
                    that.chapters.push(snapShot.val());
                    that.chaptersId.push(snapShot.key());
                    that.nestedQuestions.push([]);
                    that.flagChapters[chapterCounter] = {};
                    that.flagChapters[chapterCounter].id = true;
                    that.viewAllTopics.push([]);
                    that.flagTopics.push([]);
                    chapterCounter++;
                    //}, 0)

                });
                bookId = quizService.getBook();
                that.quizObject[quizService.getBook()] = {};
                that.awaisObject[quizService.getBook()] = {};

                //Topics
                that.showTopics = function (chapterIndex) {
                    that.showQuestionView1 = false;
                    if(that.quizObject[bookId]['quizQuestion'] == undefined){
                        that.quizObject[bookId]['quizQuestion'] = {};
                    }
                    that.quizObject[bookId]['quizQuestion'][that.chaptersId[chapterIndex]] = {};
                    that.awaisObject[bookId][that.chaptersId[chapterIndex]] = {};
                    that.quizObject[bookId]['quizQuestion'][that.chaptersId[chapterIndex]]['ChapterDetails'] = {
                        title: that.chapters[chapterIndex].title,
                        description: that.chapters[chapterIndex].description
                    };
                    that.quizObject[bookId]['quizQuestion'][that.chaptersId[chapterIndex]]['ChapterTopics'] = {};
                    that.awaisObject[bookId][that.chaptersId[chapterIndex]] = {};
                    console.log("Chapter Details");
                    console.log(that.quizObject[bookId]['quizQuestion'][that.chaptersId[chapterIndex]]['ChapterDetails']);
                    that.chapterId = that.chaptersId[chapterIndex];
                    that.myChapterIndex = chapterIndex;
                    quizCreateService.setChapter(that.chapterId, chapterIndex);

                    if (that.flagChapters[chapterIndex].id == true) {
                        that.nestedQuestions[chapterIndex] = [];
                        that.tempQuestions[chapterIndex] = [];
                        that.flagChapters[chapterIndex].id = false;
                        that.topics = [];
                        that.topicsId = [];
                        that.topicId = null;
                        topicCounter = 0;
                        ref.child('question-bank-topic').child(quizService.getBook()).child(quizCreateService.getChapter()).on('child_added', function (snapShot) {
                            $timeout(function () {
                                that.topics.push(snapShot.val());
                                that.viewAllTopics[chapterIndex].push(snapShot.val());
                                that.topicsId.push(snapShot.key());
                                that.flagTopics[chapterIndex][topicCounter] = {};
                                that.flagTopics[chapterIndex][topicCounter].id = true;
                                that.nestedQuestions[chapterIndex].push([]);
                                that.tempQuestions[chapterIndex].push([]);
                                topicCounter++;
                            }, 0)
                        })
                    }
                    else {
                        that.topics = that.viewAllTopics[chapterIndex];
                        that.myChapterIndex = chapterIndex;
                    }
                };
                //Questions.
                that.showQuestions = function (topicIndex) {
                    that.showQuestionView1 = false;
                    if (that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]] == undefined) {
                        that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]] = {};
                        that.awaisObject[bookId][that.chaptersId[that.myChapterIndex]][that.topicsId[topicIndex]] = {};
                        //Topic Object
                        that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]]['TopicDetails'] = {
                            title: that.topics[topicIndex].title,
                            description: that.topics[topicIndex].description
                        };
                        that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]]['TopicQuestions'] = {};
                        that.awaisObject[bookId][that.chaptersId[that.myChapterIndex]][that.topicsId[topicIndex]] = {};
                        console.log("Topic Details");
                        console.log(that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]]);
                    }
                    if (that.flagTopics[that.myChapterIndex][topicIndex].id == true) {

                        that.flagTopics[that.myChapterIndex][topicIndex].id = false;
                        that.nestedQuestions[that.myChapterIndex][topicIndex] = [];
                        myCounter = 0;
                        that.questionIndex = topicIndex;
                        that.showView = false;
                        that.topicId = that.topicsId[topicIndex];
                        that.tempQuestions[that.myChapterIndex][topicIndex] = [];
                        quizCreateService.setTopic(that.topicId, topicIndex);

                        ref.child('questions').child(quizService.getBook()).child(quizCreateService.getChapter()).child(quizCreateService.getTopic()).on('child_added',
                            function (snapShot) {
                                $timeout(function () {
                                    that.questions.push(snapShot.val());
                                    that.questionsId.push(snapShot.key());
                                    that.nestedQuestions[that.myChapterIndex][topicIndex].push(snapShot.val());
                                    that.tempQuestions[that.myChapterIndex][topicIndex].push(snapShot.val());
                                    that.tempQuestions[that.myChapterIndex][topicIndex][myCounter].id = false;
                                    that.nestedQuestions[that.myChapterIndex][topicIndex][myCounter].id = false;
                                    myCounter++;
                                }, 0)
                            });
                    }
                    else {
                        that.questionIndex = topicIndex;
                        that.nestedQuestions[that.myChapterIndex][topicIndex] = that.tempQuestions[that.myChapterIndex][topicIndex];
                    }
                };
                that.showQuestionView = function (question) {
                    that.showQuestionView1 = true;
                    if (question !== null) {
                        quizService.setQuestionObject(question);
                    }
                    that.questionView = question;
                };
                that.showTickIcon = function (trueFalseValue, questionIndex) {
                    if (trueFalseValue == false) {
                        that.showQuestionView1 = true;
                        that.nestedQuestions[that.myChapterIndex][that.questionIndex][questionIndex].id = true;
                        that.tempQuestions[that.myChapterIndex][that.questionIndex][questionIndex].id = true;
                        that.viewAllQuestions.push(that.nestedQuestions[that.myChapterIndex][that.questionIndex][questionIndex]);
                        if (that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[that.questionIndex]]['TopicQuestions'] == undefined) {
                            that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[that.questionIndex]]['TopicQuestions'] = {};
                            that.awaisObject[bookId][that.chaptersId[that.myChapterIndex]][that.topicsId[that.questionIndex]] = {};
                        }
                        that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[that.questionIndex]]['TopicQuestions'][that.questionsId[questionIndex]] = that.tempQuestions[that.myChapterIndex][that.questionIndex][questionIndex];
                        that.awaisObject[bookId][that.chaptersId[that.myChapterIndex]][that.topicsId[that.questionIndex]][that.questionsId[questionIndex]] = that.tempQuestions[that.myChapterIndex][that.questionIndex][questionIndex];
                    }
                    else if (trueFalseValue == true) {
                        that.nestedQuestions[that.myChapterIndex][that.questionIndex][questionIndex].id = false;
                        that.tempQuestions[that.myChapterIndex][that.questionIndex][questionIndex].id = false;
                        arr = that.viewAllQuestions;
                        name = that.nestedQuestions[that.myChapterIndex][that.questionIndex][questionIndex].Title;
                        angular.forEach(arr, function (data, key) {
                            if (data.Title == name) {
                                arr.splice(key, 1);
                            }
                        });
                        that.viewAllQuestions = arr;
                        delete(that.quizObject[bookId]['quizQuestion'][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[that.questionIndex]]['TopicQuestions'][that.questionsId[questionIndex]]);
                        delete(that.awaisObject[bookId][that.chaptersId[that.myChapterIndex]][that.topicsId[that.questionIndex]][that.questionsId[questionIndex]]);
                    }
                };
            }
            else if (counter == 3) {
                this.buttonText = 'Finish and Exit';
                that.showOne = false;
                that.showTwo = false;
                that.showThree = true;
                //Tab Icons
                if (tabCounter == 2) {
                    that.oneTab = true;
                    that.twoTab = true;
                    that.threeTab = true;
                    tabCounter++;
                }

                /*Quiz Create.*/

                //Delete Topics if Questions not there.
                angular.forEach(that.quizObject[bookId]['quizQuestion'], function (datum, key) {
                    angular.forEach(datum['ChapterTopics'], function(datum1, key2){
                        if(Object.keys(datum1['TopicQuestions']).length == 0){
                            delete (that.quizObject[bookId]['quizQuestion'][key]['ChapterTopics'][key2]);
                        }
                    })
                });

                //Delete Chapters if Topics not there.
                angular.forEach(that.quizObject[bookId]['quizQuestion'], function (data, key) {
                    if (Object.keys(data['ChapterTopics']).length == 0) {
                        delete(that.quizObject[bookId]['quizQuestion'][key])
                    }
                });

                /*Quiz Attempt*/

                //Delete Topics if Questions not there.
                angular.forEach(that.awaisObject[bookId], function (datum, key) {
                    angular.forEach(datum, function(datum1, key2){
                        if(Object.keys(datum1).length == 0){
                            delete (that.awaisObject[bookId][key][key2]);
                        }
                    })
                });

                //Delete Chapters if Topics not there.
                angular.forEach(that.awaisObject[bookId], function (data, key) {
                    if (Object.keys(data).length == 0) {
                        delete(that.awaisObject[bookId][key])
                    }
                });
                that.quizObject[bookId]['quizDetails'] = {
                    title   :   that.quizTitle,
                    description :   that.quizDescription,
                    time        :   that.quizTime
                };
            }
            //Last option.
            else if (counter == 4) {
                that.showOne = false;
                that.showTwo = false;
                that.showThree = false;
                //Tab Icons
                if (tabCounter == 3) {
                    //Tab Icons
                    that.oneTab = true;
                    that.twoTab = true;
                    that.threeTab = true;
                    tabCounter++;
                }
                //Object With Answer.
                ref.child('quiz-create').child(bookId).push(that.quizObject[bookId], function () {

                        angular.forEach(that.awaisObject[bookId], function (one) {
                            angular.forEach(one, function (two) {
                                angular.forEach(two, function (three) {
                                    angular.forEach(three.QuestionOptions, function (deleteAnswer) {
                                        delete(deleteAnswer.rightAnswer);
                                    });
                                });
                            });
                        });
                        //Object WithoutAnswer.
                       // ref.child('quiz-attempt').child(bookId).push(that.awaisObject[bookId]);
                    angular.forEach(that.viewAllQuestions, function (data) {
                     delete(data.$$hashKey);
                     angular.forEach(data.QuestionOptions, function(option){
                     delete(option.$$hashKey);
                     });
                     ref.child('quiz-create').child(bookId).on("child_added",function(snapshot){
                     that.latestNode.push(snapshot.key());
                     });
                     ref.child('quiz-attempt').child(bookId).child(that.latestNode[that.latestNode.length-1]).set(
                     that.awaisObject[bookId]
                     );
                     });

                    });
               /* console.log('QuizObject');
                console.log(that.quizObject[bookId]);
                console.log('AwaisObject');
                console.log(that.awaisObject[bookId]);*/

                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            }
        };
    }
})();
