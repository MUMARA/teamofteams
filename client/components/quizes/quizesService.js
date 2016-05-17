(function() {
  'use strict';
  angular
    .module('app.quiz')
    .service('quizesBankService', ['firebaseService', 'userService', '$q',
      quizBank
    ])
    .factory('quizesService', ["$location", function($location) {
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
    .service('naveService', function($mdSidenav, $mdUtil, $log, $timeout) {
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
    });


  function quizBank(firebaseService, userService, $q) {
    var _self = this;
    _self.books = [];
    _self.quizID = [];

    _self.bookId = [];
    _self.chapters = [];
    _self.chaptersId = [];
    _self.topics = [];
    _self.topicsId = [];
    _self.questions = [];
    _self.questionId = [];
    _self.abc = [];
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
    // Load Quiz function start
    _self.loadQuiz = function() {
      _self.quizes = [];
      _self.quizesId = [];
      var deferred = $q.defer();
      var bookRef = firebaseService.getRefUserQuiz().child(
        userService.getCurrentUser().userID).on('child_added', function(
        quizUniqueID) {

        loadingQuiz(quizUniqueID.key(), function(res) {
          deferred.resolve(_self.quizes)
        })
      });
      return deferred.promise;
    }; // Load Quiz function end

    // Load Quiz function start
    function loadingQuiz(quizUniqueID, cb) {
      firebaseService.getRefQuiz().child(quizUniqueID).once(
        'value',
        function(quiz) {
          _self.quizes.push(quiz.val());
          _self.quizesId.push(quiz.key());
          cb()
        });
    } // Load Quiz function end

    // Create quiz Function start
    _self.createQuiz = function(id, quizObject) {
      firebaseService.getRefUserQuiz().child(
        userService.getCurrentUser().userID).child(id).set({
        'memberships-type': 1,
        'timestamp': Firebase.ServerValue.TIMESTAMP
      });

      firebaseService.getRefQuizNames().child(id)
        .set({
          title: quizObject.title
        });
      firebaseService.getRefQuiz().child(id)
        .set(quizObject);

    }; // Create quiz Function end

    // _self.loadChapters = function(questionBankUniqueID) {
    //   var deferred = $q.defer();
    //   _self.chapters = [];
    //   _self.chaptersId = [];
    //   firebaseService.getRefQuestionBank().child(questionBankUniqueID).child(
    //     "chapters").once('value', function(ChaptersUniqueId) {
    //     for (var key in ChaptersUniqueId.val()) {
    //       _self.chaptersId.push(key);
    //       _self.chapters.push(ChaptersUniqueId.val()[key]);
    //       deferred.resolve(_self.chapters);
    //     }
    //   });
    //   return deferred.promise;
    // };

    // Load Quiz question Banks start
    _self.loadQuizQuestionBank = function(quizesUniqueID) {
      var deferred = $q.defer();
      _self.questionBanks = [];
      _self.questionBanksId = [];
      firebaseService.getRefQuiz().child(quizesUniqueID).child(
        "questionbanks").once('value', function(questionBankUniqueId) {
        for (var key in questionBankUniqueId.val()) {
          _self.questionBanksId.push(key);
          _self.questionBanks.push(questionBankUniqueId.val()[key]);
          deferred.resolve(_self.questionBanks);
        }
      });
      return deferred.promise;
    }; // Load Quiz question Banks end

    // Add Quiz Topic Start
    _self.addQuizTopic = function(quizid, questionBankUniqueID,
      chapterUniqueId, topicUniqueId, title) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizid).child(
        'questionbanks').child(questionBankUniqueID).child("chapters").child(
        chapterUniqueId).child("topics").child(topicUniqueId).set({
        title: title
      }, function(err) {
        if (err == null) {
          deferred.resolve("saved");
        } else {
          deferred.reject("Error: " + err);
        }
      });
      return deferred.promise;
    }; // Add Quiz Topic end

    // Add Quiz Question Start
    _self.addQuizQuestion = function(quizid, questionBankUniqueID,
      chapterUniqueId, topicUniqueId, questionId, questionsObj) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizid).child(
        'questionbanks').child(questionBankUniqueID).child("chapters").child(
        chapterUniqueId).child("topics").child(topicUniqueId).child(
        "questions").child(
        questionId).set(questionsObj, function(err) {
        if (err == null) {
          deferred.resolve("saved");
        } else {
          deferred.reject("Error: " + err);
        }
      });
      return deferred.promise;
    }; // Add Quiz Question end

    //Add Quiz QuestionBank start
    _self.addQuizQuestionBank = function(qBank, questionBankUniqueId,
      quizUniqueId) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizUniqueId).child(
        'questionbanks').child(questionBankUniqueId).set(qBank, function(
        err) {
        if (err == null) {
          deferred.resolve("saved");
        } else {
          deferred.reject("Error: " + err);
        }
      });
      return deferred.promise;
    }; //Add Quiz QuestionBank end

    //Add Quiz Chapter start
    _self.addQuizChapter = function(quizId, questionBankUniqueId,
      chapterId, chaptertitle) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizId).child(
        'questionbanks').child(questionBankUniqueId).child("chapters").child(
        chapterId).set({
        title: chaptertitle
      }, function(err) {
        if (err == null) {
          deferred.resolve("saved");
        } else {
          deferred.reject("Error: " + err);
        }
      });
      return deferred.promise;

    }; //Add Quiz Chapter end

    //Load Quiz Chapter start
    _self.loadQuizChapter = function(quizId, questionBankUniqueId) {
      _self.quizChapters = [];
      _self.quizChaptersId = [];
      var deferred = $q.defer();
      var loadQuizChapters = firebaseService.getRefQuiz().child(quizId).child(
        'questionbanks').child(questionBankUniqueId).child("chapters")
      loadQuizChapters.off("child_added");
      loadQuizChapters.off("child_removed");
      loadQuizChapters.on(
        "child_added",
        function(snapshot) {
          _self.quizChapters.push(snapshot.val())
          _self.quizChaptersId.push(snapshot.key())
          deferred.resolve(_self.quizChapters);
        });
      loadQuizChapters.on(
        "child_removed",
        function(snapshot) {
          _self.quizChapters.splice(_self.quizChaptersId.indexOf(snapshot
            .key()), 1)
          _self.quizChaptersId.splice(_self.quizChaptersId.indexOf(
            snapshot
            .key()), 1);
          deferred.resolve();
        });
      return deferred.promise;

    }; //Load  Quiz Chapter end

    // Load Quiz Topic Start
    _self.loadQuizTopic = function(quizId, questionBankUniqueId,
      chapterId) {
      _self.quizTopics = [];
      _self.quizTopicsId = [];
      var deferred = $q.defer();
      var loadQuizTopics = firebaseService.getRefQuiz().child(quizId).child(
        'questionbanks').child(questionBankUniqueId).child("chapters").child(
        chapterId).child("topics")
      loadQuizTopics.off("child_added");
      loadQuizTopics.off("child_removed");
      loadQuizTopics.on(
        "child_added",
        function(snapshot) {
          _self.quizTopics.push(snapshot.val())
          _self.quizTopicsId.push(snapshot.key())
          deferred.resolve(_self.quizTopics)
        });
      loadQuizTopics.on(
        "child_removed",
        function(snapshot) {
          _self.quizTopics.splice(_self.quizTopicsId.indexOf(snapshot
              .key()),
            1)
          _self.quizTopicsId.splice(_self.quizTopicsId.indexOf(snapshot
            .key()), 1);
          deferred.resolve();
        });
      return deferred.promise;

    }; // Load Quiz Topic end

    // Load Quiz Questions start
    _self.loadQuestions = function(quizId, questionBankUniqueID,
      chapterUniqueId,
      topicId) {
      var deferred = $q.defer();
      _self.questions = [];
      _self.questionId = [];
      var loadQuizQuestionRef = firebaseService.getRefQuiz().child(quizId).child(
        'questionbanks').child(questionBankUniqueID).child("chapters").child(
        chapterUniqueId).child("topics").child(topicId).child(
        "questions")
      loadQuizQuestionRef.off("child_added");
      loadQuizQuestionRef.off("child_removed");
      loadQuizQuestionRef.on(
        "child_added",
        function(snapshot) {
          _self.questions.push(snapshot.val())
          _self.questionId.push(snapshot.key())
          deferred.resolve(_self.questions)
        });
      loadQuizQuestionRef.on(
        "child_removed",
        function(snapshot) {
          _self.questions.splice(_self.questionId.indexOf(snapshot
              .key()),
            1)
          _self.questionId.splice(_self.questionId.indexOf(snapshot
            .key()), 1);
          deferred.resolve();
        });

      return deferred.promise;
    }; // Load Quiz Questions end

    // Delete Quiz Question Bank Start

    _self.deleteQuizQuestionBank = function(questionBankUniqueId,
      quizUniqueId) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizUniqueId).child(
        'questionbanks').child(questionBankUniqueId).set(null,
        function(
          err) {
          if (err == null) {
            deferred.resolve("saved");
          } else {
            deferred.reject("Error: " + err);
          }
        });
      return deferred.promise;
    }; // Delete Quiz Question Bank end

    // Delete Quiz Chapter Start

    _self.deleteQuizChapter = function(quizId, questionBankUniqueId,
      chapterId) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizId).child(
        'questionbanks').child(questionBankUniqueId).child("chapters").child(
        chapterId).set(null, function(err) {
        if (err == null) {
          deferred.resolve("saved");
        } else {
          deferred.reject("Error: " + err);
        }
      });
      return deferred.promise;

    }; // Delete Quiz Chapter end

    // Delete Quiz Topic Start
    _self.deleteQuizTopics = function(quizid, questionBankUniqueID,
      chapterUniqueId, topicUniqueId) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizid).child(
        'questionbanks').child(questionBankUniqueID).child("chapters").child(
        chapterUniqueId).child("topics").child(topicUniqueId).set(null,
        function(err) {

          if (err == null) {
            deferred.resolve("saved");
          } else {
            deferred.reject("Error: " + err);
          }
        });
      return deferred.promise;
    }; // Delete Quiz Topic End

    // Delete Quiz Question Start
    _self.deleteQuizQuestions = function(quizid, questionBankUniqueID,
      chapterUniqueId, topicUniqueId, questionId) {
      var deferred = $q.defer();
      firebaseService.getRefQuiz().child(quizid).child(
        'questionbanks').child(questionBankUniqueID).child("chapters").child(
        chapterUniqueId).child("topics").child(topicUniqueId).child(
        "questions").child(
        questionId).set(null, function(err) {
        if (err == null) {
          deferred.resolve("saved");
        } else {
          deferred.reject("Error: " + err);
        }
      });
      return deferred.promise;
    };
  }

})();
