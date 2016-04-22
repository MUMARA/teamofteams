(function() {
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
    .service('quizBankService', ['firebaseService', 'userService', '$q',
      quizBank
    ])
    .factory('quizService', ["$location", function($location) {
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
        'getSelectedTab': function() {
          return _self.selectedTab;
        },
        'setSelectedTab': function(tab) {
          _self.selectedTab = tab;
        },

        'quiz': function() {

        },
        'getSelected': function() {
          return {
            book: _self.book,
            chapter: _self.chapter,
            topic: _self.topic
          }
        },
        'getBook': function() {
          return _self.book;
        },
        'getChapter': function() {
          return _self.chapter;
        },
        'getTopic': function() {
          return _self.topic;
        },
        'getQuestionObject': function() {
          return _self.question;
        },

        'getBookIndex': function() {
          return _self.bookIndex;
        },
        'getChapterIndex': function() {
          return _self.chapterIndex + '';
        },
        'getTopicIndex': function() {
          return _self.topicIndex;
        },
        'getBookAfterCreation': function() {
          return _self.bookAfterCreation;
        },


        'setBook': function(bookId, bookIndex) {
          _self.book = bookId
          _self.bookIndex = bookIndex
        },
        'setChapter': function(chapterId, chapterIndex) {
          _self.chapter = chapterId
          _self.chapterIndex = chapterIndex
        },
        'setTopic': function(topicId, topicIndex) {
          _self.topic = topicId
          _self.topicIndex = topicIndex
        },
        'setQuestionObject': function(question) {
          _self.question = question;
        },

        'getSelectedBook': function() {
          return _self.SelectedBook;
        },
        'getSelectedChapter': function() {
          return _self.SelectedChapter;
        },
        'getSelectedTopic': function() {
          return _self.SelectedTopic;
        },
        'getSelectedQuestion': function() {
          return _self.SelectedQuestion;
        },
        'setSelectedBook': function(index) {
          _self.SelectedBook = index;
        },
        'setSelectedChapter': function(index) {
          _self.SelectedChapter = index;
        },
        'setSelectedTopic': function(index) {
          _self.SelectedTopic = index;
        },
        'setSelectedQuestion': function(index) {
          _self.SelectedQuestion = index;
        },
        'setBookAfterCreation': function(book) {
          _self.bookAfterCreation = book;
        }
      }
    }])
    .service('navService', function($mdSidenav, $mdUtil, $log, $timeout) {
      var _self = this;
      _self.toggleRight1 = buildToggler('nav1');
      _self.toggleRight2 = buildToggler('nav2');
      _self.toggleRight3 = buildToggler('nav3');
      _self.toggleRight4 = buildToggler('nav4');
      _self.toggleRight5 = buildToggler('nav5');
      _self.toggleRight6 = buildToggler('nav6');

      function buildToggler(navID) {
        var debounceFn = $mdUtil.debounce(function() {
          $mdSidenav(navID)
            .toggle()
            .then(function() {
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
    _self.abc = []
    _self.loadQuestionBanks = function() {
      _self.books = [];
      _self.bookId = [];
      var deferred = $q.defer();
      var bookRef = firebaseService.getRefUserQuestionBanks().child(
        userService.getCurrentUser()
        .userID).on('child_added', function(questionBankUniqueID) {
        a(questionBankUniqueID.key(), function(res) {
          deferred.resolve(_self.books)
        })



      });

      return deferred.promise;
    };

    function a(questionBankUniqueID, cb) {
      firebaseService.getRefQuestionBank().child(questionBankUniqueID).once(
        'value',
        function(questionBank) {
          _self.abc.push(questionBank.val())
          console.log(_self.abc)
          console.log(questionBank.val(), "33333333333333333333")
          _self.books.push(questionBank.val());
          _self.bookId.push(questionBank.key());
          cb()
        });
    }
    _self.createQuestionBank = function(questionBankObject) {
      // firebaseService.getRefUserQuestionBanks().child(userService.getCurrentUser().userID).set();
      var questionBankUniqueId = firebaseService.getRefUserQuestionBanks().child(
        userService.getCurrentUser().userID).push({
        'memberships-type': 1,
        'timestamp': Firebase.ServerValue.TIMESTAMP
      });
      firebaseService.getRefQuestionBankMemberships().child(
          questionBankUniqueId.key()).child(userService.getCurrentUser().userID)
        .set({
          "memberships-type": 1,
          'timestamp': Firebase.ServerValue.TIMESTAMP
        });
      firebaseService.getRefQuestionBank().child(questionBankUniqueId.key())
        .set(questionBankObject);
    };
    _self.loadChapters = function(questionBankUniqueID) {

      var deferred = $q.defer();
      _self.chapters = [];
      _self.chaptersId = [];

      // Store chapters Ref
      var chapterRef = firebaseService.getRefQuestionBank().child(
        questionBankUniqueID).child(
        "chapters")
      chapterRef.off('child_added');
      // chapter Ref Value CallBack on Value Events
      var chapterRefValueCallBack = chapterRef.on('child_added', function(
        ChaptersUniqueId) {
        _self.chaptersId.push(ChaptersUniqueId.key());
        _self.chapters.push(ChaptersUniqueId.val());

        deferred.resolve(_self.chapters);
        // console.log(ChaptersUniqueId.val())
        // for (var key in ChaptersUniqueId.val()) {
        //   _self.chaptersId.push(key);
        //   _self.chapters.push(ChaptersUniqueId.val()[key]);
        //
        //   deferred.resolve(_self.chapters);
        // }
      });

      return deferred.promise;
    };
    _self.createChapter = function(questionBankUniqueID, chapterObject) {
      firebaseService.getRefQuestionBank().child(questionBankUniqueID).child(
        'chapters').push(chapterObject);
    };
    _self.createTopic = function(questionBankUniqueID, chapterUniqueId,
      topicObject) {
      firebaseService.getRefQuestionBank().child(questionBankUniqueID).child(
        'chapters').child(chapterUniqueId).child("topics").push(
        topicObject);
    };
    _self.loadTopic = function(questionBankUniqueID, chapterUniqueId) {
      var deferred = $q.defer();
      _self.topics = [];
      _self.topicsId = [];
      // Store topicRef Ref
      var topicRef = firebaseService.getRefQuestionBank().child(
        questionBankUniqueID).child(
        "chapters").child(chapterUniqueId).child("topics")

      // Topic Ref Value CallBack on Value Events
      var TopicValueCallBack = topicRef.on('child_added',
        function(topics) {
          _self.topicsId.push(topics.key());
          _self.topics.push(topics.val());
          console.log(topics.val())
          deferred.resolve(_self.topics);
          // for (var key in topics.val()) {
          //   _self.topicsId.push(key);
          //   _self.topics.push(topics.val()[key]);
          //   console.log(_self.topics)
          //   deferred.resolve(_self.topics);
          // }
        });
      // Topic off Value Events
      // topicRef.off("value", TopicValueCallBack)
      return deferred.promise;
    };
    _self.loadQuestions = function(questionBankUniqueID, chapterUniqueId,
      topicUniqueId) {
      var deferred = $q.defer();
      _self.questions = [];
      _self.questionId = [];
      //Store questions Ref
      var questionsRef = firebaseService.getRefQuestionBank().child(
          questionBankUniqueID).child(
          "chapters").child(chapterUniqueId).child("topics").child(
          topicUniqueId).child("questions")
        // Questions Ref Value CallBack on Value Events
      var questionsRefValueCallBack = questionsRef.once('value', function(
        questions) {
        _self.questionId.push(questions.key());
        _self.questions.push(questions.val());
        deferred.resolve(_self.questions);
        // for (var key in questions.val()) {
        //   _self.questionId.push(key);
        //   _self.questions.push(questions.val()[key]);
        //   deferred.resolve(_self.questions);
        // }
      });
      // Questions off Value Events
      // questionsRef.off("value", questionsRefValueCallBack)
      return deferred.promise;
    };
    _self.createQuestion = function(questionBankUniqueID, chapterUniqueId,
      topicUniqueId, questionObject) {
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
      firebaseService.getRefQuestionBank().child(questionBankUniqueID).child(
        'chapters').child(chapterUniqueId).child("topics").child(
        topicUniqueId).child("questions").push(questionObject);
    };
  }

})();
