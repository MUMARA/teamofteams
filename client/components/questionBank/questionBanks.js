/**
 * Created by Adnan Irfan on 06-Jul-15.
 */
(function() {
  'use strict';

  angular
    .module('app.quiz')
    .controller('QuizController', QuizController);

  QuizController.$inject = ['quizBankService', "$rootScope", "appConfig",
    "messageService", "$stateParams", "utilService", "$q", "$mdDialog",
    "quizService", "$location", "userService", "navService",
    "$firebaseArray", "$timeout", "$mdToast", "firebaseService",
    "$firebaseObject", "$sce", "authService", "$mdSidenav", "$state"
  ];

  function QuizController(quizBankService, $rootScope, appConfig,
    messageService, $stateParams, utilService, $q, $mdDialog, quizService,
    $location, userService, navService, $firebaseArray, $timeout, $mdToast,
    firebaseService, $firebaseObject, $sce, authService, $mdSidenav, $state) {

    /*Private Variables*/
    var _self = this;
    _self.booksNav = true;
    _self.img = '../../img/userImg1.svg';
    _self.show = false;
    _self.showQuestionDetails = false;
    // _self.showQuizBank = true;
    _self.showQuizList = false;
    _self.showQuizAssign = false;
    _self.questionView = null;
    //for toolbar text hide
    _self.chapterSearch = false;
    _self.topicSearch = false;
    _self.questionSearch = false;
    _self.quizSearch = false;
    _self.quizQuestionSearch = false;
    _self.chaptersSideNavSearch = false;
    _self.topicSideNavSearch = false;
    _self.questionSideNavSearch = false;
    _self.inputEnter = false;
    _self.selectedQuestionIndex = null;
    _self.selectedTopicIndex = null;
    _self.selectedChapterIndex = null;
    // For Empty Input Field
    _self.questionbankObj = {};
    _self.chapterObj = {};
    _self.topicObj = {};
    _self.question = {};
    // Show n Hide Side nav bar
    _self.ShowNavBar = ShowNavBar;
    // Create Function for Book, Chapter, Topic , question and Open Side nav bar
    _self.createBook = createBook;
    _self.addChapter = addChapter;
    _self.CreateChapter = CreateChapter;
    _self.addTopic = addTopic;
    _self.createTopic = createTopic;
    _self.addQuestion = addQuestion;
    // Close Side nav Bar

    _self.closeBook = closeBook;
    _self.closeChapter = closeChapter;
    _self.closeQuestion = closeQuestion;
    _self.closeTopic = closeTopic;

    // side NAv Show n hide
    _self.showChapters = showChapters;
    _self.showTopics = showTopics;
    _self.showQuestions = showQuestions;
    _self.showQuestionView = showQuestionView;


    _self.setSelectedBook = setSelectedBook;
    _self.setSelectedChapter = setSelectedChapter;
    _self.setSelectedTopic = setSelectedTopic;
    _self.SelectedBook = null;
    _self.SelectedChapter = null;
    _self.SelectedTopic = null;
    _self.SelectedQuestion = null;

    // Get only one id
    _self.bookId = '';
    _self.chapterId = '';
    _self.topicId = '';
    _self.Id = "";
    //all books chapters , topics , questions Id
    _self.books = [];
    _self.booksId = [];
    _self.quizes = [];
    _self.chaptersId = [];
    _self.chapters = [];
    _self.topicsId = [];
    _self.topics = [];
    _self.questions = [];

    //QUIZ SCEDULE variables & functions
    _self.selectedGroup = null;
    // _self.dataPush = dataPush;
    // _self.setSelectedQuiz = setSelectedQuiz;


    _self.books = [];
    _self.booksId = [];
    _self.quizes = [];
    _self.chaptersId = [];
    _self.chapters = [];
    _self.topicsId = [];
    _self.topics = [];
    _self.questions = [];
    _self.groups = [];
    //QUIZ SCHEDULED variables & functions
    _self.quizesList = [];
    _self.quizesListKey = [];
    _self.subGroup = [];
    _self.myDatabase = [];
    _self.selectedGroup = null;
    // _self.dataPush = dataPush;
    // _self.setSelectedQuiz = setSelectedQuiz;
    _self.questionSetQuestions = [];
    _self.questionSetAddQuestion = questionSetAddQuestion;
    _self.questionbankObj = {
      title: "",
      desc: "",
      imgLogoUrl: "",
      'timestamp': "",
      bookUniqueId: ""
    };

    function questionSetAddQuestion(questionSet) {
        // questionSet["title"] = "discussion-html";
      angular.forEach(questionSet.options, function(val) {
        delete val.$$hashKey;
      });
      var arr = questionSet.options;
      angular.forEach(questionSet.options, function(data, index) {
        if (questionSet.options[index].html === "") {
          arr.splice(index, 1);
        }
      });
      _self.questionSetQuestions.push(questionSet);
      _self.questionSet = {
        options: []
      };
    }
    // initialized QuestionBank
    function initQuestionBank() {
      quizBankService.loadQuestionBanks().then(
        function(data) {
          _self.books = data;
        }
      )
    }


    initQuestionBank();

    /* End My Code */

    /*All Function*/

    // setTabs();

    _self.correctAnswer = function() {
      angular.forEach(_self.question.options, function(val, index) {
        index == _self.correct ? _self.question.options[_self.correct].correct =
          true : _self.question.options[index].correct = false;
      });
    };
    _self.correctQuestionSetAnswer = function() {
      angular.forEach(_self.questionSet.options, function(val, index) {
        index == _self.correct ? _self.questionSet.options[_self.correct]
          .correct = true : _self.questionSet.options[index].correct =
          false;
      });
    };

    function setSelectedTopic(_self, index) {
      _self.topicId = quizBankService.topicsId[index];

      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = index;
      quizService.setSelectedTopic(index);
    }

    function setSelectedChapter(_self, index) {
      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;
      quizService.setSelectedChapter(index);
      quizService.setSelectedTopic(null);
    }

    function setSelectedBook(_self, index) {

      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;
      _self.selectedChapterIndex = null;
      quizService.setSelectedChapter(null);
      quizService.setSelectedTopic(null);
    }
    /*  Question Bank   */
    function showChapters(bookIndex) {
      _self.selectedBookIndex = bookIndex;
      quizService.setQuestionObject(null);
      quizService.setChapter(null, null);
      quizService.setTopic(null, null);
      quizService.setQuestionObject(null);
      // quizService.book = bookIndex;
      _self.bookId = quizBankService.bookId[bookIndex];

      _self.showQuestionDetails = false;
      _self.questionView = null;
      $state.go("user.questionbank", {
        questionBankUniqueID: _self.bookId
      });

      quizBankService
        .loadChapters(_self.bookId).then(
          function(chapters) {
            _self.chapters = chapters;
          });

      _self.chapterId = null;
      _self.topicId = null;
      _self.show = true;
      _self
        .chapters = [];
      _self.topics = [];
      _self.questions = [];

      _self.chaptersId = [];
      _self.topicsId = [];
      _self.questionsId = [];
    }

    function showTopics(chapterIndex) {
      _self.selectedChapterIndex = chapterIndex;
      quizService.setTopic(null, null);
      quizService.setQuestionObject(null);
      _self.topics = [];
      _self.questions = [];

      _self.topicsId = [];
      _self.questionsId = [];
      _self.showQuestionDetails = false;
      _self.questionView = null;
      _self.chapterId = quizBankService.chaptersId[chapterIndex];
      quizBankService.loadTopic(_self.bookId, _self.chapterId).then(
        function(topics) {
          _self.topics = topics;
        });
    }

    function showQuestions(topicIndex) {
      _self.selectedTopicIndex = topicIndex;
      _self.topicId = quizBankService.topicsId[topicIndex];
      _self.showQuestionDetails = false;
      _self.questionView = null;
      _self.questions = [];
      quizBankService.loadQuestions(_self.bookId, _self.chapterId, _self.topicId)
        .then(function(questions) {
          _self.questions = questions;
        });

    }

    // Shows Question Details
    function showQuestionView(question, index) {
      _self.selectedQuestionIndex = index;
      if (question !== null) {
        quizService.setQuestionObject(question);
      }
      _self.showQuestionDetails = true;
      _self.questionView = question;
    }
    // Show
    function ShowNavBar() {
      _self.showbook = navService.toggleRight1;
      _self.showbook();
    }

    function createBook(questionBankObject, img) {
      _self.createBookLoader = true;
      var questionBankUniqueID = _self.questionbankObj.bookUniqueId;
      if ($rootScope.newImg) {
        var x = utilService.base64ToBlob($rootScope.newImg);
        console.log(x);
        var temp = $rootScope.newImg.split(',')[0];
        var mimeType = temp.split(':')[1].split(';')[0];
          console.dir(x)
        _self.saveFile(x, mimeType, questionBankUniqueID)
          .then(function(url) {
            _self.imgLogoUrl = url + '?random=' + new Date();
            _self.questionbankObj = {
              title: questionBankObject.name,
              desc: questionBankObject.desc,
              imgLogoUrl: _self.imgLogoUrl || 'img/question-bank.png',
              'timestamp': Firebase.ServerValue.TIMESTAMP
            };
            quizBankService.createQuestionBank(questionBankUniqueID, _self.questionbankObj);
            _self.createBookLoader = false;
            ShowNavBar();
          })
          .catch(function() {
            _self.createBookLoader = false;
            alert('picture upload failed');
          });
      } else {
        _self.createBookLoader = false;
        ShowNavBar();
        _self.questionbankObj = {
          title: questionBankObject.name,
          desc: questionBankObject.desc,
          imgLogoUrl: 'img/question-bank.png',
          'timestamp': Firebase.ServerValue.TIMESTAMP
        };
        quizBankService.createQuestionBank(questionBankUniqueID, _self.questionbankObj);
      }

    }

    _self.selectBookPoster = function(ev) {
      $mdDialog.show({
        controller: "DialogController as ctrl",
        templateUrl: 'directives/dilogue2.tmpl.html',
        targetEvent: ev
      }).then(function(picture) {
        $rootScope.newImg = picture;
      }, function(err) {
        console.log(err);

      });

    };

    _self.saveFile = function(file, type, questionBankUniqueID) {
      var defer = $q.defer();
      var xhr = new XMLHttpRequest();
      xhr.open("GET", appConfig.apiBaseUrl +
        "/api/savequestionBankPicture?questionBankID=" +
        questionBankUniqueID + "&file_type=" +
        type);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              var response = JSON.parse(xhr.responseText);
            console.dir(response)
            defer.resolve(upload_file(file, response.signed_request,
              response.url));
          } else {
            defer.reject("Could not get signed URL.");
          }
        }
      };
      /*remove it*/
      xhr.send();
      return defer.promise;
    };

    function upload_file(file, signed_request, url) {

      var defer = $q.defer();
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", signed_request);
      xhr.setRequestHeader('x-amz-acl', 'public-read');
      xhr.onload = function(data) {
        if (xhr.status === 200) {
          messageService.showSuccess('Picture uploaded....');
          defer.resolve(url);

        }
      };
      xhr.onerror = function(error) {
        defer.reject(messageService.showSuccess("Could not upload file."));
      };
      console.log(file);
      xhr.send(file);
      return defer.promise;
    }

    function closeBook() {
      _self.showbook = navService.toggleRight1;
      _self.showbook();
    }

    //        Create Book Navigation End

    function CreateChapter(chapterObj) {
      _self.chapterObj = {
        title: chapterObj.title,
        desc: chapterObj.desc,
        timestamp: Firebase.ServerValue.TIMESTAMP
      };
      quizBankService.createChapter(_self.bookId, _self.chapterObj).then(
        function() {
          quizBankService.loadChapters(_self.bookId).then(function(chapters) {
            _self.chapters = chapters;
          });
          _self.chapterObj = {};
          _self.showChapter();
        });
    }

    function addChapter() {
      if (_self.bookId) {
        $timeout(function() {
          _self.showChapter = navService.toggleRight2;
          _self.showChapter();
        }, 0);
      } else {
        messageService.showSuccess('Please Select Book');
      }
    }

    function closeChapter() {
      _self.showChapter = navService.toggleRight2;
      _self.showChapter();
    }


    function createTopic(topicObj) {
      _self.topicObj = {
        title: topicObj.title,
        desc: topicObj.desc,
        'timestamp': Firebase.ServerValue.TIMESTAMP
      };
      quizBankService.createTopic(_self.bookId, _self.chapterId, _self.topicObj)
        .then(function(data) {
          quizBankService.loadTopic(_self.bookId, _self.chapterId).then(
            function(topics) {
              _self.topics = topics;
              _self.topicObj = {};
              _self.showTopic();
            });
        });
    }

    function addTopic() {
      if (_self.chapterId) {
        $timeout(function() {
          _self.showTopic = navService.toggleRight4;
          _self.showTopic();
        }, 0);
      } else {
        messageService.showSuccess('Please Select Chapter');

      }
    }

    function closeTopic() {
      _self.showTopic = navService.toggleRight4;
      _self.showTopic();
    }

    _self.showTextangular = []
    _self.closeTextangular = function(sideNavId, index) {
      !isNaN(sideNavId) ? _self.showTextangular[sideNavId] = !
        _self.showTextangular[
          sideNavId] :
        $mdSidenav(sideNavId).toggle();
    }
    _self.showTextangularForQuestionSet = []
    _self.showTextangularSideNav = function(sideNavId, index) {
      !isNaN(sideNavId) ? _self.showTextangularForQuestionSet[
          sideNavId] = !_self.showTextangularForQuestionSet[sideNavId] :
        $mdSidenav(sideNavId).toggle();
    }

    function addQuestion() {
      if (_self.topicId) {
        $timeout(function() {
          _self.showQuestion = navService.toggleRight3;
          _self.showQuestion();
        }, 0);
      } else {
        messageService.showSuccess('Please Select Topic');

      }
    }

    function closeQuestion() {
      _self.showQuestion = navService.toggleRight3;
      _self.showQuestion();
    }


    //AddQuestion Controller Work

    var idCounter = 3;
    this.showRadioOptions = false;
    this.showCheckOptions = false;
    _self.showQuestionSet = false;
    this.showAddButton = false;
    this.myAnswer = undefined;
    this.myType = '';
    _self.answerTag = [];
    _self.myTop = ['40px', '50px'];
    var topMargin = 50;
    this.showCheckText = false;
    this.topicId = $stateParams.id;
    _self.questionSet = {};
    //Answer Types.
    this.types = [{
      name: 'Radio Button'
    }, {
      name: 'CheckBox'
    }, {
      name: 'Question Set'
    }];
    //If Answer Type Changes.
    this.typeChanged = function() {

      _self.radioValue = '';
      _self.myAnswer = undefined;
      _self.myTop = ['40px', '90px'];
      topMargin = 50;
      angular.forEach(_self.question.options, function(data) {
        if (data.id === true) {
          data.id = false;
        }
      });
    };

    //Setting different inputs.
    _self.setBoxValue = function() {
      this.showAddButton = true;
      _self.question.options = [{
        html: '',
        "discussion": "",
        correct: false
      }];

      _self.questionSet.options = [{
        html: '',
        "discussion": "",
        correct: false
      }];
      if (_self.myType.name === "1") {
        _self.showRadioOptions = true;
        _self.showCheckOptions = false;
        _self.showQuestionSet = false;
        _self.answerTag = [];
        _self.myAnswer = undefined;
      } else if (_self.myType.name === "2") {
        _self.showCheckOptions = true;
        _self.showRadioOptions = false;
        _self.showQuestionSet = false;
        _self.answerTag = [];
        _self.myAnswer = undefined;
      } else {
        _self.showCheckOptions = false;
        _self.showRadioOptions = false;
        _self.showQuestionSet = true;
        _self.answerTag = [];
        _self.myAnswer = undefined;
      }
    };
    //Push new input fields.
    _self.addOption = function() {
      _self.question.options.push({
        html: '',
        correct: false,
        "discussion": ""
      });
    };
    _self.addQuestionSetOption = function() {
      _self.questionSet.options.push({
        html: '',
        correct: false,
        "discussion": ""
      });
    };
    //Delete Option
    _self.deleteOption = function(optionIndex) {
      _self.question.options.splice(optionIndex, 1);
    };
    //Delete Question Set Option
    _self.deleteQuestionSetOption = function(optionIndex) {
      if (optionIndex > -1) {
        _self.questionSet.options.splice(optionIndex, 1);
      }
    };

    //Sets Answer if Type CheckBox is selected.
    _self.setCheckBoxValue = function(questionId) {
      if (_self.question.options[questionId].id === true) {
        _self.question.options[questionId].correct = true;
        _self.answerTag.push('one');
      } else if (_self.question.options[questionId].id === false) {
        _self.question.options[questionId].correct = false;
        _self.answerTag.pop();
      }
    };


    //Save and Exit Button
    _self.createQuestion = function(question) {
      if (question.type == 3) {
        delete question.options;
        question.questiones = _self.questionSetQuestions;
      } else {
        delete question.desc;
        var arr = question.options;
        angular.forEach(question.options, function(data, index) {
          delete data.$$hashKey;
        });
        angular.forEach(question.options, function(data, index) {
          if (question.options[index].html === "") {
            arr.splice(index, 1);
          }
        });
        question.options = arr;

      }
      quizBankService.createQuestion(_self.bookId, _self.chapterId, _self.topicId,
        question).then(function() {
        _self.question = {};
        _self.question.html = null;
        _self.question.title = null;
        _self.correct = null;
        _self.closeQuestion();
      });
    };
  }
})();
