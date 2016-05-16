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

    // initailize QuestionBank
    function initQuestionBank() {
      quizesBankService.loadQuestionBanks().then(
        function(data) {
          _self.books = data;
        }
      )
    }
    initQuestionBank();
    // initailize Quiz
    function initQuiz() {
      quizesBankService.loadQuiz().then(
        function(data) {

          _self.Quiz = data;
        }
      )
    }
    initQuiz();

    // Shows Question Details
    function showQuestionView(question, index) {
      _self.selectedQuestionIndex = index;
      if (question !== null) {
        quizService.setQuestionObject(question);
      }
      _self.showQuestionDetails = true;
      _self.questionView = question;
    }

    // setTabs();


    // function setSelectedTopic(_self, index) {
    //   _self.selectedQuestionIndex = null;
    //
    // }

    // Show Quiz Qustion Bank start
    function showQuizQuestionBank(quizIndex) {
      _self.quizChapters = [];
      _self.quizChapterId = [];
      _self.QuizTopics = [];
      _self.quizTopicsId = [];
      _self.quizQuestion = [];
      _self.quizQuestionId = [];
      _self.questionView = null;
      //_self.topics
      _self.selectedQuizIndex = quizIndex;
      quizesService.setQuestionObject(null);
      quizesService.setChapter(null, null);
      quizesService.setTopic(null, null);
      quizesService.setQuestionObject(null);
      _self.quizQuestionBanks = [];

      _self.quizId = quizesBankService.quizesId[_self.selectedQuizIndex];
      angular.forEach(_self.books, function(val) {
        val.SelectedBook = false;
      })
      _self.showQuestionDetails = false;
      _self.questionView = null;

      quizesBankService.loadQuizQuestionBank(_self.quizId).then(
        function(questionBanks) {
          _self.quizQuestionBanks = questionBanks;
          _self.bookId = quizesBankService.questionBanksId[quizIndex];
          angular.forEach(quizesBankService.questionBanksId, function(
            QuizQuestionBank) {
            angular.forEach(quizesBankService.bookId, function(
              QuestionBank, i) {
              if (QuizQuestionBank === QuestionBank) {
                _self.books[i].SelectedBook = true;
              }
            })
          })
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

    } // Show Quiz Qustion Bank end

    // Show Quiz's question Banks' Chapters start
    function showQuizChapter(ele, index) {
      _self.selectedquestionBankIndex = index;
      _self.questionView = null;
      _self.quizChapters = [];
      _self.quizChapterId = [];
      _self.QuizTopics = [];
      _self.quizTopicsId = [];
      _self.quizQuestion = [];
      _self.quizQuestionId = [];
      _self.questionBankschaptersId = [];
      _self.questionBankschapters = [];

      _self.questionBankUniqueID = quizesBankService.questionBanksId[index];
      var bookIndx = quizesBankService.bookId.indexOf(_self.questionBankUniqueID);
      _self.questionBanksAllChapters = _self.books[bookIndx].chapters;
      var chaptersUniqueId;

      for (chaptersUniqueId in _self.questionBanksAllChapters) {
        _self.questionBankschaptersId.push(chaptersUniqueId)
        _self.questionBankschapters.push(_self.questionBanksAllChapters[
          chaptersUniqueId])
        _self.questionBanksAllChapters[
          chaptersUniqueId].SelectedChapter = false
      }
      // loadQuiz Chapter function start
      quizesBankService.loadQuizChapter(_self.quizId, _self.questionBankUniqueID)
        .then(function(Chapters) {
          _self.quizChapters = quizesBankService.quizChapters;
          _self.quizChapterId = quizesBankService.quizChaptersId;
          angular.forEach(_self.quizChapterId, function(quizChapterId,
              i) {
              angular.forEach(_self.questionBankschaptersId,
                  function(
                    questionBankschaptersId) {
                    if (quizChapterId == questionBankschaptersId) {
                      var index = _self.questionBankschaptersId.indexOf(
                        quizChapterId);

                      _self.questionBankschapters[
                        index].SelectedChapter = true
                    }
                  }) //quizChapterId forEach end

            }) //questionBankschaptersId forEach end

        }) //loadQuizChapter end


      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;

    } // Show Quiz's question Banks' Chapters end

    /*  Question Bank   */

    // Show Quiz's Topic start
    function showTopics(chapterIndex) {
      _self.QuizTopics = [];
      _self.QuizTopicsId = [];
      _self.questionView = null;
      _self.selectedChapterIndex = chapterIndex;
      _self.quizTopicsId = [];
      _self.quizQuestion = [];
      _self.quizQuestionId = [];
      _self.questionBankTopicsId = [];
      _self.questionBankTopics = []
      _self.questionsId = [];
      _self.showQuestionDetails = false;

      // lOAD Quiz Topics
      _self.chapterId = _self.quizChapterId[chapterIndex];

      var questionBankIndex = quizesBankService.bookId.indexOf(_self.questionBankUniqueID);
      _self.questionBankTopic = _self.books[questionBankIndex].chapters[
        _self.chapterId].topics;

      for (var topicUniqueId in _self.questionBankTopic) {
        _self.questionBankTopics.push(_self.questionBankTopic[topicUniqueId])
        _self.questionBankTopic[topicUniqueId].SelectedTopic = false;
        _self.questionBankTopicsId.push(topicUniqueId);

      }

      quizesBankService.loadQuizTopic(_self.quizId, _self.questionBankUniqueID,
          _self.chapterId).then(function(quizTopics) {
          _self.QuizTopics = quizesBankService.quizTopics;
          _self.QuizTopicsId = quizesBankService.quizTopicsId;

          angular.forEach(_self.QuizTopicsId, function(QuizTopicsId,
              i) {
              angular.forEach(_self.questionBankTopicsId, function(
                  questionBankTopicsId) {
                  if (QuizTopicsId == questionBankTopicsId) {
                    var index = _self.questionBankTopicsId.indexOf(
                      QuizTopicsId);
                    _self.questionBankTopics[
                      index].SelectedTopic = true
                  }
                }) // questionBankTopicsId forEach
            }) // QuizTopicsId forEach
        }) //loadQuizTopic function end


    } // Show Quiz's Topic end

    // Show Quiz's Question start
    function showQuestions(topicIndex) {
      _self.selectedTopicIndex = topicIndex;
      _self.questionView = null;
      _self.questionbanksQuestion = []
      _self.questionbanksQuestionId = []
      _self.quizQuestion = []
      _self.quizQuestionId = []
      _self.topicId = _self.questionBankTopicsId[topicIndex];

      // Load QuestionBank Questions
      for (var questionbanksQuestionKeys in _self.questionBankTopics[
            topicIndex]
          .questions) {
        _self.questionbanksQuestion.push(_self.questionBankTopics[topicIndex]
          .questions[questionbanksQuestionKeys]);
        _self.questionBankTopics[topicIndex]
          .questions[questionbanksQuestionKeys].SelectedQuestion = false;
        _self.questionbanksQuestionId.push(questionbanksQuestionKeys)

      }
      // lOAD Quiz Questions
      quizesBankService.loadQuestions(_self.quizId, _self.questionBankUniqueID,
          _self.chapterId, _self.topicId).then(function(quizQuestions) {
          _self.quizQuestion = quizQuestions;
          _self.quizQuestionId = quizesBankService.questionId;

          angular.forEach(_self.quizQuestionId, function(quizQuestionId, i) {

              angular.forEach(_self.questionbanksQuestionId, function(
                  questionbanksQuestionId) {

                  if (quizQuestionId == questionbanksQuestionId) {
                    var index = _self.questionbanksQuestionId.indexOf(
                      quizQuestionId);
                    _self.questionbanksQuestion[
                      index].SelectedQuestion = true
                  }

                }) //questionbanksQuestionId forEach end

            }) //quizQuestionId forEach end

        }) // loadQuestions function end

    } // Show Quiz's Question end

    // Shows Question Details
    function showQuestionView(question, index) {
      _self.selectedQuestionIndex = index;
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
    // create Quiz Function start
    function createQuiz(quizesData, img) {
      // ShowNavBar();
      _self.createBookLoader = true;
      var quizId = quizesData.id;
      // if new Image save to amazon first then save url in firebase
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
        // if Image is not new then Save default image in firebase
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
    } // create Quiz Function end

    // select Quiz Image function start
    _self.selectQuizImage = function(ev) {
      $mdDialog.show({
        controller: "DialogController as ctrl",
        templateUrl: 'directives/dilogue2.tmpl.html',
        targetEvent: ev
      }).then(function(picture) {
        $rootScope.newImg = picture;
      }, function(err) {

      });

    }; // select Quiz Image function end

    // Image Url Function Start
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
            console.log(file, response.signed_request,
              response.url)
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
    }; // Image Url Function end

    // Image Uploader Function start
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
        defer.reject(messageService.showSuccess(
          "Could not upload file."));
      };
      xhr.send(file);
      return defer.promise;
    } // Image Uploader Function start

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

    // Add Quiz QuestionBank function start
    function addQuestionBank(qBank, quizIndex) {
      _self.selectedQuestionBank = {
        title: qBank.book.title,
        imgLogoUrl: qBank.book.imgLogoUrl
      };
      _self.bookId = quizesBankService.bookId[quizIndex];
      _self.quizId = quizesBankService.quizesId[_self.selectedQuizIndex];
      if (_self.quizQuestionBanks.length == 0) {
        quizesBankService.addQuizQuestionBank(_self.selectedQuestionBank,
          _self
          .bookId,
          _self.quizId).then(function(res) {
          _self.quizQuestionBanks.push(_self.selectedQuestionBank)
        });
      } else {

        angular.forEach(_self.quizQuestionBanks, function(val, i) {
          if (val.title != _self.selectedQuestionBank.title && i ==
            _self
            .quizQuestionBanks
            .length -
            1) {
            quizesBankService.addQuizQuestionBank(_self.selectedQuestionBank,
              _self
              .bookId,
              _self.quizId).then(function(res) {
              _self.quizQuestionBanks.push(_self.selectedQuestionBank);
              quizesBankService.questionBanksId.push(_self.bookId)
                //
              quizesBankService.loadQuizQuestionBank(_self.quizId)
                .then(
                  function(questionBanks) {
                    _self.quizQuestionBanks = questionBanks;
                    _self.bookId = quizesBankService.questionBanksId[
                      quizIndex];
                    angular.forEach(quizesBankService.questionBanksId,
                      function(
                        QuizQuestionBank) {
                        angular.forEach(quizesBankService.bookId,
                          function(
                            QuestionBank, i) {
                            if (QuizQuestionBank ===
                              QuestionBank) {
                              _self.books[i].SelectedBook =
                                true;
                            }
                          })
                      })
                  });
            });
          }
        })
      }
    } // Add QuestionBank function end

    // Add Quiz Chapter function start
    _self.QuizAddchapters = function(chapter, index) {

        var title = chapter.title;
        _self.chaptersId = _self.questionBankschaptersId[index];

        if (_self.quizChapterId.length == 0) {
          quizesBankService.addQuizChapter(_self.quizId, _self.questionBankUniqueID,
            _self.chaptersId,
            title).then(function(res) {
            _self.quizChapters = []
            _self.quizChapterId = []

            _self.quizChapters = quizesBankService.quizChapters;
            _self.quizChapterId = quizesBankService.quizChaptersId;

            angular.forEach(_self.quizChapterId, function(quizChapterId,
              i) {
              angular.forEach(_self.questionBankschaptersId, function(
                questionBankschaptersId) {
                if (quizChapterId == questionBankschaptersId) {
                  var index = _self.questionBankschaptersId.indexOf(
                    quizChapterId);
                  _self.questionBankschapters[
                    index].SelectedChapter = true
                }
              })
            })
          })
        } else {
          angular.forEach(_self.quizChapterId, function(val, i) {
            if (val != _self.chaptersId && i == _self.quizChapterId
              .length -
              1) {
              quizesBankService.addQuizChapter(_self.quizId, _self.questionBankUniqueID,
                _self.chaptersId,
                title).then(function(res) {
                _self.quizChapters = []
                _self.quizChapterId = []

                _self.quizChapters = quizesBankService.quizChapters;
                _self.quizChapterId = quizesBankService.quizChaptersId;

                angular.forEach(_self.quizChapterId, function(
                  quizChapterId, i) {
                  angular.forEach(_self.questionBankschaptersId,
                    function(
                      questionBankschaptersId) {
                      if (quizChapterId ==
                        questionBankschaptersId) {
                        var index = _self.questionBankschaptersId
                          .indexOf(
                            quizChapterId);
                        _self.questionBankschapters[
                          index].SelectedChapter = true
                      }
                    })
                })
              })
            }
          })
        }
      } // Add Quiz Chapter function end


    // Add Quiz Topic function start
    _self.addQuizTopic = function(topicObj, index) {
        var title = topicObj.title;
        _self.topicId = _self.questionBankTopicsId[index];
        if (_self.QuizTopics.length == 0) {
          quizesBankService.addQuizTopic(_self.quizId, _self.questionBankUniqueID,
            _self.chapterId, _self.topicId, title).then(function(res) {

            _self.QuizTopics = quizesBankService.quizTopics;
            _self.QuizTopicsId = quizesBankService.quizTopicsId;

            angular.forEach(_self.QuizTopicsId, function(QuizTopicsId,
              i) {
              angular.forEach(_self.questionBankTopicsId, function(
                questionBankTopicsId) {
                if (QuizTopicsId == questionBankTopicsId) {
                  var index = _self.questionBankTopicsId.indexOf(
                    QuizTopicsId);
                  _self.questionBankTopics[
                    index].SelectedTopic = true
                }
              })
            })

          }, function(err) {});
        } else {

          angular.forEach(_self.QuizTopicsId, function(val, i) {
              if (val != _self.topicId && i == _self.QuizTopicsId.length -
                1) {
                quizesBankService.addQuizTopic(_self.quizId, _self.questionBankUniqueID,
                  _self.chapterId, _self.topicId, title).then(
                  function(
                    res) {

                    _self.QuizTopics = [];
                    _self.QuizTopicsId = [];

                    _self.QuizTopics = quizesBankService.quizTopics;
                    _self.QuizTopicsId = quizesBankService.quizTopicsId;

                    angular.forEach(_self.QuizTopicsId, function(
                      QuizTopicsId,
                      i) {
                      angular.forEach(_self.questionBankTopicsId,
                        function(
                          questionBankTopicsId) {
                          if (QuizTopicsId == questionBankTopicsId) {
                            var index = _self.questionBankTopicsId.indexOf(
                              QuizTopicsId);
                            _self.questionBankTopics[
                              index].SelectedTopic = true
                          }
                        })
                    })
                  },
                  function(err) {});
              } // if in forEach
            }) // else  forEach
        } //else end
      } // Add Quiz Topic function end

    // Add Quiz Question function start
    _self.QuizAddQuestion = function(questionObj, index) {
        _self.questionbanksQuestion[index].SelectedQuestion = true;
        delete questionObj.SelectedQuestion;

        _self.QuestionId = _self.questionbanksQuestionId[index];
        if (_self.quizQuestion.length == 0) {
          quizesBankService.addQuizQuestion(_self.quizId, _self.questionBankUniqueID,
            _self.chapterId, _self.topicId, _self.QuestionId,
            questionObj
          ).then(function(res) {
            _self.quizQuestion = [];
            _self.quizQuestionId = [];

            _self.quizQuestion = quizesBankService.questions;
            _self.quizQuestionId = quizesBankService.questionId;

            angular.forEach(_self.quizQuestionId, function(quizQuestionId,
              i) {
              angular.forEach(_self.questionbanksQuestionId, function(
                questionbanksQuestionId) {
                if (quizQuestionId == questionbanksQuestionId) {
                  var index = _self.questionbanksQuestionId.indexOf(
                    quizQuestionId);
                  _self.questionbanksQuestion[
                    index].SelectedQuestion = true
                }
              })
            })

          });
        } else {
          angular.forEach(_self.quizQuestionId, function(val, i) {
            if (val != _self.QuestionId && i == _self
              .quizQuestionId
              .length -
              1) {
              quizesBankService.addQuizQuestion(_self.quizId, _self.questionBankUniqueID,
                _self.chapterId, _self.topicId, _self.QuestionId,
                questionObj
              ).then(function(res) {
                _self.quizQuestion = [];
                _self.quizQuestionId = [];

                _self.quizQuestion = quizesBankService.questions;
                _self.quizQuestionId = quizesBankService.questionId;

                angular.forEach(_self.quizQuestionId, function(
                  quizQuestionId, i) {
                  angular.forEach(_self.questionbanksQuestionId,
                    function(
                      questionbanksQuestionId) {
                      if (quizQuestionId ==
                        questionbanksQuestionId) {
                        var index = _self.questionbanksQuestionId
                          .indexOf(
                            quizQuestionId);
                        _self.questionbanksQuestion[
                          index].SelectedQuestion = true
                      }
                    })
                })
              });
            }
          })
        }
      } // Add Quiz Question function end

    // Delete functions

    //Delete  Quiz Question Bank
    _self.deleteQuizQuestionBank = function(quizIndex) {
        _self.bookId = quizesBankService.bookId[quizIndex];
        _self.quizId = quizesBankService.quizesId[_self.selectedQuizIndex];
        quizesBankService.deleteQuizQuestionBank(_self.bookId, _self.quizId)
          .then(
            function(res) {
              _self.books[quizIndex].SelectedBook = false;
              _self.quizQuestionBanks.splice(_self.quizQuestionBanks.indexOf(
                _self.bookId), 1);
              quizesBankService.questionBanksId.splice(quizesBankService.questionBanksId
                  .indexOf(_self.bookId), 1)
            })
      }
      //Delete  QuizChapters
    _self.deleteQuizChapter = function(index) {
      _self.chaptersId = _self.questionBankschaptersId[index];
      quizesBankService.deleteQuizChapter(_self.quizId, _self.questionBankUniqueID,
        _self.chaptersId).then(function(res) {
        _self.quizChapters = []
        _self.quizChapterId = []
        _self.quizChapters = quizesBankService.quizChapters;
        _self.quizChapterId = quizesBankService.quizChaptersId;
        _self.questionBankschapters[index].SelectedChapter = false;
      })
    }

    //Delete  Topic
    _self.deleteQuizTopics = function(index) {
        _self.topicId = _self.questionBankTopicsId[index];
        quizesBankService.deleteQuizTopics(_self.quizId, _self.questionBankUniqueID,
          _self.chapterId, _self.topicId).then(function(res) {
          _self.QuizTopics = [];
          _self.QuizTopicsId = [];

          _self.QuizTopics = quizesBankService.quizTopics;
          _self.QuizTopicsId = quizesBankService.quizTopicsId;
          _self.questionBankTopics[index].SelectedTopic = false;
          // angular.forEach(_self.QuizTopicsId, function(
          //   QuizTopicsId,
          //   i) {
          //   angular.forEach(_self.questionBankTopicsId,
          //     function(
          //       questionBankTopicsId) {
          //       if (QuizTopicsId == questionBankTopicsId) {
          //         var index = _self.questionBankTopicsId.indexOf(
          //           QuizTopicsId);
          //         _self.questionBankTopics[
          //           index].SelectedTopic = true
          //       }
          //     })
          // })
        }, function(err) {});
      }
      /**/
      //Delete  Questions
    _self.deleteQuizQuestions = function(index) {
      _self.QuestionId = _self.questionbanksQuestionId[index];
      quizesBankService.deleteQuizQuestions(_self.quizId, _self.questionBankUniqueID,
        _self.chapterId, _self.topicId, _self.QuestionId).then(
        function(
          res) {
          _self.quizQuestion = []
          _self.quizQuestionId = []
          _self.quizQuestion = quizesBankService.questions;
          _self.quizQuestionId = quizesBankService.questionId;
          _self.questionbanksQuestion[index].SelectedQuestion = false;
          // angular.forEach(_self.quizQuestionId, function(val, i) {
          //   if (val === _self.quizQuestionId[i]) {
          //     _self.questionbanksQuestion[
          //       i].SelectedQuestion = true
          //   }
          // })
        },
        function(err) {});
    }

  }
})();
