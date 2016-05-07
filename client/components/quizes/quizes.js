/**
 * Created by Adnan Irfan on 06-Jul-15.
 */
(function() {
  'use strict';

  angular
    .module('app.quiz')
    .controller('QuizesController', QuizesController);

  QuizesController.$inject = ['quizesBankService', "$rootScope", "appConfig",
    "messageService", "$stateParams", "utilService", "$q", "$mdDialog",
    "quizesService", "$location", "userService", "naveService",
    "$firebaseArray", "$timeout", "$mdToast", "firebaseService",
    "$firebaseObject", "$sce", "authService", "$mdSidenav"
  ];

  function QuizesController(quizesBankService, $rootScope, appConfig,
    messageService, $stateParams, utilService, $q, $mdDialog, quizesService,
    $location, userService, naveService, $firebaseArray, $timeout, $mdToast,
    firebaseService, $firebaseObject, $sce, authService, $mdSidenav) {

    /*Private Variables*/
    var _self = this;
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
    _self.createQuiz = createQuiz;
    _self.addQBank = addQBank;
    _self.addChapter = addChapter;
    _self.addTopic = addTopic;


    _self.addQuestion = addQuestion;

    // Close Side nav Bar

    _self.closeBook = closeBook;
    _self.closeChapter = closeChapter;
    _self.closeQuestion = closeQuestion;
    _self.closeTopic = closeTopic;

    // side NAv Show n hide
    _self.showQuizQuestionBank = showQuizQuestionBank;
    _self.showTopics = showTopics;
    _self.showQuestions = showQuestions;
    _self.showQuestionView = showQuestionView;

    _self.showQuizChapter = showQuizChapter;
    // _self.setSelectedTopic = setSelectedTopic;


    _self.SelectedBook = null;
    _self.SelectedChapter = null;
    _self.SelectedTopic = null;
    _self.SelectedQuestion = null;

    _self.addQuestionBank = addQuestionBank;
    // _self.closeQuiz = closeQuiz;

    // _self.afterLoad = afterLoad;
    // Get only one id
    _self.bookId = '';
    _self.chapterId = '';
    _self.topicId = '';

    //all books chapters , topics , questions Id
    _self.books = [];
    _self.booksId = [];
    _self.quizes = [];
    _self.chaptersId = [];
    _self.chapters = [];
    _self.topicsId = [];
    _self.topics = [];
    _self.questions = [];


    // Old Code
    _self.groups = [];

    _self.quizesList = [];
    _self.quizesListKey = [];
    _self.subGroup = [];
    _self.myDatabase = [];
    _self.selectedGroup = null;



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

    _self.questionSetQuestions = [];


    function initQuestionBank() {
      quizesBankService.loadQuestionBanks().then(
        function(data) {
          _self.books = data;
        }
      )
    }
    initQuestionBank();

    function initQuiz() {
      quizesBankService.loadQuiz().then(
        function(data) {

          _self.Quiz = data;
        }
      )
    }
    initQuiz();



    /* End My Code */

    /*All Function*/

    // setTabs();


    // function setSelectedTopic(_self, index) {
    //   _self.selectedQuestionIndex = null;
    //
    // }
    function showQuizQuestionBank(quizIndex) {
      _self.selectedBookIndex = quizIndex;
      quizesService.setQuestionObject(null);
      quizesService.setChapter(null, null);
      quizesService.setTopic(null, null);
      quizesService.setQuestionObject(null);
      _self.quizQuestionBanks = null;
      _self.bookId = quizesBankService.bookId[quizIndex];

      _self.quizId = quizesBankService.quizesId[_self.selectedBookIndex];

      _self.showQuestionDetails = false;
      _self.questionView = null;
      quizesBankService.loadQuizQuestionBank(_self.quizId).then(
        function(questionBanks) {
          _self.quizQuestionBanks = questionBanks;

        });

      _self.chapterId = null;
      _self.topicId = null;
      _self.show = true;
      _self.chapters = [];
      _self.topics = [];
      _self.questions = [];

      _self.chaptersId = [];
      _self.topicsId = [];
      _self.questionsId = [];

    }
    // Show Quiz's question Banks' Chapters
    function showQuizChapter(ele, index) {
      _self.quizChapters = [];
      _self.quizChapterId = [];
      _self.questionBankschaptersId = [];
      _self.questionBankschapters = [];
      _self.questionBankUniqueID = quizesBankService.questionBanksId[index];

      quizesBankService.loadQuizChapter(_self.quizId, _self.questionBankUniqueID)
        .then(function(quizChapters) {
          for (var quizChapter in quizChapters[0]) {
            _self.quizChapters.push(quizChapters[0][quizChapter])
            _self.quizChapterId.push(quizChapter)
          }
        })
      var bookIndx = quizesBankService.bookId.indexOf(_self.questionBankUniqueID);
      // _self.questionBankschapters = _self.books[bookIndx].chapters;
      for (var chaptersUniqueId in _self.questionBankschapters) {
        _self.questionBankschaptersId.push(chaptersUniqueId)
        _self.questionBankschapters.push(_self.questionBankschapters[
          chaptersUniqueId])
        _self.questionBankschapters.push(_self.questionBankschapters[
          chaptersUniqueId].SelectedChapter = false)
      }
      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;
      _self.selectedChapterIndex = index;
      // quizesService.showQuizChapter(index);
      // quizesService.setSelectedTopic(null);
    }
    /*  Question Bank   */


    function showTopics(chapterIndex) {
      _self.QuizTopics = [];
      _self.QuizTopicsId = [];

      _self.questionBankTopicsId = [];
      _self.questionsId = [];
      _self.showQuestionDetails = false;
      // lOAD Quiz Topics
      _self.chapterId = _self.quizChapterId[chapterIndex];
      quizesBankService.loadQuizTopic(_self.quizId, _self.questionBankUniqueID,
        _self.chapterId).then(function(quizChapters) {
        for (var quizTopics in quizChapters[0].topics) {
          _self.QuizTopics.push(quizChapters[0].topics[quizTopics])
          _self.QuizTopicsId.push(quizTopics)
        }
      })

      var questionBankIndex = quizesBankService.bookId.indexOf(_self.questionBankUniqueID);
      _self.questionBankTopics = _self.books[questionBankIndex].chapters[
        _self.chapterId].topics;
      for (var topicUniqueId in _self.questionBankTopics) {
        _self.questionBankTopicsId.push(topicUniqueId);
      }
    }

    function showQuestions(topicIndex) {
      _self.questionbanksQuestion = []
      _self.questionbanksQuestionId = []
      _self.quizQuestion = []
      _self.quizQuestionId = []
      _self.topicId = _self.questionBankTopicsId[topicIndex];
      // lOAD Quiz Topics

      quizesBankService.loadQuestions(_self.quizId, _self.questionBankUniqueID,
        _self.chapterId, _self.topicId).then(function(quizTopics) {
        for (var quizQuestion in quizTopics[0].questions) {
          _self.quizQuestion.push(quizTopics[0].questions[quizQuestion])
          _self.quizQuestionId.push(quizQuestion)
        }
      })
      for (var questionbanksQuestionKeys in _self.questionBankTopics[
            _self.topicId]
          .questions) {
        _self.questionbanksQuestion.push(_self.questionBankTopics[_self
            .topicId]
          .questions[questionbanksQuestionKeys]);
        _self.questionbanksQuestionId.push(questionbanksQuestionKeys)
      }
    }
    // Shows Question Details
    function showQuestionView(question) {
      if (question !== null) {
        quizesService.setQuestionObject(question);
      }
      _self.showQuestionDetails = true;
      _self.questionView = question;
    }
    // Show
    function ShowNavBar() {
      _self.showbook = naveService.toggleRight1;
      _self.showbook();
    }

    function createQuiz(quizesData, img) {
      // ShowNavBar();
      _self.createBookLoader = true;
      var quizId = quizesData.id;
      if ($rootScope.newImg) {
        var x = utilService.base64ToBlob($rootScope.newImg);
        var temp = $rootScope.newImg.split(',')[0];
        var mimeType = temp.split(':')[1].split(';')[0];
        _self.saveFile(x, mimeType, quizesData.id)
          .then(function(url) {
            _self.imgLogoUrl = url + '?random=' + new Date();
            _self.quizData = {
              title: quizesData.name,
              desc: quizesData.desc,
              imgLogoUrl: _self.imgLogoUrl ||
                'img/question-bank.png',
            };
            quizesBankService.createQuiz(quizId, _self.quizData);
            _self.quizesData = {};
            _self.createBookLoader = false;
            ShowNavBar();
            $rootScope.newImg = null;
          })
          .catch(function() {
            _self.createBookLoader = false;
            alert('picture upload failed');
          });
      } else {
        _self.quizData = {
          title: quizesData.name,
          desc: quizesData.desc,
          imgLogoUrl: img || 'img/question-bank.png',
        };
        quizesBankService.createQuiz(quizId, _self.quizData);
        _self.quizesData = {};
        _self.createBookLoader = false;
        ShowNavBar();

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

      });

    };

    _self.saveFile = function(file, type, quizID) {
      var defer = $q.defer();
      var xhr = new XMLHttpRequest();
      xhr.open("GET", appConfig.apiBaseUrl +
        "/api/savequizBookPicture?quizID=" + quizID + "&file_type=" +
        type);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            defer.resolve(upload_file(file, response.signed_request,
              response.url));
          } else {
            defer.reject(alert("Could not get signed URL."));
          }
        }
      };
      // defer.resolve(true);
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
        //alert(xhr.responseText);
        if (xhr.status === 200) {
          messageService.showSuccess('Picture uploaded....');
          defer.resolve(url);

        }
      };
      xhr.onerror = function(error) {
        defer.reject(messageService.showSuccess(
          "Could not upload file."));
      };
      xhr.send(file);
      return defer.promise;
    }

    function closeBook() {
      _self.showbook = naveService.toggleRight1;
      _self.showbook();
    }

    //        Create Book Navigation End

    function addQBank() {
      if (_self.quizId) {
        $timeout(function() {
          _self.showChapter = naveService.toggleRight2;
          _self.showChapter();
        }, 0);
      } else {
        messageService.showSuccess('Please Select Quiz');
      }
    }

    function addChapter() {
      if (_self.bookId) {
        $timeout(function() {
          _self.showChapter = naveService.toggleRight5;
          _self.showChapter();
        }, 0);
      } else {
        messageService.showSuccess('Please Select Book');
      }
    }

    function closeChapter() {
      _self.showChapter = naveService.toggleRight2;
      _self.showChapter();
    }

    function addTopic() {

      if (_self.quizChapterId) {
        $timeout(function() {
          //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddTopic/' + _self.chapterId)
          _self.showTopic = naveService.toggleRight4;
          _self.showTopic();
        }, 0);
      } else {
        messageService.showSuccess('Please Select Chapter');

      }
    }

    function closeTopic() {
      _self.showTopic = naveService.toggleRight4;
      _self.showTopic();
    }

    function addQuestion() {
      if (_self.topicId) {
        $timeout(function() {
          //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddQuestion/' + _self.topicId)
          _self.showQuestion = naveService.toggleRight3;
          _self.showQuestion();
        }, 0);
      } else {
        messageService.showSuccess('Please Select Topic');

      }
    }

    function closeQuestion() {
      _self.showQuestion = naveService.toggleRight3;
      _self.showQuestion();
    }

    function addQuestionBank(qBank, quizIndex) {
      _self.selectedQuestionBank = {
        title: qBank.book.title,
        imgLogoUrl: qBank.book.imgLogoUrl
      };
      _self.bookId = quizesBankService.bookId[quizIndex];
      _self.quizId = quizesBankService.quizesId[_self.selectedBookIndex];
      if (_self.questionBanks.length == 0) {
        quizesBankService.addQuizQuestionBank(_self.selectedQuestionBank,
          _self
          .bookId,
          _self.quizId).then(function(res) {
          _self.quizQuestionBanks.push(_self.selectedQuestionBank)
        });
      } else {
        angular.forEach(_self.questionBanks, function(val, i) {
          if (val.title != _self.selectedQuestionBank.title && i ==
            _self
            .questionBanks
            .length -
            1) {
            quizesBankService.addQuizQuestionBank(_self.selectedQuestionBank,
              _self
              .bookId,
              _self.quizId).then(function(res) {
              _self.quizQuestionBanks.push(_self.selectedQuestionBank)
            });
          }
        })
      }
    }

    _self.QuizAddchapters = function(chapter, index) {
      var title = chapter.title;
      _self.chaptersId = _self.questionBankschaptersId[index];
      if (_self.quizChapters.length == 0) {
        quizesBankService.addQuizChapter(_self.quizId, _self.questionBankUniqueID,
          _self.chaptersId,
          title).then(function(res) {
          _self.quizChapters.push({
            title: title
          })
        })
      } else {
        angular.forEach(_self.quizChapters, function(val, i) {
          if (val.title != title && i == _self.quizChapters.length -
            1) {
            quizesBankService.addQuizChapter(_self.quizId, _self.questionBankUniqueID,
              _self.chaptersId,
              title).then(function(res) {
              _self.quizChapters.push({
                title: title
              })
            })
          }
        })
      }
    }


    _self.addQuizTopic = function(topicObj, index) {
      var title = topicObj.title;
      _self.topicId = _self.questionBankTopicsId[index];
      if (_self.QuizTopics.length == 0) {
        quizesBankService.addQuizTopic(_self.quizId, _self.questionBankUniqueID,
          _self.chapterId, _self.topicId, title).then(function(res) {
          _self.QuizTopics.push({
            title: title
          })
        }, function(err) {});
      } else {
        angular.forEach(_self.QuizTopics, function(val, i) {
          if (val.title != title && i == _self.QuizTopics.length -
            1) {
            quizesBankService.addQuizTopic(_self.quizId, _self.questionBankUniqueID,
              _self.chapterId, _self.topicId, title).then(
              function(
                res) {
                _self.QuizTopics.push({
                  title: title
                })
              },
              function(err) {});
          }
        })
      }
    }
    _self.QuizAddQuestion = function(questionObj, index) {
      _self.questionObject = {
        title: questionObj.title,
        type: questionObj.type,
        options: questionObj.options
      }
      _self.QuestionId = _self.questionbanksQuestionId[index];
      if (_self.quizQuestion.length == 0) {
        quizesBankService.addQuizQuestion(_self.quizId, _self.questionBankUniqueID,
          _self.chapterId, _self.topicId, _self.QuestionId, _self.questionObject
        ).then(function(res) {
          _self.quizQuestion.push(_self.questionObject)
        });
      } else {
        angular.forEach(_self.quizQuestion, function(val, i) {
          if (val.title != _self.questionObject.title && i == _self
            .quizQuestion
            .length -
            1) {
            quizesBankService.addQuizQuestion(_self.quizId, _self.questionBankUniqueID,
              _self.chapterId, _self.topicId, _self.QuestionId,
              _self
              .questionObject
            ).then(function(res) {
              _self.quizQuestion.push(_self.questionObject)

            });
          }
        })
      }
    }
  }
})();
