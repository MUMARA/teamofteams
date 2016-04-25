(function () {
    'use strict';
    angular
        .module('app.quiz')
        /*.directive('onBookRender', function ($timeout, quizService) {
         return {
         restrict: 'A',
         link: function (scope, element, attr) {
         if (scope.$last) {
         $timeout(function () {
         $('#bookId' + quizService.getBookIndex() + '').addClass('selectedBook')
         }, 0);
         }
         }
         }
         })*/
        /*.directive('onChapterRender', function ($timeout, quizService) {
         return {
         restrict: 'A',
         link: function (scope, element, attr) {
         $timeout(function () {
         if (scope.$last) {
         //$('#chapid' + quizService.getChapterIndex() + '').addClass('selectedChapter')
         }
         }, 0);


         }
         }
         })*/
        /*.directive('onTopicRender', function ($timeout, quizService) {
         return {
         restrict: 'A',
         link: function (scope, element, attr) {
         if (scope.$last) {
         $timeout(function () {
         $('#topicId' + quizService.getTopicIndex() + '').addClass('selectedTopic')
         }, 0);
         }
         }
         }
         })*/
        .service('quizesBankService', ['firebaseService', 'userService', '$q', quizBank])
        .factory('quizesService', ["$location", function ($location) {
            var _self = this;

            _self.book = null;
            _self.bookIndex = null;
            _self.chapter = null;
            _self.chapterIndex = null;
            _self.topic = null;
            _self.topicIndex = null;
            _self.question = null;
            _self.bookAfterCreation = null;
            _self.SelectedQuestion = null;

            _self.selectedTab = null;

            return {
                /*    Tabs    */
                'getSelectedTab': function () {
                    return _self.selectedTab;
                },
                'setSelectedTab': function (tab) {
                    _self.selectedTab = tab;
                },

                'quiz': function () {

                },
                'getSelected': function () {
                    return {
                        book: _self.book,
                        chapter: _self.chapter,
                        topic: _self.topic
                    }
                },
                'getBook': function () {
                    return _self.book;
                },
                'getChapter': function () {
                    return _self.chapter;
                },
                'getTopic': function () {
                    return _self.topic;
                },
                'getQuestionObject': function () {
                    return _self.question;
                },

                'getBookIndex': function () {
                    return _self.bookIndex;
                },
                'getChapterIndex': function () {
                    return _self.chapterIndex + '';
                },
                'getTopicIndex': function () {
                    return _self.topicIndex;
                },
                'getBookAfterCreation': function () {
                    return _self.bookAfterCreation;
                },


                'setBook': function (bookId, bookIndex) {
                    _self.book = bookId
                    _self.bookIndex = bookIndex
                },
                'setChapter': function (chapterId, chapterIndex) {
                    _self.chapter = chapterId
                    _self.chapterIndex = chapterIndex
                },
                'setTopic': function (topicId, topicIndex) {
                    _self.topic = topicId
                    _self.topicIndex = topicIndex
                },
                'setQuestionObject': function (question) {
                    _self.question = question;
                },

                'getSelectedBook': function () {
                    return _self.SelectedBook;
                },
                'getSelectedChapter': function () {
                    return _self.SelectedChapter;
                },
                'getSelectedTopic': function () {
                    return _self.SelectedTopic;
                },
                'getSelectedQuestion': function () {
                    return _self.SelectedQuestion;
                },
                'setSelectedBook': function (index) {
                    _self.SelectedBook = index;
                },
                'setSelectedChapter': function (index) {
                    _self.SelectedChapter = index;
                },
                'setSelectedTopic': function (index) {
                    _self.SelectedTopic = index;
                },
                'setSelectedQuestion': function (index) {
                    _self.SelectedQuestion = index;
                },
                'setBookAfterCreation': function (book) {
                    _self.bookAfterCreation = book;
                }
            }
        }])
        .service('naveService', function ($mdSidenav, $mdUtil, $log, $timeout) {
            var _self = this;
            _self.toggleRight1 = buildToggler('nav1');
            _self.toggleRight2 = buildToggler('nav2');
            _self.toggleRight3 = buildToggler('nav3');
            _self.toggleRight4 = buildToggler('nav4');
            _self.toggleRight5 = buildToggler('nav5');
            _self.toggleRight6 = buildToggler('nav6');

            function buildToggler(navID) {
                var debounceFn = $mdUtil.debounce(function () {
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            $log.debug("toggle " + navID + " is done");
                        });
                }, 200);
                return debounceFn;
            }

            /*_self.close = function () {
             $mdSidenav('nav1').close()
             .then(function () {
             $log.debug("close LEFT is done");
             });
             }
             _self.close = function () {
             $mdSidenav('nav2').close()
             .then(function () {
             $log.debug("close LEFT is done");
             });
             }
             _self.close = function () {
             $mdSidenav('nav3').close()
             .then(function () {
             $log.debug("close RIGHT is done");
             });
             };
             _self.close = function () {
             $mdSidenav('nav4').close()
             .then(function () {
             $log.debug("close RIGHT is done");
             });
             };
             _self.close = function () {
             $mdSidenav('nav5').close()
             .then(function () {
             $log.debug("close RIGHT is done");
             });
             };
             _self.close = function () {
             $mdSidenav('nav6').close()
             .then(function () {
             $log.debug("close RIGHT is done");
             });
             };*/
        });


    function quizBank(firebaseService, userService, $q) {
        var _self = this;
        _self.books = [];
        _self.bookId = [];
        _self.chapters = [];
        _self.chaptersId = [];
        _self.topics = [];
        _self.topicsId = [];
        _self.questions = [];
        _self.questionId = [];

        _self.loadQuestionBanks = function() {
            _self.books = [];
            _self.bookId = [];
            var deferred = $q.defer();
            firebaseService.getRefUserQuestionBanks().child(
                userService.getCurrentUser()
                    .userID).on('child_added', function(questionBankUniqueID) {
                loadingQuestionBanks(questionBankUniqueID.key(), function() {
                    deferred.resolve(_self.books)
                })
            });

            return deferred.promise;
        };

        function loadingQuestionBanks(questionBankUniqueID, cb) {
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).once(
                'value',
                function(questionBank) {
                    _self.books.push(questionBank.val());
                    _self.bookId.push(questionBank.key());
                    cb()
                });
        }


        _self.loadQuiz = function() {
            _self.quiz = [];
            _self.quizID = [];
            var deferred = $q.defer();
            firebaseService.getRefUserQuiz().child(
                userService.getCurrentUser().userID).on('value', function(quizUniqueID) {
                for (var key in quizUniqueID.val()) {
                    _self.quiz.push(quizUniqueID.val()[key]);
                    _self.quizID.push(key);
                    deferred.resolve(_self.quiz);
                }
            });
            return deferred.promise;
        };







        _self.createQuiz = function (quizObject) {

           firebaseService.getRefUserQuiz().child(userService.getCurrentUser().userID).push(quizObject);

        };
        _self.loadChapters = function (questionBankUniqueID) {
            var deferred = $q.defer();
            _self.chapters = [];
            _self.chaptersId = [];
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child("chapters").on('value', function (ChaptersUniqueId) {
                for (var key in ChaptersUniqueId.val()) {
                    _self.chaptersId.push(key);
                    _self.chapters.push(ChaptersUniqueId.val()[key]);
                    deferred.resolve(_self.chapters);
                }
            });
            return deferred.promise;
        };
        _self.createChapter = function (questionBankUniqueID, chapterObject) {
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child('chapters').push(chapterObject);
        };
        _self.createTopic = function (questionBankUniqueID, chapterUniqueId, topicObject) {
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child('chapters').child(chapterUniqueId).child("topics").push(topicObject);
        };
        _self.loadTopic = function (questionBankUniqueID, chapterUniqueId) {
            var deferred = $q.defer();
            _self.topics = [];
            _self.topicsId = [];
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child("chapters").child(chapterUniqueId).child("topics").on('value', function (topics) {
                for (var key in topics.val()) {
                    _self.topicsId.push(key);
                    _self.topics.push(topics.val()[key]);
                    console.log(_self.topics)
                    deferred.resolve(_self.topics);
                }
            });
            return deferred.promise;
        };
        _self.loadQuestions = function (questionBankUniqueID, chapterUniqueId,topicUniqueId) {
            var deferred = $q.defer();
            _self.questions = [];
            _self.questionId = [];
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child("chapters").child(chapterUniqueId).child("topics").child(topicUniqueId).child("questions").on('value', function (questions) {
                for (var key in questions.val()) {
                    _self.questionId.push(key);
                    _self.questions.push(questions.val()[key]);
                    deferred.resolve(_self.questions);
                }
            });
            return deferred.promise;
        };
        _self.createQuestion = function (questionBankUniqueID, chapterUniqueId, topicUniqueId, questionObject) {
            /*            var questionObject = {
             title: "title",
             type: 3, //QuestionTupe
             html: "htmlsllssllss",
             questiones: [{
             title: "Title",
             type: 1, // it only just radio and CheckBox
             html: "HTML",
             options: [{
             "html": "hello ",
             "correct": false,
             "discussion-html": "sajklksjls"
             },
             {
             "html": "helkkdjjs",
             "correct": true,
             "discussion-html": "hekejejsd"
             }],
             "discussion-html" : "String"

             },
             ],
             "discussion-html": "hgshshs"
             }*/
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child('chapters').child(chapterUniqueId).child("topics").child(topicUniqueId).child("questions").push(questionObject);
        };
    }

})();
