(function () {
    'use strict';
    angular
        .module('app.quiz', ['core'])
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
        .service('quizBankService', ['firebaseService', 'userService', '$q', quizBank])
        .factory('quizService', ["$location", function ($location) {
            var that = this;

            that.book = null;
            that.bookIndex = null;
            that.chapter = null;
            that.chapterIndex = null;
            that.topic = null;
            that.topicIndex = null;
            that.question = null;
            that.bookAfterCreation = null;
            that.SelectedQuestion = null;

            that.selectedTab = null;

            return {
                /*    Tabs    */
                'getSelectedTab': function () {
                    return that.selectedTab;
                },
                'setSelectedTab': function (tab) {
                    that.selectedTab = tab;
                },

                'quiz': function () {

                },
                'getSelected': function () {
                    return {
                        book: that.book,
                        chapter: that.chapter,
                        topic: that.topic
                    }
                },
                'getBook': function () {
                    return that.book;
                },
                'getChapter': function () {
                    return that.chapter;
                },
                'getTopic': function () {
                    return that.topic;
                },
                'getQuestionObject': function () {
                    return that.question;
                },

                'getBookIndex': function () {
                    return that.bookIndex;
                },
                'getChapterIndex': function () {
                    return that.chapterIndex + '';
                },
                'getTopicIndex': function () {
                    return that.topicIndex;
                },
                'getBookAfterCreation': function () {
                    return that.bookAfterCreation;
                },


                'setBook': function (bookId, bookIndex) {
                    that.book = bookId
                    that.bookIndex = bookIndex
                },
                'setChapter': function (chapterId, chapterIndex) {
                    that.chapter = chapterId
                    that.chapterIndex = chapterIndex
                },
                'setTopic': function (topicId, topicIndex) {
                    that.topic = topicId
                    that.topicIndex = topicIndex
                },
                'setQuestionObject': function (question) {
                    that.question = question;
                },

                'getSelectedBook': function () {
                    return that.SelectedBook;
                },
                'getSelectedChapter': function () {
                    return that.SelectedChapter;
                },
                'getSelectedTopic': function () {
                    return that.SelectedTopic;
                },
                'getSelectedQuestion': function () {
                    return that.SelectedQuestion;
                },
                'setSelectedBook': function (index) {
                    that.SelectedBook = index;
                },
                'setSelectedChapter': function (index) {
                    that.SelectedChapter = index;
                },
                'setSelectedTopic': function (index) {
                    that.SelectedTopic = index;
                },
                'setSelectedQuestion': function (index) {
                    that.SelectedQuestion = index;
                },
                'setBookAfterCreation': function (book) {
                    that.bookAfterCreation = book;
                }
            }
        }])
        .service('navService', function ($mdSidenav, $mdUtil, $log, $timeout) {
            var $scope = this;
            $scope.toggleRight1 = buildToggler('nav1');
            $scope.toggleRight2 = buildToggler('nav2');
            $scope.toggleRight3 = buildToggler('nav3');
            $scope.toggleRight4 = buildToggler('nav4');
            $scope.toggleRight5 = buildToggler('nav5');
            $scope.toggleRight6 = buildToggler('nav6');

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

            /*$scope.close = function () {
             $mdSidenav('nav1').close()
             .then(function () {
             $log.debug("close LEFT is done");
             });
             }
             $scope.close = function () {
             $mdSidenav('nav2').close()
             .then(function () {
             $log.debug("close LEFT is done");
             });
             }
             $scope.close = function () {
             $mdSidenav('nav3').close()
             .then(function () {
             $log.debug("close RIGHT is done");
             });
             };
             $scope.close = function () {
             $mdSidenav('nav4').close()
             .then(function () {
             $log.debug("close RIGHT is done");
             });
             };
             $scope.close = function () {
             $mdSidenav('nav5').close()
             .then(function () {
             $log.debug("close RIGHT is done");
             });
             };
             $scope.close = function () {
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

        _self.loadQuestionBanks = function () {
            var deferred = $q.defer();
            firebaseService.getRefUserQuestionBanks().child(userService.getCurrentUser().userID).on('child_added', function (questionBankUniqueID) {
                firebaseService.getRefQuestionBank().child(questionBankUniqueID.key()).on('value', function (questionBank) {
                    _self.books.push(questionBank.val());
                    _self.bookId.push(questionBank.key());
                    deferred.resolve(_self.books)
                });
            });
            return deferred.promise;
        };
        _self.createQuestionBank = function (questionBankObject) {
            // firebaseService.getRefUserQuestionBanks().child(userService.getCurrentUser().userID).set();
            var questionBankUniqueId = firebaseService.getRefUserQuestionBanks().child(userService.getCurrentUser().userID).push({
                'memberships-type': 1,
                'timestamp': Firebase.ServerValue.TIMESTAMP
            });
            firebaseService.getRefQuestionBankMemberships().child(questionBankUniqueId.key()).child(userService.getCurrentUser().userID).set({
                "memberships-type": 1,
                'timestamp': Firebase.ServerValue.TIMESTAMP
            });
            firebaseService.getRefQuestionBank().child(questionBankUniqueId.key()).set(questionBankObject);
        };
        _self.loadChapters = function (questionBankUniqueID) {
            var deferred = $q.defer();
            _self.chapters = [];
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
        _self.createQuestion = function (questionBankUniqueID, chapterUniqueId, topicUniqueId, questionObject) {
            // var questionObject = {
            //     title: "title",
            //     type: 3, //QuestionTupe
            //     html: "htmlsllssllss",
            //     questiones: [{
            //         title: "Title",
            //         type: 1, // it only just radio and CheckBox
            //         html: "HTML",
            //         options: [{
            //             "html": "hello ",
            //             "correct": false,
            //             "discussion-html": "sajklksjls"
            //         },
            //         {
            //             "html": "helkkdjjs",
            //             "correct": true,
            //             "discussion-html": "hekejejsd"
            //         }],
            //       "discussion-html" : "String"
            //
            //     },
            //         ],
            //     "discussion-html": "hgshshs"
            // }
            firebaseService.getRefQuestionBank().child(questionBankUniqueID).child('chapters').child(chapterUniqueId).child("topics").child(topicUniqueId).child("questions").push(questionObject);
        };
    }

})();
