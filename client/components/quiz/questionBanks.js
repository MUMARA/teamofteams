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
    "$firebaseObject", "$sce", "authService", "$mdSidenav"
  ];

  function QuizController(quizBankService, $rootScope, appConfig,
    messageService, $stateParams, utilService, $q, $mdDialog, quizService,
    $location, userService, navService, $firebaseArray, $timeout, $mdToast,
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
    _self.createBook = createBook;
    _self.addChapter = addChapter;
    _self.CreateChapter = CreateChapter;
    _self.addTopic = addTopic;
    _self.createTopic = createTopic;
    _self.addQuestion = addQuestion;
    // _self.showTextangular = false;
    // Close Side nav Bar

    _self.closeBook = closeBook;
    _self.closeChapter = closeChapter;
    _self.closeQuestion = closeQuestion;
    _self.closeTopic = closeTopic;
    // _self.editChapter = editChapter;
    // _self.hover = hover;
    // _self.editHover = editHover;
    // side NAv Show n hide
    _self.showChapters = showChapters;
    _self.showTopics = showTopics;
    _self.showQuestions = showQuestions;
    _self.showQuestionView = showQuestionView;

    // _self.showQuizChapters = showQuizChapters;
    // _self.showQuizTopics = showQuizTopics;

    _self.setSelectedBook = setSelectedBook;
    _self.setSelectedChapter = setSelectedChapter;
    _self.setSelectedTopic = setSelectedTopic;
    // _self.setSelectedQuestion = setSelectedQuestion;
    // _self.setSelectedQuizes = setSelectedQuizes;

    _self.SelectedBook = null;
    _self.SelectedChapter = null;
    _self.SelectedTopic = null;
    _self.SelectedQuestion = null;
    // _self.showQuizBankFunc = showQuizBankFunc;
    // _self.showQuiz = showQuiz;
    // _self.showAssignQuiz = showAssignQuiz;
    // _self.showAttemptQuiz = showAttemptQuiz;
    // _self.addQuiz = addQuiz;
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

    //QUIZ SCEDULE variables & functions
    // _self.closeAssignQuiz = closeAssignQuiz;
    // _self.setSelectedGroup = setSelectedGroup;
    // _self.setSelectedSubGroup = setSelectedSubGroup;
    // Old Code
    _self.groups = [];

    _self.quizesList = [];
    _self.quizesListKey = [];
    _self.subGroup = [];
    _self.myDatabase = [];
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


    function questionSetAddQuestion(questionSet) {
      // questionSet["discussion-html"] = "discussion-html";
      questionSet["title"] = "discussion-html";
      angular.forEach(questionSet.options, function(val) {
        delete val.$$hashKey;
      });
      _self.questionSetQuestions.push(questionSet);
      _self.questionSet = {
        options: []
      };
    }

    // _self.setSelectedQuiz = setSelectedQuiz;

    /* Start My Code */
    /*ref.child('user-question-banks').child(userService.getCurrentUser().userID).on('value', function (snapshot) {
     console.log(snapshot);
     });*/
    function initQuestionBank() {
      quizBankService.loadQuestionBanks().then(
        function(data) {
          _self.books = data;
          // console.log(data, 'console.log(questionBank.val())');
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

    // authService.resolveUserPage()
    //     .then(function (response) {
    //         // getUserObj();
    //         // initializeView();
    //     }, function (err) {
    //         alert('Error in Line 86: ' + err);
    //     });
    // setTabs();

    /*        function setTabs() {
     if (quizService.getSelectedTab() == 'QuizBank') {
     $timeout(function () {
     showQuizBankFunc();
     }, 0);
     } else if (quizService.getSelectedTab() == 'Quiz') {
     $timeout(function () {
     showQuiz();
     }, 0);
     } else if (quizService.getSelectedTab() == 'QuizAssign') {
     $timeout(function () {
     showAssignQuiz();
     }, 0);
     }
     }*/

    /*function initializeView() {
     // console.log(quizService.getBookAfterCreation())
     // console.log(quizService.getBookAfterCreation() !== null)

     if (quizService.getBookAfterCreation() !== null) {
     console.log("kjkkkkjskkkkkkkkkkkkkk");
     ref.child('question-bank').on('child_added', function (snapShot) {
     $timeout(function () {
     _self.books.push(snapShot.val());
     _self.booksId.push(snapShot.key());
     if (quizService.getBookAfterCreation() == snapShot.key()) {
     _self.selectedBookIndex = _self.booksId.indexOf(snapShot.key());
     _self.bookId = snapShot.key();
     }
     }, 0);
     });
     <<<<<<< HEAD:client/components/quiz/quiz.js

     } else {
     =======
     }
     else {
     >>>>>>> c1179d5fa76f0ac81fcb6eaa4713c9af0158f5e8:client/components/quiz/questionBanks.js
     // console.log('ELSE');
     ref.child('question-bank').on('child_added', function (snapShot) {
     $timeout(function () {
     _self.books.push(snapShot.val());
     _self.booksId.push(snapShot.key());
     }, 0);
     });

     /!*if(quizService.getSelectedBook()) {
     _self.selectedBookIndex = quizService.getSelectedBook();
     _self.bookId = quizService.getBook();
     }else{
     _self.selectedBookIndex = 0;
     _self.bookId = quizService.getBook();
     quizService.setBook(_self.bookId, _self.selectedBookIndex);
     }*!/

     if (quizService.getBook() !== null) {

     _self.bookId = quizService.getBook();
     _self.selectedBookIndex = quizService.getSelectedBook();
     console.log(quizService.getBook());
     ref.child('question-bank-chapters').child(quizService.getBook()).on('child_added', function (snapShot) {
     $timeout(function () {
     _self.chapters.push(snapShot.val());
     _self.chaptersId.push(snapShot.key());
     }, 0);
     });
     if (quizService.getChapter() !== null) {
     _self.chapterId = quizService.getChapter();
     ref.child('question-bank-topic').child(quizService.getBook()).child(quizService.getChapter()).on('child_added', function (snapShot) {
     $timeout(function () {
     _self.topics.push(snapShot.val());
     _self.topicsId.push(snapShot.key());
     }, 0);
     });
     _self.selectedChapterIndex = quizService.getSelectedChapter();
     if (quizService.getTopic() !== null) {
     _self.topicId = quizService.getTopic();
     ref.child('questions').child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).on('child_added', function (snapShot) {
     $timeout(function () {
     _self.questions.push(snapShot.val());
     }, 0);
     });
     _self.selectedTopicIndex = quizService.getSelectedTopic();
     console.log(quizService.getSelectedQuestion());
     console.log(quizService.getQuestionObject());
     if (quizService.getSelectedQuestion() !== null) {
     if (quizService.getQuestionObject() !== null) {
     _self.selectedQuestionIndex = quizService.getSelectedQuestion();
     showQuestionView(quizService.getQuestionObject());
     }
     }
     }
     }
     }
     /!*else {
     _self.bookId = _self.booksId[0];
     quizService.setBook(_self.bookId, 0);

     }*!/
     }
     }*/

    /* function afterLoad(check) {
     if (check) {
     }

     }*/

    /*  function sleep(milliseconds) {
     var start = new Date().getTime();
     for (var i = 0; i < 1e7; i++) {
     if ((new Date().getTime() - start) > milliseconds) {
     break;
     }
     }
     }*/

    /*  Tabs  */
    /*function showQuizBankFunc() {

     _self.showQuizBank = true;
     _self.showQuizList = false;
     _self.showQuizAssign = false;
     if (quizService.getQuestionObject() !== null && _self.questionView !== null) {
     _self.showQuestionDetails = true;
     }
     $('#chapterColumn').addClass('marginLeft');
     $('#quizBankIcon').addClass('selectedTab');
     $('#quizIcon').removeClass('selectedTab');
     $('#quizAssignIcon').removeClass('selectedTab');
     quizService.setSelectedTab('QuizBank');

     //_self.chapters = [];
     //_self.topics = [];
     //_self.questions = [];
     //_self.chaptersId = [];
     //_self.topicsId = [];
     //_self.questionsId = [];
     }*/

    /*function showQuiz() {
     _self.showQuizBank = false;
     _self.showQuizList = true;
     _self.showQuizAssign = false;
     _self.showQuestionDetails = false;
     //$('#chapterColumn').removeClass('marginLeft')
     $('#quizBankIcon').removeClass('selectedTab');
     $('#quizIcon').addClass('selectedTab');
     $('#quizAssignIcon').removeClass('selectedTab');
     quizService.setSelectedTab('Quiz');

     //_self.chapters = [];
     //_self.topics = [];
     //_self.questions = [];
     //_self.chaptersId = [];
     //_self.topicsId = [];
     //_self.questionsId = [];
     }*/

    // function showAssignQuiz() {
    //
    //
    //     _self.showQuizBank = false;
    //     _self.showQuizList = false;
    //     _self.showQuizAssign = true;
    //
    //     _self.showQuestionDetails = false;
    //     $('#quizBankIcon').removeClass('selectedTab');
    //     $('#quizIcon').removeClass('selectedTab');
    //     $('#quizAssignIcon').addClass('selectedTab');
    //
    //     quizService.setSelectedTab('QuizAssign');
    //
    //     _self.shceduleQuizArray = [];
    //     //Calling Shcedule Array List
    //     ref.child('quiz-schedule').on('child_added', function (snapShot) {
    //
    //         var abc = {
    //             group: snapShot.key(),
    //             sub_group: []
    //         };
    //         $.map(snapShot.val(), function (dbTopics, sbgindex) {
    //             //for getting sub groups and topics
    //             var sb = {
    //                 name: sbgindex,
    //                 topics: []
    //             };
    //             //var tmp2 = {name: sbgindex, topics:
    //             $.map(dbTopics, function (quiz, quizindex) {
    //
    //                 //Quiezes
    //                 var qiuzess = [];
    //                 $.map(quiz, function (quizDb, qindex) {
    //                     qiuzess.push(quizDb);
    //                 }); //map quizDb
    //
    //                 //Topics
    //                 var topicx = {
    //                     name: quizindex,
    //                     quizes: qiuzess
    //                 };
    //                 sb.topics.push(topicx);
    //
    //             }); //map dbtopic
    //
    //             //  };//tmp2
    //
    //             //var g = tmp2;
    //             abc.sub_group.push(sb);
    //
    //             // ////for getting sub groups and topics
    //             // var sb = { name: sbgindex, topics: [] };
    //             // var tmp2 = {name: sbgindex, topics: $.map(dbTopics, function(quiz, quizindex){
    //             //     var t = {name: quizindex, quizes: quiz}
    //             //     sb.topics.push(t);
    //             //     })
    //             // };
    //             // var g = tmp2;
    //             // abc.sub_group.push(sb);
    //
    //
    //             //for getting sub groups
    //             // var tmp2 = {name: sbgindex, topics: dbTopics};
    //             // abc["sub_group"].push(tmp2);
    //         }); //
    //
    //
    //         _self.shceduleQuizArray.push(abc);
    //
    //         console.log(JSON.stringify(_self.shceduleQuizArray));
    //
    //         _self.SearchBindRecord = function (a, b, c) {
    //             if (c === 'sub') {
    //                 _self.shceduleQuizSubGroups = a.sub_group;
    //
    //                 //getting All Questions of Specific Groups
    //                 _self.shceduleQuizQuizes = [];
    //                 _self.shceduleQuizArray.forEach(function (value, index) {
    //
    //                     if (value.group == b) {
    //                         value.sub_group.forEach(function (val, indx) {
    //
    //                             val.topics.forEach(function (v, i) {
    //
    //                                 v.quizes.forEach(function (q, qi) {
    //                                     _self.shceduleQuizQuizes.push(q);
    //
    //
    //                                 }); //q
    //
    //                             }); //v
    //                         }); //val
    //
    //                         //console.log('length: ' + _self.shceduleQuizQuizes.length + '|' + JSON.stringify(_self.shceduleQuizQuizes));
    //                     } //if
    //                 });
    //
    //
    //             } // if sub_group
    //
    //             if (c === 'topic') {
    //                 _self.shceduleQuizTopics = a.topics;
    //
    //
    //                 //getting All Questions of Specific Sub Group
    //                 _self.shceduleQuizQuizes = [];
    //                 _self.shceduleQuizArray.forEach(function (value, index) {
    //
    //
    //                     value.sub_group.forEach(function (val, indx) {
    //
    //                         console.log('topic----: ' + JSON.stringify(val));
    //
    //                         if (val.name == b) {
    //                             val.topics.forEach(function (v, i) {
    //
    //                                 v.quizes.forEach(function (q, qi) {
    //                                     _self.shceduleQuizQuizes.push(q);
    //                                 }); //q
    //
    //                             }); //v
    //                         } //if
    //                     }); //val
    //
    //                     console.log('length: ' + _self.shceduleQuizQuizes.length + '|' + JSON.stringify(_self.shceduleQuizQuizes));
    //
    //                 });
    //
    //
    //             } //topic
    //
    //             if (c === 'quiz') {
    //
    //
    //
    //                 //console.log('a-->: '+ JSON.stringify(a.topics));
    //             } //quiz
    //
    //
    //         }; // SearchBindRecord
    //         //_self.SearchBindRecord(_self.shceduleQuizArray, 'saylani', 'sub');
    //
    //
    //     });
    //
    //
    // }

    // function showAttemptQuiz() {
    //     //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quiz-attempting');
    //     //document.getElementById('navBar').style.display = "none";
    // }

    /*  Selection  */
    // function setSelectedQuestion(_self, index) {
    //     _self.selectedQuestionIndex = index;
    //     quizService.setSelectedQuestion(index);
    //     /*if (_self.lastSelectedTopic.selectedTopic) {
    //      console.log("show", arguments, _self);
    //      $('.selectedTopic').addClass('previousSelected')
    //      if (_self.lastSelectedQuestion) {
    //      _self.lastSelectedQuestion.selectedQuestion = '';
    //      }
    //      _self.selectedQuestion = 'selectedQuestion';
    //      _self.lastSelectedQuestion = _self;
    //      }
    //      console.log(_self.lastSelectedTopic.selectedTopic)*/
    // }

    function setSelectedTopic(_self, index) {
      _self.topicId = quizBankService.topicsId[index];

      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = index;
      quizService.setSelectedTopic(index);
      // quizService.setSelectedQuestion(null);
      /*console.log("show", arguments, _self);
       if (_self.lastSelectedChapter.selected) {
       console.log('in IF')
       $('.previousSelected').removeClass('previousSelected')
       $('.selectedChapter').addClass('previousSelected')
       if (_self.lastSelectedTopic) {
       _self.lastSelectedTopic.selectedTopic = '';
       }
       _self.selectedTopic = 'selectedTopic';
       _self.lastSelectedTopic = _self;
       }*/
    }

    function setSelectedChapter(_self, index) {
      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;
      quizService.setSelectedChapter(index);
      quizService.setSelectedTopic(null);
      // quizService.setSelectedQuestion(null);
      /*$('.selectedChapter').removeClass('previousSelected')
       console.log("show", _self);
       if (_self.lastSelectedChapter) {
       _self.lastSelectedChapter.selected = '';
       }
       quizService.setSelectedChapter(_self)
       _self.selected = 'selectedChapter';
       _self.lastSelectedChapter = _self;
       console.log(_self.lastSelectedChapter.selected)*/
    }

    function setSelectedBook(_self, index) {
      // quizService.setSelectedBook(index);

      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;
      _self.selectedChapterIndex = null;
      quizService.setSelectedChapter(null);
      quizService.setSelectedTopic(null);
      // quizService.setSelectedQuestion(null);
      /*_self.selectedQuestionIndex = null;
       _self.selectedTopicIndex = null;
       _self.selectedChapterIndex = null;
       if (_self.lastSelectedBook) {
       _self.lastSelectedBook.selected = '';
       }
       _self.selected = 'selectedBook';
       _self.lastSelectedBook = _self;
       console.log(_self.lastSelectedBook.selected)*/
    }

    // function setSelectedQuizes(index) {
    //     _self.selectedQuizes = index;
    // }

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
      quizBankService.loadChapters(_self.bookId).then(
        function(chapters) {
          _self.chapters = chapters;
        });

      // _self.bookId = _self.booksId[bookIndex];
      // quizService.setBook(_self.bookId, bookIndex);
      _self.chapterId = null;
      _self.topicId = null;
      _self.show = true;
      _self.chapters = [];
      _self.topics = [];
      _self.questions = [];

      _self.chaptersId = [];
      _self.topicsId = [];
      _self.questionsId = [];
      /*ref.child('question-bank-chapters').child(_self.bookId).on('child_added', function (snapShot) {
       $timeout(function () {
       _self.chapters.push(snapShot.val());
       _self.chaptersId.push(snapShot.key());
       }, 0);
       });*/
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
      // _self.topicId = null;
      _self.questionView = null;
      // _self.chapterId = _self.chaptersId[chapterIndex];
      _self.chapterId = quizBankService.chaptersId[chapterIndex];
      // quizService.setChapter(_self.chapterId, chapterIndex);
      quizBankService.loadTopic(_self.bookId, _self.chapterId).then(function(
        topics) {
        _self.topics = topics;
      });
      /*   _self.topics = [];
       _self.questions = [];
       ref.child('question-bank-topic').child(_self.bookId).child(_self.chapterId).on('child_added', function (snapShot) {
       $timeout(function () {
       _self.topics.push(snapShot.val());
       _self.topicsId.push(snapShot.key());
       }, 0);
       });*/
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
      /*_self.topicId = _self.topicsId[topicIndex];
       quizBankService.loa
       quizService.setTopic(_self.topicId, topicIndex);
       quizService.setQuestionObject(null);
       _self.questions = [];
       ref.child('questions').child(_self.bookId).child(_self.chapterId).child(_self.topicId).on('child_added',
       function (snapShot) {
       $timeout(function () {
       _self.questions.push(snapShot.val());
       }, 0);
       });*/
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

    /*  Quizes functions  */
    // _self.showQuizes = showQuizes;
    // _self.showQuizesQuestions = showQuizesQuestions;
    // _self.quizes = [];

    // function showQuizes(bookIndex) {
    //     _self.quizes = [];
    //     ref.child('quiz-create').child(quizService.getBook()).on('child_added', function (snapShot) {
    //      var temp = {
    //      details: snapShot.val().quizDetails,
    //      key: snapShot.key()
    //      };
    //      _self.quizes.push(temp);
    //      });
    // }

    // function showQuizesQuestions(index) {
    //     _self.Array = [];
    //     var iterator = 0;
    //     var chapterKey = '';
    //     console.log('showing quiz Questions');
    //     ref.child('quiz-create').child(quizService.getBook()).child(_self.quizes[index].key).child('quizQuestion')
    //         .on('child_added', function (snapShot) {
    //             chapterKey = snapShot.key();
    //             var chapterTemp = snapShot.val().ChapterDetails;
    //             ref.child('quiz-create').child(quizService.getBook()).child(_self.quizes[index].key).child('quizQuestion')
    //                 .child(chapterKey).child('ChapterTopics').on('child_added', function (snap) {
    //                 var topicTemp = snap.val().TopicDetails;
    //                 ref.child('quiz-create').child(quizService.getBook()).child(_self.quizes[index].key).child('quizQuestion')
    //                     .child(chapterKey).child('ChapterTopics').child(snap.key())
    //                     .child('TopicQuestions').on('child_added', function (shot) {
    //                     _self.Array[iterator] = {
    //                         chapterDetails: chapterTemp,
    //                         topicDetails: topicTemp,
    //                         question: shot.val()
    //                     };
    //                     iterator++;
    //                 });
    //
    //             });
    //         });
    //
    // }

    /*  Quiz Assign  */
    /*ref.child('groups-names').on('child_added', function (snapshot) {
     _self.groups.push({
     details : snapshot.val(),
     key   : snapshot.key()
     });
     console.log( snapshot.val() + ' ' + snapshot.key());
     })*/
    // _self.assignQuiz = assignQuiz;
    // console.log($localStorage.loggedInUser)
    //_self.userID = '123654789';
    /*userService.getCurrentUser()*/
    // var groupDataUbind = {};
    // var userDataUbind = {};
    // var userObjUbind;
    // _self.userObj = [];
    //
    // function getUserObj() {
    //     // console.log('getUserObj: ' + userService.getCurrentUser().userID)
    //     //var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child(_self.userID))
    //     var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child(userService.getCurrentUser().userID))
    //         .$loaded()
    //         .then(function (data) {
    //             //alert(data.$id)
    //             // console.log('THEN getUserObj')
    //
    //             userObjUbind = data.$watch(function () {
    //                 getUserObj();
    //             });
    //             _self.userObj = data;
    //             data.forEach(function (el, i) {
    //                 var j = i;
    //                 $firebaseObject(firebaseService.getRefGroups().child(el.$id))
    //                     .$loaded()
    //                     .then(function (groupData) {
    //                         groupDataUbind[j] = groupData.$watch(function () {
    //                             _self.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : "";
    //                         });
    //                         _self.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : "";
    //
    //                         if (groupData['group-owner-id']) {
    //                             //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/!*.child('profile-image')*!/)
    //                             $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
    //                                 .$loaded()
    //                                 .then(function (img) {
    //
    //                                     _self.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value);
    //                                     userDataUbind[j] = img.$watch(function (dataVal) {
    //
    //                                         _self.userObj[j].userImg = $sce.trustAsResourceUrl(img);
    //                                     });
    //                                     // console.log(_self.userObj)
    //                                 });
    //
    //                         }
    //                     });
    //             });
    //         })
    //         .catch(function (err) {
    //             //alert(err);
    //         });
    // }

    // function assignQuiz() {
    //     /* $timeout(function () {
    //      $location.path('/user/:userID/quiz/quizAssign');
    //      }, 0)*/
    //     _self.subGroup = [];
    //     $timeout(function () {
    //         _self.showQuizSceduling = navService.toggleRight6;
    //         _self.showQuizSceduling();
    //     }, 0);
    //
    //     _self.quizesList = [];
    //     ref.child('quiz-create').child(quizService.getBook()).on('child_added', function (snapShot) {
    //         _self.quizesListKey.push(snapShot.key());
    //         _self.quizesList.push(snapShot.val().quizDetails);
    //         console.log(snapShot.val());
    //
    //     });
    //     console.log(_self.quizesListKey);
    //
    //     for (var i = 0; i < _self.userObj.length; i++) {
    //
    //         _self.myDatabase[i] = {
    //             groupId: _self.userObj[i].$id,
    //             subGroupId: null,
    //             subGroupIdIndex: null,
    //             bookId: quizService.getBook(),
    //             quizId: null
    //
    //
    //         };
    //
    //     }
    //
    //     console.log(_self.myDatabase);
    // }


    // function setSelectedQuiz(id) {
    //     _self.seclectedQuizID = id;
    //     for (var i = 0; i < _self.userObj.length; i++) {
    //
    //         if (_self.myDatabase[i].groupId == _self.selectedGroup) {
    //             _self.myDatabase[i].quizId = _self.seclectedQuizID;
    //
    //         }
    //         console.log(_self.myDatabase[i]);
    //     }
    //     //            console.log(_self.myDatabase);
    //
    // }


    // function setSelectedGroup(id, index) {
    //
    //     _self.selectedGroup = id;
    //     _self.selectedGroupIndex = index;
    //     _self.subGroup = [];
    //     ref.child('subgroups').child(id).on('child_added', function (snapShot) {
    //         _self.subGroup.push(snapShot.key());
    //         console.log(_self.subGroup);
    //     });
    //
    //
    // }
    //
    // function setSelectedSubGroup(id, index) {
    //     _self.subGroupId = id;
    //     for (var i = 0; i < _self.userObj.length; i++) {
    //
    //         if (_self.myDatabase[i].groupId == _self.selectedGroup) {
    //             _self.myDatabase[i].subGroupId = id;
    //             _self.myDatabase[i].quizId = _self.seclectedQuizID;
    //             _self.myDatabase[i].subGroupIdIndex = index;
    //         }
    //
    //
    //     }
    //     console.log(_self.myDatabase);
    // }


    // function dataPush() {
    //
    //
    //     for (var i = 0; i < _self.userObj.length; i++) {
    //
    //
    //         if (_self.myDatabase[i].subGroupId !== null && _self.myDatabase[i].quizId !== null) {
    //
    //             for (var a = 0; a < _self.quizesList.length; a++) {
    //                 if (_self.quizesList[a].title == _self.myDatabase[i].quizId) {
    //                     alert("yes");
    //                     ref.child('quiz-schedule').child(_self.myDatabase[i].groupId).child(_self.myDatabase[i].subGroupId).child(_self.myDatabase[i].bookId).push({
    //                         quizName: _self.quizesList[a].title,
    //                         quizUid: _self.quizesListKey[a]
    //                     });
    //                     console.log(_self.myDatabase[i]);
    //                 }
    //             }
    //         }
    //     }
    //     closeAssignQuiz();
    // }

    //
    // function closeAssignQuiz() {
    //     _self.showQuizSceduling = navService.toggleRight6;
    //     _self.showQuizSceduling();
    //
    // }


    // function showQuizChapters(bookIndex) {
    //     console.log('showing quiz Chapters');
    //     _self.bookId = _self.booksId[bookIndex];
    //     quizService.setBook(_self.bookId, bookIndex);
    // }
    //
    // function showQuizTopics() {
    //     console.log('showing quiz Topics');
    // }


    /*  Question Bank Addition Functions  */

    //        Create Book Navigation Start

    // Show
    function ShowNavBar() {
      _self.showbook = navService.toggleRight1;
      _self.showbook();
    }

    function createBook(questionBankObject, img) {
      ShowNavBar();
      _self.questionBankObject = {
        title: questionBankObject.name,
        desc: questionBankObject.desc,
        imgLogoUrl: img || 'img/question-bank.png',
        'timestamp': Firebase.ServerValue.TIMESTAMP
      };
      quizBankService.createQuestionBank(_self.questionBankObject);
      // quizBankService.loadQuestionBanks("off").then(
      //   function(data) {
      //     _self.books = data;
      //   }
      // )
      _self.questionbankObj = {}
        /*userQuestionBanksRef1.child('user-question-banks').child(userService.getCurrentUser().userID).child(_self.bookID).set({
         'memberships-type': 1,
         'timestamp': Firebase.ServerValue.TIMESTAMP
         });
         userQuestionBanksRef1.child("question-bank-memberships").child(_self.bookID).child(userService.getCurrentUser().userID).set({
         "memberships-type": 1,
         'timestamp': Firebase.ServerValue.TIMESTAMP
         });
         userQuestionBanksRef1.child("question-bank").child(_self.bookID).set(_self.temps);
         // userQuestionBanksRef1.child("question-bank").child(_self.bookID).child("memberships").child(userService.getCurrentUser().userID).set({
         //     "memberships-type": 1,
         // });
         if ($rootScope.newImg) {
         var x = utilService.base64ToBlob($rootScope.newImg);
         var temp = $rootScope.newImg.split(',')[0];
         var mimeType = temp.split(':')[1].split(';')[0];
         _self.saveFile(x, mimeType, _self.bookID)
         .then(function (url) {
         // _self.temps.imgLogoUrl = url + '?random=' + new Date();
         //its for sending data on firebase by Name's node
         userQuestionBanksRef1.child('user-question-banks').child(userService.getCurrentUser().userID).child(_self.bookID).set({
         'memberships-type': 1,
         'timestamp': Firebase.ServerValue.TIMESTAMP
         });
         userQuestionBanksRef1.child("question-bank-memberships").child(_self.bookID).child(userService.getCurrentUser().userID).set({
         "memberships-type": 1,
         'timestamp': Firebase.ServerValue.TIMESTAMP
         });
         userQuestionBanksRef1.child("question-bank").child(_self.bookID).set(_self.temps);

         // quizService.setBookAfterCreation(_self.bookID)
         // ref.child(_self.bookID).set(temp);
         _self.name = "";
         _self.desc = "";
         _self.bookID = "";
         //_self.newImg = null;
         alert('book creation successful');
         // $location.path('/user/' + user.userID)
         })
         .catch(function () {
         //bookForm.$submitted = false;
         //return messageService.showSuccess('picture upload failed')
         alert('picture upload failed');
         });
         }*/

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
      defer.resolve(true);
      /*remove it*/
      //            xhr.send();
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
        defer.reject(messageService.showSuccess("Could not upload file."));
      };
      xhr.send(file);
      return defer.promise;
    }

    function closeBook() {
      _self.showbook = navService.toggleRight1;
      _self.showbook();
    }

    //        Create Book Navigation End


    /*  Question Bank Addition Functions  */
    /*        function addBook() {
     //console.log('Add Book')
     $timeout(function () {
     $location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddBook')
     }, 0)
     }*/

    // _self.bookId = $stateParams.id;
    // _self.Title = '';
    // _self.Description = '';

    function CreateChapter(chapterObj) {
      _self.chapterObj = {
        title: chapterObj.title,
        desc: chapterObj.desc,
        timestamp: Firebase.ServerValue.TIMESTAMP
      };
      quizBankService.createChapter(_self.bookId, _self.chapterObj);
      quizBankService.loadChapters(_self.bookId).then(
        function(chapters) {
          _self.chapters = chapters;
        });
      // quizBankService.loadQuestionBanks("off").then(
      //   function(data) {
      //     _self.books = data;
      //   }
      // )

      _self.chapterObj = {};
      _self.showChapter();
      /*
       console.log(_self.Title + " " + _self.Description);
       ref.child("question-bank-chapters").child(_self.bookId).push({
       title: _self.Title,
       description: _self.Description
       }, function () {
       _self.Title = '';
       _self.Description = '';

       });*/
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


    // _self.Title = '';
    // _self.Description = '';
    // _self.chapterId = $stateParams.id;

    function createTopic(topicObj) {
      _self.topicObj = {
        title: topicObj.title,
        desc: topicObj.desc,
        'timestamp': Firebase.ServerValue.TIMESTAMP
      };
      quizBankService.createTopic(_self.bookId, _self.chapterId, _self.topicObj);
      quizBankService.loadTopic(_self.bookId, _self.chapterId).then(function(
        topics) {
        _self.topics = topics;
      });
      _self.topicObj = {};
      _self.showTopic();
    }

    function addTopic() {
      //console.log('Add Book')
      if (_self.chapterId) {
        $timeout(function() {
          //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddTopic/' + _self.chapterId)
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
          //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddQuestion/' + _self.topicId)
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
    var _self = this;

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

    //
    //
    //Answer Types.
    this.types = [{
      name: 'Radio Button'
    }, {
      name: 'CheckBox'
    }, {
      name: 'Question Set'
    }];
    // this.question = {
    //     options: [{
    //         html: '',
    //         "discussion-html": "discussion-html",
    //         correct: false
    //     }]
    // };

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
    this.setBoxValue = function() {
      this.showAddButton = true;
      _self.question.options = [{
        html: '',
        "discussionHtml": "",
        correct: false
      }];

      _self.questionSet.options = [{
        html: '',
        "discussionHtml": "",
        correct: false
      }, {
        html: '',
        "discussionHtml": "",
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
    this.addOption = function() {

      //Radio margin.
      // if (topMargin < 100) {
      //     topMargin += 50;
      // }
      // _self.myTop.push(topMargin + 'px');
      // idCounter++;
      _self.question.options.push({
        html: '',
        correct: false,
        "discussionHtml": ""
      });
    };
    // _self.questionSet.options = [];
    _self.addQuestionSetOption = function() {
      _self.questionSet.options.push({
        html: '',
        correct: false,
        "discussionHtml": ""
      });
    };
    //Delete Option
    this.deleteOption = function(optionIndex) {
      alert(optionIndex)
      _self.question.options.splice(optionIndex, 1);

      // if (optionIndex > -1) {
      // }
    };
    //Delete Question Set Option
    this.deleteQuestionSetOption = function (optionIndex) {
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
    //        //Add more Questions, Saves data to firebase and clears input fields.
    // _self.addQuestionsAndContinue = function () {
    //     alert("")
    //     _self.showRadioOptions = false;
    //     _self.showCheckOptions = false;
    //     _self.showQuestionSet = false;
    //     _self.showAddButton = false;
    //     if (_self.myType.name === 'Radio Button') {
    //         angular.forEach(_self.question.options, function (data) {
    //             if (data.html == _self.myAnswer.html) {
    //                 data.correct = true;
    //             } else {
    //                 data.correct = false;
    //             }
    //         });
    //     }
    //     angular.forEach(_self.question.options, function (data) {
    //         delete data.$$hashKey;
    //         delete data.$$mdSelectId;
    //         delete data.id;
    //     });
    //     _self.question.Type = _self.myType.name;
    //     ref.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(_self.question);
    //     _self.question = {
    //         title: '',
    //         desc: '',
    //         type: '',
    //         // Answer: [],
    //         options: [{
    //             html: '',
    //             correct: false,
    //             'discussion-html': "discussion-html"
    //         }]
    //     };
    //     _self.myAnswer = undefined;
    // }
    //Redirect on close
    // this.prev = function () {
    //     $timeout(function () {
    //         $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
    //     });
    // };

    /*  type Question {
     title: String,
     type: QuestionType, //QuestionTupe
     html: String,
     options: Option[] | Null,
     questiones: QuestionSet[] | Null,
     "discussion-html" : String
     }
     type QuestionSet {
     title: String,
     type: QuestionType, //QuestionTupe
     html: String,
     options: Option[] | Null,
     "discussion-html" : String
     }
     type Option {
     "html": String,
     "correct": Boolean,
     "discussion-html" : String
     }*/


    //Save and Exit Button
    this.showAnswer = function(question) {
      if (question.type == 3) {
        question['title'] = "title";
        delete question.options;
        question.questiones = _self.questionSetQuestions;
      } else {
        delete question.desc;
        var arr = question.options;
        angular.forEach(question.options, function(data, index) {
          delete data.$$hashKey;
        });
        angular.forEach(question.options, function(data, index) {
          // delete arr[index].$$hashKey;
          if (question.options[index].html === "") {
            arr.splice(index, 1);
          }
        });
        question.options = arr;
        /* if (question.type === 1) {
=======
        _self.myTop = ['40px', '50px'];
        var topMargin = 50;
        this.showCheckText = false;
        this.topicId = $stateParams.id;
        _self.questionSet = {};

        //
        //
        //Answer Types.
        this.types = [{
            name: 'Radio Button'
        }, {
            name: 'CheckBox'
        }, {
            name: 'Question Set'
        }];
        // this.question = {
        //     options: [{
        //         html: '',
        //         "discussion-html": "discussion-html",
        //         correct: false
        //     }]
        // };

        //If Answer Type Changes.
        this.typeChanged = function () {

            _self.radioValue = '';
            _self.myAnswer = undefined;
            _self.myTop = ['40px', '90px'];
            topMargin = 50;
            angular.forEach(_self.question.options, function (data) {
                if (data.id === true) {
                    data.id = false;
                }
            });
        };

        //Setting different inputs.
        this.setBoxValue = function () {
            this.showAddButton = true;
            _self.question.options = [{
                html: '',
                "discussion-html": "discussion-html",
                correct: false
            }];

            _self.questionSet.options = [{
                html: '',
                "discussion-html": "discussion-html",
                correct: false
            }, {
                html: '',
                "discussion-html": "discussion-html",
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
        this.addOption = function () {

            //Radio margin.
            // if (topMargin < 100) {
            //     topMargin += 50;
            // }
            // _self.myTop.push(topMargin + 'px');
            // idCounter++;
            _self.question.options.push({
                html: '',
                correct: false,
                "discussion-html": "discussion-html"
            });
        };
        // _self.questionSet.options = [];
        _self.addQuestionSetOption = function () {
            console.log(_self.questionSet);
            alert("")
            _self.questionSet.options.push({
                html: '',
                correct: false,
                "discussion-html": "discussion-html"
            });
        };
        //Delete Option
        this.deleteOption = function (optionIndex) {
            if (optionIndex > -1) {
                _self.question.options.splice(optionIndex, 1);
            }
        };


        //Sets Answer if Type CheckBox is selected.
        _self.setCheckBoxValue = function (questionId) {
            if (_self.question.options[questionId].id === true) {
                _self.question.options[questionId].correct = true;
                _self.answerTag.push('one');
            } else if (_self.question.options[questionId].id === false) {
                _self.question.options[questionId].correct = false;
                _self.answerTag.pop();
            }
        };
        //        //Add more Questions, Saves data to firebase and clears input fields.
        // _self.addQuestionsAndContinue = function () {
        //     alert("")
        //     _self.showRadioOptions = false;
        //     _self.showCheckOptions = false;
        //     _self.showQuestionSet = false;
        //     _self.showAddButton = false;
        //     if (_self.myType.name === 'Radio Button') {
        //         angular.forEach(_self.question.options, function (data) {
        //             if (data.html == _self.myAnswer.html) {
        //                 data.correct = true;
        //             } else {
        //                 data.correct = false;
        //             }
        //         });
        //     }
        //     angular.forEach(_self.question.options, function (data) {
        //         delete data.$$hashKey;
        //         delete data.$$mdSelectId;
        //         delete data.id;
        //     });
        //     _self.question.Type = _self.myType.name;
        //     ref.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(_self.question);
        //     _self.question = {
        //         title: '',
        //         desc: '',
        //         type: '',
        //         // Answer: [],
        //         options: [{
        //             html: '',
        //             correct: false,
        //             'discussion-html': "discussion-html"
        //         }]
        //     };
        //     _self.myAnswer = undefined;
        // }
        //Redirect on close
        // this.prev = function () {
        //     $timeout(function () {
        //         $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
        //     });
        // };

        /*  type Question {
         title: String,
         type: QuestionType, //QuestionTupe
         html: String,
         options: Option[] | Null,
         questiones: QuestionSet[] | Null,
         "discussion-html" : String
         }
         type QuestionSet {
         title: String,
         type: QuestionType, //QuestionTupe
         html: String,
         options: Option[] | Null,
         "discussion-html" : String
         }
         type Option {
         "html": String,
         "correct": Boolean,
         "discussion-html" : String
         }*/


        //Save and Exit Button
        this.showAnswer = function(question) {

          question['discussion-html'] = "discussion-html";
          if (question.type == 3) {
            question['title'] = "title";
            delete question.options;
            question.questiones = _self.questionSetQuestions;
          } else {
            delete question.desc;
            var arr = question.options;
            angular.forEach(question.options, function(data, index) {
              delete data.$$hashKey;
            });
            angular.forEach(question.options, function(data, index) {
              // delete arr[index].$$hashKey;
              if (question.options[index].html === "") {
                arr.splice(index, 1);
              }
            });
            question.options = arr;
            question['html'] = "html-";
            /* if (question.type === 1) {
             angular.forEach(_self.question.options, function (data) {
             if (data.html == _self.myAnswer.html) {
             data.correct = true;
             } else {
             data.correct = false;
             }
             });
             }

             _self.question.Type = _self.myType.name;
             ref.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(_self.question, function () {

             _self.question = {};
             abc();
             });

             _self.myAnswer = undefined;

             }*/
          }
          quizBankService.createQuestion(_self.bookId, _self.chapterId,
            _self.topicId, question);
          _self.question = {};
          _self.question.html = null;
          _self.question.title = null;
          _self.correct = null;
          _self.closeQuestion();
          /*if (_self.myType.name === 'Radio Button') {
           angular.forEach(_self.question.options, function (data) {
           if (data.html == _self.myAnswer.html) {
           data.correct = true;
           } else {
           data.correct = false;
           }
           });
           }*/
          /* angular.forEach(_self.question.options, function (data) {
           delete data.$$hashKey;
           delete data.$$mdSelectId;
           delete data.id;
           });*/
          // _self.question.Type = _self.myType.name;
          /*myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(_self.question, function () {

           _self.question = {};
           abc();
           });
           */
          // _self.myAnswer = undefined;

        };


        //View Dialog Box.
        /*this.showAdvanced = function (ev) {
         _self.question.Type = _self.myType.name;
         if (_self.myType.name === 'Radio Button') {
>>>>>>> 7b9baaaa761dea4bbb7c046d343889be6af63230
         angular.forEach(_self.question.options, function (data) {
         if (data.html == _self.myAnswer.html) {
         data.correct = true;
         } else {
         data.correct = false;
         }
         });
         }

         _self.question.Type = _self.myType.name;
         ref.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(_self.question, function () {

         _self.question = {};
         abc();
         });

         _self.myAnswer = undefined;

         }*/
      }
      quizBankService.createQuestion(_self.bookId, _self.chapterId, _self.topicId,
        question);
      quizBankService.loadQuestions(_self.bookId, _self.chapterId, _self.topicId)
        .then(function(questions) {
          _self.questions = questions;
        });
      _self.questionSetQuestions = [];
      _self.question = {};
      _self.question.html = null;
      _self.question.title = null;
      _self.correct = null;
      _self.closeQuestion();
      /*if (_self.myType.name === 'Radio Button') {
       angular.forEach(_self.question.options, function (data) {
       if (data.html == _self.myAnswer.html) {
       data.correct = true;
       } else {
       data.correct = false;
       }
       });
       }*/
      /* angular.forEach(_self.question.options, function (data) {
       delete data.$$hashKey;
       delete data.$$mdSelectId;
       delete data.id;
       });*/
      // _self.question.Type = _self.myType.name;
      /*myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(_self.question, function () {

       _self.question = {};
       abc();
       });
       */
      // _self.myAnswer = undefined;

    };


    //View Dialog Box.
    /*this.showAdvanced = function (ev) {
     _self.question.Type = _self.myType.name;
     if (_self.myType.name === 'Radio Button') {
     angular.forEach(_self.question.options, function (data) {
     if (data.html == _self.myAnswer.html) {
     data.correct = true;
     } else {
     data.correct = false;
     }
     });
     }
     $mdDialog.show({
     controller: DialogController,
     templateUrl: './components/quiz-add-question/dialog.tmpl.html',
     parent: angular.element(document.body),
     targetEvent: ev,
     locals: {
     questionData: _self.question
     }
     })
     .then(function (answer) {

     }, function () {

     });
     };*/



    // function addQuiz() {
    //
    //     /*$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizCreate/')*/
    //
    //     if (_self.bookId) {
    //         // $timeout(function () {
    //         //     //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizCreate/')
    //         //
    //         //     _self.showQuize = navService.toggleRight5;
    //         //     _self.showQuize();
    //
    //             //Parou Code
    //             // var _self = this;
    //             // var bookId = '';
    //             // var chapId = '';
    //             // var marker = 0;
    //             // _self.awaisObject = {};
    //             // _self.flagChapters = [];
    //             // _self.flagTopics = [];
    //             // _self.showQuestionView1 = false;
    //             // _self.quizObject = {};
    //
    //             //temporary
    //             // _self.showTick = true;
    //             // _self.buttonText = 'Next';
    //             // _self.quizTitle = '';
    //             // var topicCounter = 0;
    //             // _self.quizDescription = '';
    //             // _self.quizTime = '';
    //             // var myCounter = 0;
    //             // _self.questionIndex = 0;
    //             // _self.tempQuestions = [];
    //             // _self.myChapterIndex = 0;
    //             // _self.viewAllQuestions = [];
    //             // _self.viewAllTopics = [];
    //             //bring the chapters from firebase
    //
    //             // _self.secondBookName = 'angular101';
    //             // _self.secondChapters = [];
    //             // _self.secondChaptersKey = [];
    //             /*This will show hide quiz tabs*/
    //             // var counter = 1;
    //             // var tabCounter = 1;
    //             // var arr = [],
    //             //     name = '';
    //             // _self.myChapters = [];
    //             // _self.myChaptersKey = [];
    //             // _self.thirdTopics = [];
    //             //Data fetching from firebase
    //             // _self.chapters = [];
    //             // _self.chaptersId = [];
    //             // _self.nestedQuestions = [];
    //             // _self.topics = [];
    //             // _self.topicsId = [];
    //             // _self.questions = [];
    //             // _self.questionsId = [];
    //             // _self.showOne = false;
    //             // _self.showTwo = true;
    //             // _self.showThree = false;
    //             //Second Page
    //             // all variables
    //             // _self.show = false;
    //             // _self.showQuestionDetails = false;
    //             // _self.showQuizBar = false;
    //             // _self.showTick = false;
    //             // _self.bookId = '';
    //             // _self.chapterId = '';
    //             // _self.topicId = null;
    //             // _self.SelectedBook = null;
    //             // _self.SelectedChapter = null;
    //             // _self.SelectedTopic = null;
    //             // _self.SelectedQuestion = null;
    //             /*_self.quizes = [];*/
    //             // _self.chaptersId = [];
    //             // _self.chapters = [];
    //             // _self.topicsId = [];
    //             // _self.topics = [];
    //             // _self.questions = [];
    //             // _self.questionView = '';
    //             // _self.latestNode = [];
    //
    //
    //             /*
    //              if (tabCounter == 1) {
    //              //Tab Icons
    //              _self.oneTab = true;
    //              _self.twoTab = true;
    //              _self.threeTab = false;
    //              tabCounter++;
    //
    //              }*/
    //
    //
    //             //  seleted data start
    //             // _self.setSelectedQuestion = function (thisScope) {
    //             //
    //             //  if (_self.lastSelectedTopic.selectedTopic) {
    //             //  $('.selectedTopic').addClass('previousSelected');
    //             //  if (_self.lastSelectedQuestion) {
    //             //  _self.lastSelectedQuestion.selectedQuestion = '';
    //             //  }
    //             //  thisScope.selectedQuestion = 'selectedQuestion';
    //             //  _self.lastSelectedQuestion = thisScope;
    //             //  }
    //             //  };
    //
    //             // _self.setSelectedTopics = function (thisScope) {
    //             //
    //             //     if (_self.lastSelectedChapter.selected) {
    //             //         $('.previousSelected').removeClass('previousSelected');
    //             //         $('.selectedChapter').addClass('previousSelected');
    //             //         if (_self.lastSelectedTopic) {
    //             //             _self.lastSelectedTopic.selectedTopic = '';
    //             //         }
    //             //         thisScope.selectedTopic = 'selectedTopic';
    //             //         _self.lastSelectedTopic = thisScope;
    //             //     }
    //             // };
    //
    //             // _self.setSelectedChapters = function (thisScope) {
    //             //
    //             //     $('.selectedChapter').removeClass('previousSelected');
    //             //     if (_self.lastSelectedChapter) {
    //             //         _self.lastSelectedChapter.selected = '';
    //             //     }
    //             //     quizCreateService.setSelectedChapter(thisScope);
    //             //     thisScope.selected = 'selectedChapter';
    //             //     _self.lastSelectedChapter = thisScope;
    //             // };
    //             //selected data end
    //             //2nd Tab Functions
    //             // var chapterCounter = 0;
    //             //Chapters
    //
    //             // ref.child('question-bank-chapters').child(quizService.getBook()).on('child_added', function (snapShot) {
    //             //     //$timeout(function () {
    //             //
    //             //     _self.chapters.push(snapShot.val());
    //             //     /*console.log(_self.chapters.push(snapShot.val()));*/
    //             //     _self.chaptersId.push(snapShot.key());
    //             //     _self.chaptersSnapData = snapShot.val();
    //             //     _self.nestedQuestions.push([]);
    //             //     _self.flagChapters[chapterCounter] = {};
    //             //     _self.flagChapters[chapterCounter].id = true;
    //             //     _self.viewAllTopics.push([]);
    //             //     _self.flagTopics.push([]);
    //             //     chapterCounter++;
    //             //     //}, 0)
    //             //
    //             // });
    //
    //
    //             // bookId = quizService.getBook();
    //             // _self.bookId = quizService.getBook();
    //             // _self.quizObject[quizService.getBook()] = {};
    //             // _self.awaisObject[quizService.getBook()] = {};
    //
    //             //Topics
    //             // _self.showTopics = function (chapterIndex) {
    //             //     _self.showQuestionView1 = false;
    //             //     if (_self.quizObject[bookId]["quizQuestion"] === undefined) {
    //             //         _self.quizObject[bookId]["quizQuestion"] = {};
    //             //     }
    //             //     _self.quizObject[bookId]["quizQuestion"][_self.chaptersId[chapterIndex]] = {};
    //             //     _self.awaisObject[bookId][_self.chaptersId[chapterIndex]] = {};
    //             //     _self.quizObject[bookId]["quizQuestion"][_self.chaptersId[chapterIndex]]["ChapterDetails"] = {
    //             //         title: _self.chapters[chapterIndex].title,
    //             //         description: _self.chapters[chapterIndex].description
    //             //     };
    //             //     _self.quizObject[bookId]['quizQuestion'][_self.chaptersId[chapterIndex]]['ChapterTopics'] = {};
    //             //     _self.awaisObject[bookId][_self.chaptersId[chapterIndex]] = {};
    //             //     console.log("Chapter Details");
    //             //     console.log(_self.quizObject[bookId]["quizQuestion"][_self.chaptersId[chapterIndex]]["ChapterDetails"]);
    //             //     _self.chapterId = _self.chaptersId[chapterIndex];
    //             //     _self.myChapterIndex = chapterIndex;
    //             //     quizCreateService.setChapter(_self.chapterId, chapterIndex);
    //             //
    //             //     if (_self.flagChapters[chapterIndex].id === true) {
    //             //         _self.nestedQuestions[chapterIndex] = [];
    //             //         _self.tempQuestions[chapterIndex] = [];
    //             //         _self.flagChapters[chapterIndex].id = false;
    //             //         _self.topics = [];
    //             //         _self.topicsId = [];
    //             //         // _self.topicId = null;
    //             //         topicCounter = 0;
    //             //         ref.child('question-bank-topic').child(quizService.getBook()).child(quizCreateService.getChapter()).on('child_added', function (snapShot) {
    //             //             $timeout(function () {
    //             //                 _self.topics.push(snapShot.val());
    //             //                 _self.viewAllTopics[chapterIndex].push(snapShot.val());
    //             //                 _self.topicsId.push(snapShot.key());
    //             //                 _self.flagTopics[chapterIndex][topicCounter] = {};
    //             //                 _self.flagTopics[chapterIndex][topicCounter].id = true;
    //             //                 _self.nestedQuestions[chapterIndex].push([]);
    //             //                 _self.tempQuestions[chapterIndex].push([]);
    //             //                 topicCounter++;
    //             //             }, 0)
    //             //         })
    //             //     } else {
    //             //         _self.topics = _self.viewAllTopics[chapterIndex];
    //             //         _self.myChapterIndex = chapterIndex;
    //             //     }
    //             // };
    //
    //             //Questions.
    //             // _self.showQuestions = function (topicIndex) {
    //             //     _self.showQuestionView1 = false;
    //             //     if (_self.quizObject[bookId]["ChapterDetails"][_self.chaptersId[_self.myChapterIndex]]["ChapterTopics"][_self.topicsId[topicIndex]] === undefined) {
    //             //         _self.quizObject[bookId]["ChapterDetails"][_self.chaptersId[_self.myChapterIndex]]["ChapterTopics"][_self.topicsId[topicIndex]] = {};
    //             //         _self.awaisObject[bookId][_self.chaptersId[_self.myChapterIndex]][_self.topicsId[topicIndex]] = {};
    //             //         //Topic Object
    //             //         _self.quizObject[bookId]['quizQuestion'][_self.chaptersId[_self.myChapterIndex]]['ChapterTopics'][_self.topicsId[topicIndex]]['TopicDetails'] = {
    //             //             title: _self.topics[topicIndex].title,
    //             //             description: _self.topics[topicIndex].description
    //             //         };
    //             //         _self.quizObject[bookId]['quizQuestion'][_self.chaptersId[_self.myChapterIndex]]['ChapterTopics'][_self.topicsId[topicIndex]]['TopicQuestions'] = {};
    //             //         _self.awaisObject[bookId][_self.chaptersId[_self.myChapterIndex]][_self.topicsId[topicIndex]] = {};
    //             //         console.log("Topic Details");
    //             //         console.log(_self.quizObject[bookId]['quizQuestion'][_self.chaptersId[_self.myChapterIndex]]['ChapterTopics'][_self.topicsId[topicIndex]]);
    //             //     }
    //             //     if (_self.flagTopics[_self.myChapterIndex][topicIndex].id == true) {
    //             //
    //             //         _self.flagTopics[_self.myChapterIndex][topicIndex].id = false;
    //             //         _self.nestedQuestions[_self.myChapterIndex][topicIndex] = [];
    //             //         myCounter = 0;
    //             //         _self.questionIndex = topicIndex;
    //             //         _self.showQuestionDetails = false;
    //             //         // _self.topicId = _self.topicsId[topicIndex];
    //             //         _self.tempQuestions[_self.myChapterIndex][topicIndex] = [];
    //             //         // quizCreateService.setTopic(_self.topicId, topicIndex);
    //             //
    //             //         ref.child('questions').child(quizService.getBook()).child(quizCreateService.getChapter()).child(quizCreateService.getTopic()).on('child_added',
    //             //             function (snapShot) {
    //             //                 $timeout(function () {
    //             //                     _self.questions.push(snapShot.val());
    //             //                     _self.questionsId.push(snapShot.key());
    //             //                     _self.nestedQuestions[_self.myChapterIndex][topicIndex].push(snapShot.val());
    //             //                     _self.tempQuestions[_self.myChapterIndex][topicIndex].push(snapShot.val());
    //             //                     _self.tempQuestions[_self.myChapterIndex][topicIndex][myCounter].id = false;
    //             //                     _self.nestedQuestions[_self.myChapterIndex][topicIndex][myCounter].id = false;
    //             //                     myCounter++;
    //             //                 }, 0)
    //             //             });
    //             //     } else {
    //             //         _self.questionIndex = topicIndex;
    //             //         _self.nestedQuestions[_self.myChapterIndex][topicIndex] = _self.tempQuestions[_self.myChapterIndex][topicIndex];
    //             //     }
    //             // };
    //         //     _self.showQuestionView = function (question) {
    //         //         alert("")
    //         //         _self.showQuestionView1 = true;
    //         //         if (question !== null) {
    //         //             quizService.setQuestionObject(question);
    //         //         }
    //         //         _self.questionView = question;
    //         //     };
    //         //     _self.checkArray = [];
    //         //     _self.showTickIcon = function (trueFalseValue, questionIndex) {
    //         //
    //         //         console.log(_self.tickArray);
    //         //
    //         //         if (trueFalseValue == false) {
    //         //             console.log("Checking");
    //         //             _self.checkArray.push(questionIndex)
    //         //             //_self.tickArray.push(trueFalseValue);
    //         //             //console.log(_self.tickArray + 'pus');
    //         //             _self.showQuestionView1 = true;
    //         //             _self.nestedQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex].id = true;
    //         //             _self.tempQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex].id = true;
    //         //             _self.viewAllQuestions.push(_self.nestedQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex]);
    //         //             if (_self.quizObject[bookId]['quizQuestion'][_self.chaptersId[_self.myChapterIndex]]['ChapterTopics'][_self.topicsId[_self.questionIndex]]['TopicQuestions'] == undefined) {
    //         //                 _self.quizObject[bookId]['quizQuestion'][_self.chaptersId[_self.myChapterIndex]]['ChapterTopics'][_self.topicsId[_self.questionIndex]]['TopicQuestions'] = {};
    //         //                 _self.awaisObject[bookId][_self.chaptersId[_self.myChapterIndex]][_self.topicsId[_self.questionIndex]] = {};
    //         //             }
    //         //             _self.quizObject[bookId]['quizQuestion'][_self.chaptersId[_self.myChapterIndex]]['ChapterTopics'][_self.topicsId[_self.questionIndex]]['TopicQuestions'][_self.questionsId[questionIndex]] = _self.tempQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex];
    //         //             _self.awaisObject[bookId][_self.chaptersId[_self.myChapterIndex]][_self.topicsId[_self.questionIndex]][_self.questionsId[questionIndex]] = _self.tempQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex];
    //         //         } else if (trueFalseValue == true) {
    //         //             _self.checkArray.splice(_self.checkArray.indexOf(questionIndex), 1);
    //         //             //_self.tickArray.splice(trueFalseValue,1);
    //         //             //console.log(_self.tickArray + 'splice');
    //         //             _self.nestedQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex].id = false;
    //         //             _self.tempQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex].id = false;
    //         //             arr = _self.viewAllQuestions;
    //         //             name = _self.nestedQuestions[_self.myChapterIndex][_self.questionIndex][questionIndex].Title;
    //         //             angular.forEach(arr, function (data, key) {
    //         //                 if (data.Title == name) {
    //         //                     arr.splice(key, 1);
    //         //                 }
    //         //             });
    //         //             _self.viewAllQuestions = arr;
    //         //             delete(_self.quizObject[bookId]['quizQuestion'][_self.chaptersId[_self.myChapterIndex]]['ChapterTopics'][_self.topicsId[_self.questionIndex]]['TopicQuestions'][_self.questionsId[questionIndex]]);
    //         //             delete(_self.awaisObject[bookId][_self.chaptersId[_self.myChapterIndex]][_self.topicsId[_self.questionIndex]][_self.questionsId[questionIndex]]);
    //         //         }
    //         //
    //         //
    //         //     };
    //         //
    //         //
    //         //     _self.createQuiz = function () {
    //         //         /*Quiz Create.*/
    //         //
    //         //         //Delete Topics if Questions not there.
    //         //         console.log(_self.quizObject[bookId]['quizQuestion']);
    //         //         angular.forEach(_self.quizObject[bookId]['quizQuestion'], function (datum, key, obj) {
    //         //             //_self.consoleObj = datum;
    //         //             //console.log(_self.consoleObj + 'TIS IS T LENT OF AN OBJECT');
    //         //             //console.log(datum +  'TIS IS T LENT OF AN OBJECT');
    //         //             //console.log(datum +  'TIS IS T LENT OF AN OBJECT');
    //         //             angular.forEach(datum['ChapterTopics'], function (datum1, key2) {
    //         //                 if (Object.keys(datum1['TopicQuestions']).length == 0) {
    //         //                     delete(_self.quizObject[bookId]['quizQuestion'][key]['ChapterTopics'][key2]);
    //         //                 }
    //         //             })
    //         //         });
    //         //         //console.log(_self.consoleObj);
    //         //         //console.log(_self.consoleObj.length + 'TIS IS T LENT OF AN OBJECT');
    //         //         //Delete Chapters if Topics not there.
    //         //         angular.forEach(_self.quizObject[bookId]['quizQuestion'], function (data, key) {
    //         //             if (Object.keys(data['ChapterTopics']).length == 0) {
    //         //                 delete(_self.quizObject[bookId]['quizQuestion'][key])
    //         //             }
    //         //         });
    //         //
    //         //
    //         //         /*Quiz Attempt*/
    //         //
    //         //         //Delete Topics if Questions not there.
    //         //         angular.forEach(_self.awaisObject[bookId], function (datum, key) {
    //         //             angular.forEach(datum, function (datum1, key2) {
    //         //                 if (Object.keys(datum1).length == 0) {
    //         //                     delete(_self.awaisObject[bookId][key][key2]);
    //         //                 }
    //         //             })
    //         //         });
    //         //
    //         //
    //         //         //Delete Chapters if Topics not there.
    //         //         angular.forEach(_self.awaisObject[bookId], function (data, key) {
    //         //             if (Object.keys(data).length == 0) {
    //         //                 delete(_self.awaisObject[bookId][key])
    //         //             }
    //         //         });
    //         //
    //         //         _self.quizObject[bookId]['quizDetails'] = {
    //         //             title: _self.quizTitle,
    //         //             description: _self.quizDescription,
    //         //             time: _self.quizTime
    //         //         };
    //         //
    //         //
    //         //         //Object With Answer.
    //         //         ref.child('quiz-create').child(bookId).push(_self.quizObject[bookId], function () {
    //         //
    //         //             angular.forEach(_self.awaisObject[bookId], function (one) {
    //         //                 angular.forEach(one, function (two) {
    //         //                     angular.forEach(two, function (three) {
    //         //                         angular.forEach(three.options, function (deleteAnswer) {
    //         //                             delete(deleteAnswer.correct);
    //         //                         });
    //         //                     });
    //         //                 });
    //         //             });
    //         //             //Object WithoutAnswer.
    //         //             // ref.child('quiz-attempt').child(bookId).push(_self.awaisObject[bookId]);
    //         //             angular.forEach(_self.viewAllQuestions, function (data) {
    //         //                 delete(data.$$hashKey);
    //         //                 angular.forEach(data.options, function (option) {
    //         //                     delete(option.$$hashKey);
    //         //                 });
    //         //                 ref.child('quiz-create').child(bookId).on("child_added", function (snapshot) {
    //         //                     _self.latestNode.push(snapshot.key());
    //         //                 });
    //         //                 ref.child('quiz-attempt').child(bookId).child(_self.latestNode[_self.latestNode.length - 1]).set(
    //         //                     _self.awaisObject[bookId]
    //         //                 );
    //         //             });
    //         //         });
    //         //
    //         //     };
    //         //
    //         //
    //         // } 0);
    //
    //
    //     } else {
    //         messageService.showSuccess('Please Select Book')
    //         // $mdToast.show({
    //         //     template: '<md-toast style="">' + 'Please Select Book' + '</md-toast>',
    //         //     position: 'top right',
    //         //     hideDelay: 5000
    //         // });
    //     }
    //
    //
    //     console.log(_self.quizes);
    // }

    // function closeQuiz() {
    //     _self.showbook = navService.toggleRight5;
    //     _self.showbook();
    // }

    //
    // function hover(item) {
    //     //console.log('Hover')
    //     // Shows/hides the delete button on hover
    //     //return item.showEdit = !item.showEdit;
    // }

    // function editHover(item) {
    //     alert("Deleting the " + item.name);
    //     return item.show = false;
    // }
  }
})();
