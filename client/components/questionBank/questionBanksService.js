(function () {
    'use strict';
    angular
        .module('app.quiz', ['core'])
        .service('quizBankService', ['firebaseService', 'userService', '$q',
            quizBank
        ])
        .factory('quizService', ["$location", function ($location) {
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
        .service('navService', function ($mdSidenav, $mdUtil, $log, $timeout) {
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
        _self.loadQuestionBanks = function () {
            _self.books = [];
            _self.bookId = [];
            var deferred = $q.defer();
            var bookRef = firebaseService.getRefUserQuestionBanks().child(
                userService.getCurrentUser()
                    .userID).on('child_added', function (questionBankUniqueID) {
                    a(questionBankUniqueID.key(), function (res) {
                        deferred.resolve(_self.books)
                    })
                });

            return deferred.promise;
        };

        function a(questionBankUniqueID, cb) {
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).once('value', function (questionBank) {
                _self.books.push(questionBank.val());
                _self.bookId.push(questionBank.key());
                cb()
            });
        }

        _self.createQuestionBank = function (questionBankUniqueID, questionBankObject) {
            // firebaseService.getRefUserQuestionBanks().child(userService.getCurrentUser().userID).set();
            /*          firebaseService.getRefUserQuestionBanks().child(
             userService.getCurrentUser().userID).child(questionBankUniqueID).set({
             'memberships-type': 1,
             'timestamp': Firebase.ServerValue.TIMESTAMP
             });

             firebaseService.getRefQuestionBankMemberships().child(
             questionBankUniqueID).child(userService.getCurrentUser().userID)
             .set({
             "memberships-type": 1,
             'timestamp': Firebase.ServerValue.TIMESTAMP
             });

             firebaseService.getRefQuestionBankNames().child(questionBankUniqueID)
             .set({
             title: questionBankObject.title
             });
             firebaseService.getRefQuestionBank().child(questionBankUniqueID)
             .set(questionBankObject);
             */
            var ref = firebaseService.getRefMain();
            var newQuestionBank = {};
            newQuestionBank["user-question-banks/" + userService.getCurrentUser().userID + "/" + questionBankUniqueID] = {
                'memberships-type': 1,
                'timestamp': Firebase.ServerValue.TIMESTAMP
            };
            newQuestionBank["question-bank-memberships/" + questionBankUniqueID + "/" + userService.getCurrentUser().userID] = {
                'memberships-type': 1,
                'timestamp': Firebase.ServerValue.TIMESTAMP
            };
            newQuestionBank["question-bank-names/" + questionBankUniqueID] = {
                title: questionBankObject.title
            };
            newQuestionBank["question-bank/" + questionBankUniqueID] = questionBankObject;
            ref.update(newQuestionBank, function (error) {
                if (error) {
                    console.log("Error updating data:", error);
                }
            });
        };
        _self.loadChapters = function (questionBankUniqueID) {

            var deferred = $q.defer();
            _self.chapters = [];
            _self.chaptersId = [];

            // Store chapters Ref
            var chapterRef = firebaseService.getRefQuestionBank().child(
                questionBankUniqueID).child("chapters");
            // chapters off Value Events
            chapterRef.off('child_added');
            // chapter Ref Value CallBack on Value Events
            var chapterRefValueCallBack = chapterRef.on('child_added', function (ChaptersUniqueId) {
                _self.chaptersId.push(ChaptersUniqueId.key());
                _self.chapters.push(ChaptersUniqueId.val());

                deferred.resolve(_self.chapters);
            });

            return deferred.promise;
        };
        _self.createChapter = function (questionBankUniqueID, chapterObject) {
            var deferred = $q.defer();
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child('chapters').push(chapterObject, function (err) {
                err == null ? deferred.resolve('Save Topic') : deferred.reject();
            });
            return deferred.promise;
        };
        _self.createTopic = function (questionBankUniqueID, chapterUniqueId, topicObject) {
            var deferred = $q.defer();
            firebaseService.getRefQuestionBank().child(questionBankUniqueID)
                .child('chapters').child(chapterUniqueId).child("topics").push(topicObject, function (err) {
                    err == null ? deferred.resolve('Save Topic') : deferred.reject();
                });
            return deferred.promise;
        };
        _self.loadTopic = function (questionBankUniqueID, chapterUniqueId) {
            var deferred = $q.defer();
            _self.topics = [];
            _self.topicsId = [];
            // Store topicRef Ref
            var topicRef = firebaseService.getRefQuestionBank().child(questionBankUniqueID)
                .child("chapters").child(chapterUniqueId).child("topics");
            // Topic off Value Events

            topicRef.off('child_added');

            // Topic Ref Value CallBack on Value Events
            var TopicValueCallBack = topicRef.on('child_added',
                function (topics) {
                    _self.topicsId.push(topics.key());
                    _self.topics.push(topics.val());
                    deferred.resolve(_self.topics);
                });

            return deferred.promise;
        };
        _self.loadQuestions = function (questionBankUniqueID, chapterUniqueId, topicUniqueId) {
            var deferred = $q.defer();
            _self.questions = [];
            _self.questionId = [];
            //Store questions Ref
            var questionsRef = firebaseService.getRefQuestionBank().child(
                questionBankUniqueID).child(
                "chapters").child(chapterUniqueId).child("topics").child(
                topicUniqueId).child("questions")

            // Questions off Value Events
            questionsRef.off('child_added');

            // Questions Ref Value CallBack on Value Events
            var questionsRefValueCallBack = questionsRef.on('child_added',
                function (questions) {
                    _self.questionId.push(questions.key());
                    _self.questions.push(questions.val());
                    deferred.resolve(_self.questions);
                });

            return deferred.promise;
        };
        _self.createQuestion = function (questionBankUniqueID, chapterUniqueId, topicUniqueId, questionObject) {
            var deferred = $q.defer();
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child('chapters')
                .child(chapterUniqueId).child("topics").child(topicUniqueId)
                .child("questions").push(questionObject, function (err) {
                    err == null ? deferred.resolve('Save Question') : deferred.reject();
                });
            return deferred.promise;
        };
    }

})();
