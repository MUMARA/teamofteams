(function () {
    'use strict';
    angular
        .module('app.quiz', ['core'])
        .directive('onBookRender', function ($timeout, quizService) {
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
        })
        .directive('onChapterRender', function ($timeout, quizService) {
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
        })
        .directive('onTopicRender', function ($timeout, quizService) {
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
        })
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
        .service('navService',function($mdSidenav,$mdUtil,$log,$timeout) {
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

            $scope.close = function () {
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
            };
        })

})();