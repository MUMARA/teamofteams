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
      console.log(_self.questionSetQuestions)
      _self.questionSet = {
        options: []
      };
    }

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
      console.log(_self.questionSet.options)
    };

    function setSelectedTopic(_self, index) {
      _self.topicId = quizesBankService.topicsId[index];

      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = index;
      quizesService.setSelectedTopic(index);
      // quizesService.setSelectedQuestion(null);
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

    function setSelectedChapter(ele, index) {
      //
      _self.quizChapters = [];

      for (var key in _self.questionBanks[index].chapters) {
        _self.quizChapters.push(_self.questionBanks[index].chapters[key])
      }

      _self.questionBankUniqueID = quizesBankService.questionBanksId[index];
      // console.log(_self.Quiz[_self.selectedBookIndex].questionbanks);

      quizesBankService.loadChapters(_self.questionBankUniqueID).then(
        function(
          chapters) {
          _self.Quizchapters = chapters;
        })
      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;
      _self.selectedChapterIndex = index;
      quizesService.setSelectedChapter(index);
      quizesService.setSelectedTopic(null);
    }

    function setSelectedBook(_self, index) {
      // quizService.setSelectedBook(index);

      _self.selectedQuestionIndex = null;
      _self.selectedTopicIndex = null;
      _self.selectedChapterIndex = null;
      quizesService.setSelectedChapter(null);
      quizesService.setSelectedTopic(null);

    }
    /*  Question Bank   */
    function showChapters(quizIndex) {

      _self.selectedBookIndex = quizIndex;
      quizesService.setQuestionObject(null);
      quizesService.setChapter(null, null);
      quizesService.setTopic(null, null);
      quizesService.setQuestionObject(null);
      _self.questionBanks = null;
      // quizService.book = bookIndex;
      _self.bookId = quizesBankService.bookId[quizIndex];

      _self.quizId = quizesBankService.quizesId[_self.selectedBookIndex];

      _self.showQuestionDetails = false;
      _self.questionView = null;
      quizesBankService.loadQuizes(_self.quizId).then(
        function(questionBanks) {
          _self.questionBanks = questionBanks;

          //_self.chapters = chapters;
        });

      /*quizesBankService.loadChapters(_self.bookId).then(
       function(chapters) {
       _self.chapters = chapters;
       });*/

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
      quizesService.setTopic(null, null);
      quizesService.setQuestionObject(null);
      _self.topics = [];
      _self.questions = [];

      _self.topicsId = [];
      _self.questionsId = [];
      _self.showQuestionDetails = false;
      // _self.topicId = null;
      _self.questionView = null;
      // _self.chapterId = _self.chaptersId[chapterIndex];
      _self.chapterId = quizesBankService.chaptersId[chapterIndex];
      // quizesService.setChapter(_self.chapterId, chapterIndex);
      quizesBankService.loadTopic(_self.bookId, _self.chapterId).then(
        function(
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
      _self.topicId = quizesBankService.topicsId[topicIndex];
      _self.showQuestionDetails = false;
      _self.questionView = null;
      _self.questions = [];
      quizesBankService.loadQuestions(_self.bookId, _self.chapterId, _self.topicId)
        .then(function(questions) {
          _self.questions = questions;
        });
      /*_self.topicId = _self.topicsId[topicIndex];
       quizesBankService.loa
       quizesService.setTopic(_self.topicId, topicIndex);
       quizesService.setQuestionObject(null);
       _self.questions = [];
       ref.child('questions').child(_self.bookId).child(_self.chapterId).child(_self.topicId).on('child_added',
       function (snapShot) {
       $timeout(function () {
       _self.questions.push(snapShot.val());
       }, 0);
       });*/
    }
    // Shows Question Details
    function showQuestionView(question) {
      if (question !== null) {
        quizesService.setQuestionObject(question);
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
    //     ref.child('quiz-create').child(quizesService.getBook()).on('child_added', function (snapShot) {
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
    //     ref.child('quiz-create').child(quizesService.getBook()).child(_self.quizes[index].key).child('quizQuestion')
    //         .on('child_added', function (snapShot) {
    //             chapterKey = snapShot.key();
    //             var chapterTemp = snapShot.val().ChapterDetails;
    //             ref.child('quiz-create').child(quizesService.getBook()).child(_self.quizes[index].key).child('quizQuestion')
    //                 .child(chapterKey).child('ChapterTopics').on('child_added', function (snap) {
    //                 var topicTemp = snap.val().TopicDetails;
    //                 ref.child('quiz-create').child(quizesService.getBook()).child(_self.quizes[index].key).child('quizQuestion')
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
    //         _self.showQuizSceduling = naveService.toggleRight6;
    //         _self.showQuizSceduling();
    //     }, 0);
    //
    //     _self.quizesList = [];
    //     ref.child('quiz-create').child(quizesService.getBook()).on('child_added', function (snapShot) {
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
    //             bookId: quizesService.getBook(),
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
    //     _self.showQuizSceduling = naveService.toggleRight6;
    //     _self.showQuizSceduling();
    //
    // }


    // function showQuizChapters(bookIndex) {
    //     console.log('showing quiz Chapters');
    //     _self.bookId = _self.booksId[bookIndex];
    //     quizesService.setBook(_self.bookId, bookIndex);
    // }
    //
    // function showQuizTopics() {
    //     console.log('showing quiz Topics');
    // }


    /*  Question Bank Addition Functions  */

    //        Create Book Navigation Start

    // Show
    function ShowNavBar() {
      _self.showbook = naveService.toggleRight1;
      _self.showbook();
    }

    function createQuiz(quizesData, img) {
      ShowNavBar();
      var quizId = quizesData.id;
      _self.quizData = {
        //    'memberships-type': 1,
        title: quizesData.name,
        desc: quizesData.desc,
        imgLogoUrl: img || 'img/question-bank.png',
        //    'timestamp': Firebase.ServerValue.TIMESTAMP
      };

      quizesBankService.createQuiz(quizId, _self.quizData);

      _self.quizData = {};


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
      _self.showbook = naveService.toggleRight1;
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
      quizesBankService.createChapter(_self.bookId, _self.chapterObj);
      quizesBankService.loadChapters(_self.bookId).then(
        function(chapters) {
          _self.chapters = chapters;
        });
      // quizesBankService.loadQuestionBanks("off").then(
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


    // _self.Title = '';
    // _self.Description = '';
    // _self.chapterId = $stateParams.id;

    function createTopic(topicObj) {
      _self.topicObj = {
        title: topicObj.title,
        desc: topicObj.desc,
        'timestamp': Firebase.ServerValue.TIMESTAMP
      };
      quizesBankService.createTopic(_self.bookId, _self.chapterId, _self.topicObj);
      quizesBankService.loadTopic(_self.bookId, _self.chapterId).then(
        function(
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
      console.log(_self.questionSet);
      alert("")
      _self.questionSet.options.push({
        html: '',
        correct: false,
        "discussionHtml": ""
      });
    };
    //Delete Option
    this.deleteOption = function(optionIndex) {
      if (optionIndex > -1) {
        _self.question.options.splice(optionIndex, 1);
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
    //     ref.child("questions").child(quizesService.getBook()).child(quizesService.getChapter()).child(quizesService.getTopic()).push(_self.question);
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
         this.deleteQuestionSetOption = function (optionIndex) {
         if (optionIndex > -1) {
         _self.questionSet.options.splice(optionIndex, 1);
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
         //     ref.child("questions").child(quizesService.getBook()).child(quizesService.getChapter()).child(quizesService.getTopic()).push(_self.question);
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
             ref.child("questions").child(quizesService.getBook()).child(quizesService.getChapter()).child(quizesService.getTopic()).push(_self.question, function () {

             _self.question = {};
             abc();
             });

             _self.myAnswer = undefined;

             }*/
          }
          quizesBankService.createQuestion(_self.bookId, _self.chapterId,
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
          /*myFirebaseRef.child("questions").child(quizesService.getBook()).child(quizesService.getChapter()).child(quizesService.getTopic()).push(_self.question, function () {

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
         ref.child("questions").child(quizesService.getBook()).child(quizesService.getChapter()).child(quizesService.getTopic()).push(_self.question, function () {

         _self.question = {};
         abc();
         });

         _self.myAnswer = undefined;

         }*/
      }
      quizesBankService.createQuestion(_self.bookId, _self.chapterId, _self
        .topicId,
        question);
      quizesBankService.loadQuestions(_self.bookId, _self.chapterId, _self.topicId)
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
      /*myFirebaseRef.child("questions").child(quizesService.getBook()).child(quizesService.getChapter()).child(quizesService.getTopic()).push(_self.question, function () {

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



    function addQuestionBank(qBank, quizIndex) {
      //alert('Haider');
      _self.selectedQuestionBank = {
        title: qBank.book.title,
        imgLogoUrl: qBank.book.imgLogoUrl
      };

      _self.bookId = quizesBankService.bookId[quizIndex];
      _self.quizId = quizesBankService.quizesId[_self.selectedBookIndex];
      quizesBankService.addQuestionBank(_self.selectedQuestionBank, _self.bookId,
        _self.quizId);



    }

    _self.QuizAddchapters = function(chapter, index) {
      var title = chapter.title;
      console.log(_self.quizId)
      console.log(_self.questionBankUniqueID)
      _self.chaptersId = quizesBankService.chaptersId[index]
      quizesBankService.addQuizChapter(_self.quizId, _self.questionBankUniqueID,
        _self.chaptersId,
        title)
    }

    // function closeQuiz() {
    //     _self.showbook = naveService.toggleRight5;
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
