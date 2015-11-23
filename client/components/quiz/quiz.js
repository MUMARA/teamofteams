/**
 * Created by Adnan Irfan on 06-Jul-15.
 */
(function () {
    'use strict';

    angular
        .module('app.quiz')
        .controller('QuizController', QuizController);

    QuizController.$inject = ["$rootScope", "appConfig", "messageService", "$stateParams", "utilService", "$q", "$mdDialog", "quizCreateService", "quizService", "$location", "userService", "navService", "$firebaseArray", "$timeout", "$mdToast", "firebaseService", "$firebaseObject", "$localStorage", "$sce", "authService"];

    function QuizController($rootScope, appConfig, messageService, $stateParams, utilService, $q, $mdDialog, quizCreateService, quizService, $location, userService, navService, $firebaseArray, $timeout, $mdToast, firebaseService, $firebaseObject, $localStorage, $sce, authService) {

        /*Private Variables*/
        var $scope = this;
        $scope.img = '../../img/userImg1.svg';
        $scope.show = false;
        $scope.showView = false;
        $scope.showQuizBank = true;
        $scope.showQuizList = false;
        $scope.showQuizAssign = false;
        $scope.questionView = null;
        //for toolbar text hide
        $scope.chapterSearch = false;
        $scope.topicSearch = false;
        $scope.questionSearch = false;
        $scope.quizSearch = false;
        $scope.quizQuestionSearch = false;
        $scope.chaptersSideNavSearch = false;
        $scope.topicSideNavSearch = false;
        $scope.questionSideNavSearch = false;
        $scope.inputEnter = false;

        $scope.selectedQuestionIndex = null;
        $scope.selectedTopicIndex = null;
        $scope.selectedChapterIndex = null;

        $scope.addBook = addBook;
        $scope.createBook = createBook;
        $scope.addChapter = addChapter;
        $scope.createChapter = createChapter;
        $scope.closeChapter = closeChapter;
        $scope.addTopic = addTopic;
        $scope.createTopic = createTopic;
        $scope.closeTopic = closeTopic;
        $scope.closeBook = closeBook;
        $scope.closeQuestion = closeQuestion;
        $scope.addQuestion = addQuestion;
        $scope.editChapter = editChapter;
        $scope.hover = hover;
        $scope.editHover = editHover;
        $scope.showChapters = showChapters;
        $scope.showTopics = showTopics;
        $scope.showQuestions = showQuestions;
        $scope.showQuestionView = showQuestionView;
        $scope.showQuizChapters = showQuizChapters;
        $scope.showQuizTopics = showQuizTopics;

        $scope.setSelectedBook = setSelectedBook;
        $scope.setSelectedChapter = setSelectedChapter;
        $scope.setSelectedTopic = setSelectedTopic;
        $scope.setSelectedQuestion = setSelectedQuestion;
        $scope.setSelectedQuizes = setSelectedQuizes;

        $scope.SelectedBook = null;
        $scope.SelectedChapter = null;
        $scope.SelectedTopic = null;
        $scope.SelectedQuestion = null;
        $scope.showQuizBankFunc = showQuizBankFunc;
        $scope.showQuiz = showQuiz;
        $scope.showAssignQuiz = showAssignQuiz;
        $scope.showAttemptQuiz = showAttemptQuiz;
        $scope.addQuiz = addQuiz;
        $scope.closeQuiz = closeQuiz;

        $scope.afterLoad = afterLoad;

        $scope.bookId = '';
        $scope.chapterId = '';
        $scope.topicId = '';
        //Firebase
        var ref = new Firebase('https://pspractice.firebaseio.com');
        var refMain = new Firebase('https://luminous-torch-4640.firebaseio.com');
        $scope.books = [];
        $scope.booksId = [];
        $scope.quizes = [];
        $scope.chaptersId = [];
        $scope.chapters = [];
        $scope.topicsId = [];
        $scope.topics = [];
        $scope.questions = [];
        $scope.groups = [];
        //QUIZ SCEDULE variables & functions
        $scope.closeAssignQuiz = closeAssignQuiz;
        $scope.setSelectedGroup = setSelectedGroup;
        $scope.setSelectedSubGroup = setSelectedSubGroup;
        $scope.quizesList = [];
        $scope.quizesListKey = [];
        $scope.subGroup = [];
        $scope.myDatabase = [];
        $scope.selectedGroup = null;
        $scope.dataPush = dataPush;
        $scope.setSelectedQuiz = setSelectedQuiz;


        /*All Function*/

        setTabs()

        authService.resolveUserPage()
            .then(function (response) {
                getUserObj();
                initializeView();
            }, function (err) {
                alert('Error in Line 86: ' + err)
            });
        setTabs();

        function setTabs() {
            if (quizService.getSelectedTab() == 'QuizBank') {
                $timeout(function () {
                    showQuizBankFunc();
                }, 0)
            } else if (quizService.getSelectedTab() == 'Quiz') {
                $timeout(function () {
                    showQuiz();
                }, 0)
            } else if (quizService.getSelectedTab() == 'QuizAssign') {
                $timeout(function () {
                    showAssignQuiz();
                }, 0)
            }
        }

        function initializeView() {
            // console.log(quizService.getBookAfterCreation())
            // console.log(quizService.getBookAfterCreation() !== null)

            if (quizService.getBookAfterCreation() !== null) {
                ref.child('question-bank').on('child_added', function (snapShot) {
                    $timeout(function () {
                        $scope.books.push(snapShot.val());
                        $scope.booksId.push(snapShot.key());
                        if (quizService.getBookAfterCreation() == snapShot.key()) {
                            $scope.selectedBookIndex = $scope.booksId.indexOf(snapShot.key());
                            $scope.bookId = snapShot.key();
                        }
                    }, 0)
                });
            } else {
                // console.log('ELSE');
                ref.child('question-bank').on('child_added', function (snapShot) {
                    $timeout(function () {
                        $scope.books.push(snapShot.val());
                        $scope.booksId.push(snapShot.key());

                    }, 0)
                });

                /*if(quizService.getSelectedBook()) {
                 $scope.selectedBookIndex = quizService.getSelectedBook();
                 $scope.bookId = quizService.getBook();
                 }else{
                 $scope.selectedBookIndex = 0;
                 $scope.bookId = quizService.getBook();
                 quizService.setBook($scope.bookId, $scope.selectedBookIndex);
                 }*/

                if (quizService.getBook() !== null) {
                    $scope.bookId = quizService.getBook();
                    $scope.selectedBookIndex = quizService.getSelectedBook();
                    console.log(quizService.getBook());
                    ref.child('question-bank-chapters').child(quizService.getBook()).on('child_added', function (snapShot) {
                        $timeout(function () {
                            $scope.chapters.push(snapShot.val());
                            $scope.chaptersId.push(snapShot.key());
                        }, 0)
                    });
                    if (quizService.getChapter() !== null) {
                        $scope.chapterId = quizService.getChapter();
                        ref.child('question-bank-topic').child(quizService.getBook()).child(quizService.getChapter()).on('child_added', function (snapShot) {
                            $timeout(function () {
                                $scope.topics.push(snapShot.val());
                                $scope.topicsId.push(snapShot.key());
                            }, 0)
                        });
                        $scope.selectedChapterIndex = quizService.getSelectedChapter()
                        if (quizService.getTopic() !== null) {
                            $scope.topicId = quizService.getTopic();
                            ref.child('questions').child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).on('child_added', function (snapShot) {
                                $timeout(function () {
                                    $scope.questions.push(snapShot.val())
                                }, 0)
                            });
                            $scope.selectedTopicIndex = quizService.getSelectedTopic()
                            console.log(quizService.getSelectedQuestion())
                            console.log(quizService.getQuestionObject())
                            if (quizService.getSelectedQuestion() !== null) {
                                if (quizService.getQuestionObject() !== null) {
                                    $scope.selectedQuestionIndex = quizService.getSelectedQuestion();
                                    showQuestionView(quizService.getQuestionObject())
                                }
                            }
                        }
                    }
                }
                /*else {
                 $scope.bookId = $scope.booksId[0];
                 quizService.setBook($scope.bookId, 0);

                 }*/
            }
        };

        function afterLoad(check) {
            if (check) {
            }

        };

        function sleep(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        }

        /*  Tabs  */
        function showQuizBankFunc() {
            $scope.showQuizBank = true;
            $scope.showQuizList = false;
            $scope.showQuizAssign = false;
            if (quizService.getQuestionObject() !== null && $scope.questionView !== null) {
                $scope.showView = true;
            }
            $('#chapterColumn').addClass('marginLeft')
            $('#quizBankIcon').addClass('selectedTab')
            $('#quizIcon').removeClass('selectedTab')
            $('#quizAssignIcon').removeClass('selectedTab')
            quizService.setSelectedTab('QuizBank');

            //$scope.chapters = [];
            //$scope.topics = [];
            //$scope.questions = [];
            //$scope.chaptersId = [];
            //$scope.topicsId = [];
            //$scope.questionsId = [];
        }

        function showQuiz() {
            $scope.showQuizBank = false;
            $scope.showQuizList = true;
            $scope.showQuizAssign = false;
            $scope.showView = false;
            //$('#chapterColumn').removeClass('marginLeft')
            $('#quizBankIcon').removeClass('selectedTab')
            $('#quizIcon').addClass('selectedTab')
            $('#quizAssignIcon').removeClass('selectedTab')
            quizService.setSelectedTab('Quiz');

            //$scope.chapters = [];
            //$scope.topics = [];
            //$scope.questions = [];
            //$scope.chaptersId = [];
            //$scope.topicsId = [];
            //$scope.questionsId = [];
        }

        function showAssignQuiz() {



            $scope.showQuizBank = false;
            $scope.showQuizList = false;
            $scope.showQuizAssign = true;

            $scope.showView = false;
            $('#quizBankIcon').removeClass('selectedTab')
            $('#quizIcon').removeClass('selectedTab')
            $('#quizAssignIcon').addClass('selectedTab')

            quizService.setSelectedTab('QuizAssign');

            $scope.shceduleQuizArray = [];
            //Calling Shcedule Array List
            ref.child('quiz-schedule').on('child_added',function(snapShot) {

                var abc = { group: snapShot.key(), sub_group: [] };
                $.map(snapShot.val(), function(dbTopics, sbgindex) {
                    //for getting sub groups and topics
                    var sb = { name: sbgindex, topics: [] };
                    //var tmp2 = {name: sbgindex, topics:
                    $.map(dbTopics, function(quiz, quizindex){

                        //Quiezes
                        var qiuzess = [];
                        $.map(quiz, function(quizDb, qindex) {
                            qiuzess.push(quizDb);
                        });//map quizDb

                        //Topics
                        var topicx = {name: quizindex, quizes: qiuzess};
                        sb.topics.push(topicx);

                    })//map dbtopic

                    //  };//tmp2

                    //var g = tmp2;
                    abc.sub_group.push(sb);

                    // ////for getting sub groups and topics
                    // var sb = { name: sbgindex, topics: [] };
                    // var tmp2 = {name: sbgindex, topics: $.map(dbTopics, function(quiz, quizindex){
                    //     var t = {name: quizindex, quizes: quiz}
                    //     sb.topics.push(t);
                    //     })
                    // };
                    // var g = tmp2;
                    // abc.sub_group.push(sb);


                    //for getting sub groups
                    // var tmp2 = {name: sbgindex, topics: dbTopics};
                    // abc["sub_group"].push(tmp2);
                });//


                $scope.shceduleQuizArray.push(abc);

                console.log(JSON.stringify($scope.shceduleQuizArray));

                $scope.SearchBindRecord = function(a, b, c){
                    if(c === 'sub'){
                        $scope.shceduleQuizSubGroups = a.sub_group;

                        //getting All Questions of Specific Groups
                        $scope.shceduleQuizQuizes = [];
                        $scope.shceduleQuizArray.forEach(function(value, index){

                            if(value.group == b)
                            {
                                value.sub_group.forEach(function(val, indx){

                                    val.topics.forEach(function(v, i){

                                        v.quizes.forEach(function(q, qi){
                                            $scope.shceduleQuizQuizes.push(q);



                                        });//q

                                    });//v
                                });//val

                                //console.log('length: ' + $scope.shceduleQuizQuizes.length + '|' + JSON.stringify($scope.shceduleQuizQuizes));
                            }//if
                        });



                    }// if sub_group

                    if(c === 'topic'){
                        $scope.shceduleQuizTopics = a.topics;



                        //getting All Questions of Specific Sub Group
                        $scope.shceduleQuizQuizes = [];
                        $scope.shceduleQuizArray.forEach(function(value, index){


                            value.sub_group.forEach(function(val, indx){

                                console.log('topic----: ' + JSON.stringify(val));

                                if(val.name == b) {
                                    val.topics.forEach(function(v, i){

                                        v.quizes.forEach(function(q, qi){
                                            $scope.shceduleQuizQuizes.push(q);
                                        });//q

                                    });//v
                                }//if
                            });//val

                            console.log('length: ' + $scope.shceduleQuizQuizes.length + '|' + JSON.stringify($scope.shceduleQuizQuizes));

                        });


                    }//topic

                    if(c === 'quiz'){



                        //console.log('a-->: '+ JSON.stringify(a.topics));
                    }//quiz







                };// SearchBindRecord
                //$scope.SearchBindRecord($scope.shceduleQuizArray, 'saylani', 'sub');


            });


        }

        function showAttemptQuiz() {
            $location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quiz-attempting')
            document.getElementById('navBar').style.display = "none";
        }

        /*  Selection  */
        function setSelectedQuestion(that, index) {
            $scope.selectedQuestionIndex = index;
            quizService.setSelectedQuestion(index)
            /*if ($scope.lastSelectedTopic.selectedTopic) {
             console.log("show", arguments, that);
             $('.selectedTopic').addClass('previousSelected')
             if ($scope.lastSelectedQuestion) {
             $scope.lastSelectedQuestion.selectedQuestion = '';
             }
             that.selectedQuestion = 'selectedQuestion';
             $scope.lastSelectedQuestion = that;
             }
             console.log($scope.lastSelectedTopic.selectedTopic)*/
        }

        function setSelectedTopic(that, index) {
            $scope.selectedQuestionIndex = null;
            $scope.selectedTopicIndex = index;
            quizService.setSelectedTopic(index)
            quizService.setSelectedQuestion(null)
            /*console.log("show", arguments, that);
             if ($scope.lastSelectedChapter.selected) {
             console.log('in IF')
             $('.previousSelected').removeClass('previousSelected')
             $('.selectedChapter').addClass('previousSelected')
             if ($scope.lastSelectedTopic) {
             $scope.lastSelectedTopic.selectedTopic = '';
             }
             that.selectedTopic = 'selectedTopic';
             $scope.lastSelectedTopic = that;
             }*/
        }

        function setSelectedChapter(that, index) {
            $scope.selectedQuestionIndex = null;
            $scope.selectedTopicIndex = null;
            $scope.selectedChapterIndex = index;
            quizService.setSelectedChapter(index)
            quizService.setSelectedTopic(null)
            quizService.setSelectedQuestion(null)
            /*$('.selectedChapter').removeClass('previousSelected')
             console.log("show", that);
             if ($scope.lastSelectedChapter) {
             $scope.lastSelectedChapter.selected = '';
             }
             quizService.setSelectedChapter(that)
             that.selected = 'selectedChapter';
             $scope.lastSelectedChapter = that;
             console.log($scope.lastSelectedChapter.selected)*/
        }

        function setSelectedBook(that, index) {
            $scope.selectedBookIndex = index;
            quizService.setSelectedBook(index)

            $scope.selectedQuestionIndex = null;
            $scope.selectedTopicIndex = null;
            $scope.selectedChapterIndex = null;
            quizService.setSelectedChapter(null)
            quizService.setSelectedTopic(null)
            quizService.setSelectedQuestion(null)
            /*$scope.selectedQuestionIndex = null;
             $scope.selectedTopicIndex = null;
             $scope.selectedChapterIndex = null;
             if ($scope.lastSelectedBook) {
             $scope.lastSelectedBook.selected = '';
             }
             that.selected = 'selectedBook';
             $scope.lastSelectedBook = that;
             console.log($scope.lastSelectedBook.selected)*/
        }

        function setSelectedQuizes(index) {
            $scope.selectedQuizes = index;
        }

        /*  Question Bank   */
        function showChapters(bookIndex) {
            quizService.setQuestionObject(null)
            quizService.setChapter(null, null);
            quizService.setTopic(null, null);
            console.log('showing Chapters')
            quizService.setQuestionObject(null);
            $scope.showView = false;
            $scope.questionView = null;
            $scope.bookId = $scope.booksId[bookIndex];
            quizService.setBook($scope.bookId, bookIndex);
            $scope.chapterId = null
            $scope.topicId = null
            $scope.show = true;
            $scope.chapters = [];
            $scope.topics = [];
            $scope.questions = [];

            $scope.chaptersId = [];
            $scope.topicsId = [];
            $scope.questionsId = [];
            ref.child('question-bank-chapters').child($scope.bookId).on('child_added', function (snapShot) {
                $timeout(function () {
                    $scope.chapters.push(snapShot.val());
                    $scope.chaptersId.push(snapShot.key());
                }, 0)
            })
        }

        function showTopics(chapterIndex) {
            quizService.setTopic(null, null);
            quizService.setQuestionObject(null);
            $scope.topics = [];
            $scope.questions = [];

            $scope.topicsId = [];
            $scope.questionsId = [];
            $scope.showView = false;
            $scope.topicId = null
            $scope.questionView = null;
            $scope.chapterId = $scope.chaptersId[chapterIndex];
            quizService.setChapter($scope.chapterId, chapterIndex);
            $scope.topics = [];
            $scope.questions = []
            ref.child('question-bank-topic').child($scope.bookId).child($scope.chapterId).on('child_added', function (snapShot) {
                $timeout(function () {
                    $scope.topics.push(snapShot.val());
                    $scope.topicsId.push(snapShot.key());
                }, 0)
            })
        }

        function showQuestions(topicIndex) {
            $scope.showView = false;
            $scope.questionView = null;
            $scope.topicId = $scope.topicsId[topicIndex];
            quizService.setTopic($scope.topicId, topicIndex);
            quizService.setQuestionObject(null);
            $scope.questions = [];
            ref.child('questions').child($scope.bookId).child($scope.chapterId).child($scope.topicId).on('child_added',
                function (snapShot) {
                    $timeout(function () {
                        $scope.questions.push(snapShot.val())
                    }, 0)
                });

        }

        function showQuestionView(question) {
            if (question !== null) {
                quizService.setQuestionObject(question);
            }
            console.log('Showing Question View ' + question);
            $scope.showView = true;
            $scope.questionView = question;
        }

        /*  Quizes functions  */
        $scope.showQuizes = showQuizes;
        $scope.showQuizesQuestions = showQuizesQuestions;
        $scope.quizes = [];

        function showQuizes(bookIndex) {
            $scope.quizes = [];
            ref.child('quiz-create').child(quizService.getBook()).on('child_added', function (snapShot) {
                var temp = {
                    details: snapShot.val().quizDetails,
                    key: snapShot.key()
                };
                $scope.quizes.push(temp);
            });
        }

        function showQuizesQuestions(index) {
            $scope.Array = [];
            var iterator = 0;
            var chapterKey = '';
            console.log('showing quiz Questions');
            ref.child('quiz-create').child(quizService.getBook()).child($scope.quizes[index].key).child('quizQuestion')
                .on('child_added', function (snapShot) {
                    chapterKey = snapShot.key();
                    var chapterTemp = snapShot.val().ChapterDetails;
                    ref.child('quiz-create').child(quizService.getBook()).child($scope.quizes[index].key).child('quizQuestion')
                        .child(chapterKey).child('ChapterTopics').on('child_added', function (snap) {
                            var topicTemp = snap.val().TopicDetails;
                            ref.child('quiz-create').child(quizService.getBook()).child($scope.quizes[index].key).child('quizQuestion')
                                .child(chapterKey).child('ChapterTopics').child(snap.key())
                                .child('TopicQuestions').on('child_added', function (shot) {
                                    $scope.Array[iterator] = {
                                        chapterDetails: chapterTemp,
                                        topicDetails: topicTemp,
                                        question: shot.val()
                                    };
                                    iterator++;
                                });

                        });
                });

        }

        /*  Quiz Assign  */
        /*refMain.child('groups-names').on('child_added', function (snapshot) {
         $scope.groups.push({
         details : snapshot.val(),
         key   : snapshot.key()
         });
         console.log( snapshot.val() + ' ' + snapshot.key());
         })*/
        $scope.assignQuiz = assignQuiz;
        // console.log($localStorage.loggedInUser)
        $scope.userID = '123654789';
        /*userService.getCurrentUser()*/
        var groupDataUbind = {}
        var userDataUbind = {}
        var userObjUbind;
        $scope.userObj = [];
        function getUserObj() {
            // console.log('getUserObj: ' + userService.getCurrentUser().userID)
            //var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child($scope.userID))
            var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child(userService.getCurrentUser().userID))
                .$loaded()
                .then(function (data) {
                    //alert(data.$id)
                    // console.log('THEN getUserObj')

                    userObjUbind = data.$watch(function () {
                        getUserObj()
                    })
                    $scope.userObj = data;
                    data.forEach(function (el, i) {
                        var j = i;
                        $firebaseObject(firebaseService.getRefGroups().child(el.$id))
                            .$loaded()
                            .then(function (groupData) {
                                groupDataUbind[j] = groupData.$watch(function () {
                                    $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""
                                });
                                $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""

                                if (groupData['group-owner-id']) {
                                    //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/!*.child('profile-image')*!/)
                                    $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
                                        .$loaded()
                                        .then(function (img) {

                                            $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value);
                                            userDataUbind[j] = img.$watch(function (dataVal) {

                                                $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img)
                                            })
                                            // console.log($scope.userObj)
                                        })

                                }
                            });
                    });
                })
                .catch(function (err) {
                    //alert(err);
                })
        };
        function assignQuiz() {
           /* $timeout(function () {
                $location.path('/user/:userID/quiz/quizAssign');
            }, 0)*/
            $scope.subGroup= [];
            $timeout(function () {
                $scope.showQuizSceduling = navService.toggleRight6;
                $scope.showQuizSceduling();
            }, 0)

            $scope.quizesList = [];
            ref.child('quiz-create').child(quizService.getBook()).on('child_added',function(snapShot) {
                $scope.quizesListKey.push(snapShot.key());
                $scope.quizesList.push(snapShot.val().quizDetails);
                console.log(snapShot.val());

            });
            console.log($scope.quizesListKey);

            for(var i = 0; i < $scope.userObj.length; i++) {

                $scope.myDatabase[i] = {
                    groupId: $scope.userObj[i].$id,
                    subGroupId: null,
                    subGroupIdIndex: null,
                    bookId: quizService.getBook(),
                    quizId:null


                };

            }

            console.log($scope.myDatabase);
        }


        function setSelectedQuiz(id){
            $scope.seclectedQuizID = id;
            for(var i = 0; i < $scope.userObj.length; i++) {

                if ($scope.myDatabase[i].groupId == $scope.selectedGroup) {
                    $scope.myDatabase[i].quizId = $scope.seclectedQuizID;

                }
                console.log($scope.myDatabase[i]);
            }
//            console.log($scope.myDatabase);

        }




        function setSelectedGroup(id, index){
            $scope.selectedGroup = id;
            $scope.selectedGroupIndex = index;
            $scope.subGroup= [];
            refMain.child('subgroups').child(id).on('child_added', function(snapShot){
                $scope.subGroup.push(snapShot.key());
                console.log($scope.subGroup);
            });


        }

        function setSelectedSubGroup(id, index){
            $scope.subGroupId = id;
            for(var i = 0; i < $scope.userObj.length; i++) {

                if ($scope.myDatabase[i].groupId == $scope.selectedGroup) {
                    $scope.myDatabase[i].subGroupId = id;
                    $scope.myDatabase[i].quizId = $scope.seclectedQuizID;
                    $scope.myDatabase[i].subGroupIdIndex = index;
                }




            }
            console.log($scope.myDatabase);
        }


        function dataPush(){


            for(var i = 0; i < $scope.userObj.length; i++) {


                if ($scope.myDatabase[i].subGroupId != null && $scope.myDatabase[i].quizId != null) {

                    for(var a  = 0; a < $scope.quizesList.length; a++) {
                        if($scope.quizesList[a].title == $scope.myDatabase[i].quizId){
                            alert("yes");
                            ref.child('quiz-schedule').child($scope.myDatabase[i].groupId).child($scope.myDatabase[i].subGroupId).child($scope.myDatabase[i].bookId).push({
                                quizName: $scope.quizesList[a].title,
                                quizUid: $scope.quizesListKey[a]
                            });
                            console.log($scope.myDatabase[i]);
                        }
                    }
                }
            }
            closeAssignQuiz();
        }


        function closeAssignQuiz() {
            $scope.showQuizSceduling = navService.toggleRight6;
            $scope.showQuizSceduling();

        }



        function showQuizChapters(bookIndex) {
            console.log('showing quiz Chapters')
            $scope.bookId = $scope.booksId[bookIndex];
            quizService.setBook($scope.bookId, bookIndex);
        }

        function showQuizTopics() {
            console.log('showing quiz Topics')
        }


        /*  Question Bank Addition Functions  */

//        Create Book Navigation Start
        $scope.desc = "";
        $scope.newImg = null;
        $scope.imgLogoUrl;
        var userQuestionBanksRef1 = new Firebase('https://pspractice.firebaseio.com/');

        function addBook() {
            $scope.showbook = navService.toggleRight1;
            $scope.showbook();
        }

        function createBook(bookForm, p) {
            //alert('hi')
            console.log($scope.imgLogoUrl)
            console.log($rootScope.newImg);
            $scope.temps = {

                title: $scope.name,
                description: $scope.desc,
                //imgLogoUrl: $scope.imgLogoUrl || 'img/1angular.png'
                imgLogoUrl: p
            };

            console.log('tmp: '+ JSON.stringify($scope.temps))

            userQuestionBanksRef1.child('user-question-banks').child(userService.getCurrentUser().userID).child($scope.bookID).set({'membership-type': 1});
            userQuestionBanksRef1.child("question-bank-memberships").child($scope.bookID).child(userService.getCurrentUser().userID).set({"membership-type": 1});
            userQuestionBanksRef1.child("question-bank").child($scope.bookID).set($scope.temps);
            console.log($scope.temps);


            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                console.log(x)
                console.log(temp)
                console.log(mimeType)
                console.log( $scope.bookID)
                $scope.saveFile(x, mimeType, $scope.bookID)
                    .then(function (url) {
                       // $scope.temps.imgLogoUrl = url + '?random=' + new Date();
                        //its for sending data on firebase by Name's node
                        userQuestionBanksRef1.child('user-question-banks').child(userService.getCurrentUser().userID).child($scope.bookID).set({'membership-type': 1});
                        userQuestionBanksRef1.child("question-bank-memberships").child($scope.bookID).child(userService.getCurrentUser().userID).set({"membership-type": 1});
                        userQuestionBanksRef1.child("question-bank").child($scope.bookID).set($scope.temps);
                        console.log($scope.temps);

                        // quizService.setBookAfterCreation($scope.bookID)
                        // ref.child($scope.bookID).set(temp);
                        $scope.name = "";
                        $scope.desc = "";
                        $scope.bookID = "";
                        //$scope.newImg = null;
                        alert('book creation successful')
                        // $location.path('/user/' + user.userID)
                    })
                    .catch(function () {
                        //bookForm.$submitted = false;
                        //return messageService.showSuccess('picture upload failed')
                        alert('picture upload failed')
                    });
            }


        }

        $scope.showAdvanced1 = function (ev) {
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue.tmpl.html',
                targetEvent: ev
            }).then(function (picture) {
                $rootScope.newImg = picture;
                console.log("this is image" + picture)
            }, function (err) {
                console.log(err)

            })

        };

        $scope.saveFile = function (file, type, quizID) {

            console.log(file);
            console.log(type);
            console.log(quizID);

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savequizBookPicture?quizID=" + quizID + "&file_type=" + type);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(upload_file(file, response.signed_request, response.url));
                    }
                    else {
                        defer.reject(alert("Could not get signed URL."))
                    }
                }
            };
            defer.resolve(true)/*remove it*/
//            xhr.send();
            return defer.promise;
        };

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function (data) {
                console.log(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded....');
                    console.log('picture upload successful')
                    console.log(url);

                    defer.resolve(url)

                }
            };
            xhr.onerror = function (error) {
                defer.reject(messageService.showSuccess("Could not upload file."));
            };
            xhr.send(file);
            console.log(file);
            return defer.promise;
        }

        function closeBook() {
            $scope.showbook = navService.toggleRight1;
            $scope.showbook();
        }

//        Create Book Navigation End


        /*  Question Bank Addition Functions  */
        /*        function addBook() {
         //console.log('Add Book')
         $timeout(function () {
         $location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddBook')
         }, 0)
         }*/

        var ref = new Firebase('https://pspractice.firebaseio.com/');

        $scope.bookId = $stateParams.id;
        $scope.Title = '';
        $scope.Description = '';
        function createChapter() {
            console.log($scope.Title + " " + $scope.Description)
            ref.child("question-bank-chapters").child($scope.bookId).push({
                title: $scope.Title,
                description: $scope.Description
            }, function () {
                $scope.Title = '';
                $scope.Description = '';

            });
        }

        function addChapter() {
            if ($scope.bookId) {
                $timeout(function () {
                    $scope.showChapter = navService.toggleRight2;
                    $scope.showChapter();
                }, 0)
            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Book' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }
        }

        function closeChapter() {
            $scope.showChapter = navService.toggleRight2;
            $scope.showChapter();
        }


        $scope.Title = '';
        $scope.Description = '';
        $scope.chapterId = $stateParams.id;

        function createTopic() {
            ref.child("question-bank-topic").child(quizService.getBook()).child($scope.chapterId).push({
                description: $scope.Description,
                title: $scope.Title
            });
        }

        function addTopic() {
            //console.log('Add Book')
            if ($scope.chapterId) {
                $timeout(function () {
                    //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddTopic/' + $scope.chapterId)
                    $scope.showTopic = navService.toggleRight4;
                    $scope.showTopic();
                }, 0)
            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Chapter' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }
        }

        function closeTopic() {
            $scope.showTopic = navService.toggleRight4;
            $scope.showTopic();
        }

        function addQuestion() {
            //console.log('Add Book')
            if ($scope.topicId) {
                $timeout(function () {
                    //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizAddQuestion/' + $scope.topicId)
                    $scope.showQuestion = navService.toggleRight3;
                    $scope.showQuestion();
                }, 0)
            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Topic' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }
        }

        function closeQuestion() {
            $scope.showQuestion = navService.toggleRight3;
            $scope.showQuestion();
        }


//AddQuestion Controller Work
        var that = this;
        var myFirebaseRef = new Firebase("https://pspractice.firebaseio.com/");
        var idCounter = 3;
        this.showRadioOptions = false;
        this.showCheckOptions = false;
        this.showAddButton = false;
        this.myAnswer = undefined;
        this.myType = '';
        that.answerTag = [];
        that.myTop = ['40px', '50px'];
        var topMargin = 50;
        this.showCheckText = false;
        this.topicId = $stateParams.id;
//
//
        //Answer Types.
        this.types = [
            {name: 'Radio Button'},
            {name: 'CheckBox'}
        ];
        this.question = {
            Title: '',
            Description: '',
            Type: '',
            QuestionOptions: [
                {optionText: '', id: 2, rightAnswer: false},
                {optionText: '', id: 3, rightAnswer: false}
            ]
        };
        //If Answer Type Changes.
        this.typeChanged = function () {

            that.radioValue = '';
            that.myAnswer = undefined;
            that.myTop = ['40px', '90px'];
            topMargin = 50;
            angular.forEach(that.question.QuestionOptions, function (data) {
                if (data.id === true) {
                    data.id = false;
                }
            });
        };
        //Setting different inputs.
        this.setBoxValue = function () {
            this.showAddButton = true;
            that.question.QuestionOptions = [
                {optionText: '', id: 2, rightAnswer: false},
                {optionText: '', id: 3, rightAnswer: false}
            ];
            if (that.myType.name === 'Radio Button') {
                that.showRadioOptions = true;
                that.showCheckOptions = false;
                that.answerTag = [];
                that.myAnswer = undefined;
            }
            else if (that.myType.name === 'CheckBox') {
                that.showCheckOptions = true;
                that.showRadioOptions = false;
                that.answerTag = [];
                that.myAnswer = undefined;
            }
        };
        //Push new input fields.
        this.addOption = function () {

            //Radio margin.
            if (topMargin < 100) {
                topMargin += 50;
            }
            that.myTop.push(topMargin + 'px');
            idCounter++;
            that.question.QuestionOptions.push({optionText: '', id: idCounter, rightAnswer: false});
        };
        //Delete Option
        this.deleteOption = function (optionIndex) {
            if (optionIndex > -1) {
                that.question.QuestionOptions.splice(optionIndex, 1);
            }
        };

        //Sets Answer if Type CheckBox is selected.
        that.setCheckBoxValue = function (questionId) {
            if (that.question.QuestionOptions[questionId].id == true) {
                that.question.QuestionOptions[questionId].rightAnswer = true;
                that.answerTag.push('one');
            }
            else if (that.question.QuestionOptions[questionId].id == false) {
                that.question.QuestionOptions[questionId].rightAnswer = false;
                that.answerTag.pop();
            }
        };
//        //Add more Questions, Saves data to firebase and clears input fields.
        that.addQuestionsAndContinue = function () {
            that.showRadioOptions = false;
            that.showCheckOptions = false;
            that.showAddButton = false;
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function (data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    }
                    else {
                        data.rightAnswer = false;
                    }
                });
            }
            angular.forEach(that.question.QuestionOptions, function (data) {
                delete data.$$hashKey;
                delete data.$$mdSelectId;
                delete data.id;
            });
            that.question.Type = that.myType.name;
            myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(that.question);
            that.question = {
                Title: '',
                Description: '',
                Type: '',
                Answer: [],
                QuestionOptions: [
                    {optionText: '', id: 2, rightAnswer: false},
                    {optionText: '', id: 3, rightAnswer: false}
                ]
            };
            that.myAnswer = undefined;
        };
        //Redirect on close
        this.prev = function () {
            $timeout(function () {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            });
        };
        //Save and Exit Button
        this.showAnswer = function () {
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function (data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    }
                    else {
                        data.rightAnswer = false;
                    }
                });
            }
            angular.forEach(that.question.QuestionOptions, function (data) {
                delete data.$$hashKey;
                delete data.$$mdSelectId;
                delete data.id;
            });
            that.question.Type = that.myType.name;
            myFirebaseRef.child("questions").child(quizService.getBook()).child(quizService.getChapter()).child(quizService.getTopic()).push(that.question, function () {

                that.question = {};
                abc();
            });

            that.myAnswer = undefined;

        };


        //View Dialog Box.
        this.showAdvanced = function (ev) {
            that.question.Type = that.myType.name;
            if (that.myType.name === 'Radio Button') {
                angular.forEach(that.question.QuestionOptions, function (data) {
                    if (data.optionText == that.myAnswer.optionText) {
                        data.rightAnswer = true;
                    }
                    else {
                        data.rightAnswer = false;
                    }
                });
            }
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './components/quiz-add-question/dialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {questionData: that.question}
            })
                .then(function (answer) {

                }, function () {

                });
        };

        //addQuestion work end


        function editChapter(chapter) {
            alert(chapter.name);
            chapter.showEdit = !chapter.showEdit;
        }

        function addQuiz() {

            /*$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizCreate/')*/

            if ($scope.bookId) {
                $timeout(function () {
                    //$location.path('/user/' + userService.getCurrentUser().userID + '/quiz/quizCreate/')

                    $scope.showQuize = navService.toggleRight5;
                    $scope.showQuize();

                    //Parou Code
                    var that = this;
                    var bookId = '';
                    var chapId = '';
                    var marker = 0;
                    $scope.awaisObject = {};
                    $scope.flagChapters = [];
                    $scope.flagTopics = [];
                    $scope.showQuestionView1 = false;
                    $scope.quizObject = {};

                    //temporary
                    $scope.showTick = true;
                    $scope.buttonText = 'Next';
                    $scope.quizTitle = '';
                    var topicCounter = 0;
                    $scope.quizDescription = '';
                    $scope.quizTime = '';
                    var myCounter = 0;
                    $scope.questionIndex = 0;
                    $scope.tempQuestions = [];
                    $scope.myChapterIndex = 0;
                    $scope.viewAllQuestions = [];
                    $scope.viewAllTopics = [];
                    //bring the chapters from firebase

                    $scope.secondBookName = 'angular101';
                    $scope.secondChapters = [];
                    $scope.secondChaptersKey = [];
                    /*This will show hide quiz tabs*/
                    var counter = 1;
                    var tabCounter = 1;
                    var arr = [], name = '';
                    $scope.myChapters = [];
                    $scope.myChaptersKey = [];
                    $scope.thirdTopics = [];
                    //Data fetching from firebase
                    $scope.chapters = [];
                    $scope.chaptersId = [];
                    $scope.nestedQuestions = [];
                    $scope.topics = [];
                    $scope.topicsId = [];
                    $scope.questions = [];
                    $scope.questionsId = [];
                    $scope.showOne = false;
                    $scope.showTwo = true;
                    $scope.showThree = false;
                    //Second Page
                    // all variables
                    $scope.show = false;
                    $scope.showView = false;
                    $scope.showQuizBar = false;
                    $scope.showTick = false;
                    $scope.bookId = '';
                    $scope.chapterId = '';
                    $scope.topicId = null;
                    $scope.SelectedBook = null;
                    $scope.SelectedChapter = null;
                    $scope.SelectedTopic = null;
                    $scope.SelectedQuestion = null;
                    /*$scope.quizes = [];*/
                    $scope.chaptersId = [];
                    $scope.chapters = [];
                    $scope.topicsId = [];
                    $scope.topics = [];
                    $scope.questions = [];
                    $scope.questionView = '';
                    $scope.latestNode = [];


                    /*
                     if (tabCounter == 1) {
                     //Tab Icons
                     that.oneTab = true;
                     that.twoTab = true;
                     that.threeTab = false;
                     tabCounter++;

                     }*/


                    // seleted data start
                    $scope.setSelectedQuestion = function (thisScope) {

                        if ($scope.lastSelectedTopic.selectedTopic) {
                            $('.selectedTopic').addClass('previousSelected');
                            if ($scope.lastSelectedQuestion) {
                                $scope.lastSelectedQuestion.selectedQuestion = '';
                            }
                            thisScope.selectedQuestion = 'selectedQuestion';
                            $scope.lastSelectedQuestion = thisScope;
                        }
                    };

                    $scope.setSelectedTopics = function (thisScope) {
                        if ($scope.lastSelectedChapter.selected) {
                            $('.previousSelected').removeClass('previousSelected');
                            $('.selectedChapter').addClass('previousSelected');
                            if ($scope.lastSelectedTopic) {
                                $scope.lastSelectedTopic.selectedTopic = '';
                            }
                            thisScope.selectedTopic = 'selectedTopic';
                            $scope.lastSelectedTopic = thisScope;
                        }
                    };

                    $scope.setSelectedChapters = function (thisScope) {

                        $('.selectedChapter').removeClass('previousSelected');
                        if ($scope.lastSelectedChapter) {
                            $scope.lastSelectedChapter.selected = '';
                        }
                        quizCreateService.setSelectedChapter(thisScope);
                        thisScope.selected = 'selectedChapter';
                        $scope.lastSelectedChapter = thisScope;
                    };
                    //selected data end
                    //2nd Tab Functions
                    var chapterCounter = 0;
                    //Chapters

                    ref.child('question-bank-chapters').child(quizService.getBook()).on('child_added', function (snapShot) {
                        //$timeout(function () {

                        $scope.chapters.push(snapShot.val());
                        /*console.log($scope.chapters.push(snapShot.val()));*/
                        $scope.chaptersId.push(snapShot.key());
                        $scope.chaptersSnapData = snapShot.val();
                        $scope.nestedQuestions.push([]);
                        $scope.flagChapters[chapterCounter] = {};
                        $scope.flagChapters[chapterCounter].id = true;
                        $scope.viewAllTopics.push([]);
                        $scope.flagTopics.push([]);
                        chapterCounter++;
                        //}, 0)

                    });


                    bookId = quizService.getBook();
                    $scope.bookId = quizService.getBook();
                    $scope.quizObject[quizService.getBook()] = {};
                    $scope.awaisObject[quizService.getBook()] = {};

                    //Topics
                    $scope.showTopics = function (chapterIndex) {
                        $scope.showQuestionView1 = false;
                        if ($scope.quizObject[bookId]['quizQuestion'] == undefined) {
                            $scope.quizObject[bookId]['quizQuestion'] = {};
                        }
                        $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]] = {};
                        $scope.awaisObject[bookId][$scope.chaptersId[chapterIndex]] = {};
                        $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]]['ChapterDetails'] = {
                            title: $scope.chapters[chapterIndex].title,
                            description: $scope.chapters[chapterIndex].description
                        };
                        $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]]['ChapterTopics'] = {};
                        $scope.awaisObject[bookId][$scope.chaptersId[chapterIndex]] = {};
                        console.log("Chapter Details");
                        console.log($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[chapterIndex]]['ChapterDetails']);
                        $scope.chapterId = $scope.chaptersId[chapterIndex];
                        $scope.myChapterIndex = chapterIndex;
                        quizCreateService.setChapter($scope.chapterId, chapterIndex);

                        if ($scope.flagChapters[chapterIndex].id == true) {
                            $scope.nestedQuestions[chapterIndex] = [];
                            $scope.tempQuestions[chapterIndex] = [];
                            $scope.flagChapters[chapterIndex].id = false;
                            $scope.topics = [];
                            $scope.topicsId = [];
                            $scope.topicId = null;
                            topicCounter = 0;
                            ref.child('question-bank-topic').child(quizService.getBook()).child(quizCreateService.getChapter()).on('child_added', function (snapShot) {
                                $timeout(function () {
                                    $scope.topics.push(snapShot.val());
                                    $scope.viewAllTopics[chapterIndex].push(snapShot.val());
                                    $scope.topicsId.push(snapShot.key());
                                    $scope.flagTopics[chapterIndex][topicCounter] = {};
                                    $scope.flagTopics[chapterIndex][topicCounter].id = true;
                                    $scope.nestedQuestions[chapterIndex].push([]);
                                    $scope.tempQuestions[chapterIndex].push([]);
                                    topicCounter++;
                                }, 0)
                            })
                        }
                        else {
                            $scope.topics = $scope.viewAllTopics[chapterIndex];
                            $scope.myChapterIndex = chapterIndex;
                        }
                    };

                    //Questions.
                    $scope.showQuestions = function (topicIndex) {
                        $scope.showQuestionView1 = false;
                        if ($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]] == undefined) {
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]] = {};
                            $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[topicIndex]] = {};
                            //Topic Object
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]]['TopicDetails'] = {
                                title: $scope.topics[topicIndex].title,
                                description: $scope.topics[topicIndex].description
                            };
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]]['TopicQuestions'] = {};
                            $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[topicIndex]] = {};
                            console.log("Topic Details");
                            console.log($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[topicIndex]]);
                        }
                        if ($scope.flagTopics[$scope.myChapterIndex][topicIndex].id == true) {

                            $scope.flagTopics[$scope.myChapterIndex][topicIndex].id = false;
                            $scope.nestedQuestions[$scope.myChapterIndex][topicIndex] = [];
                            myCounter = 0;
                            $scope.questionIndex = topicIndex;
                            $scope.showView = false;
                            $scope.topicId = $scope.topicsId[topicIndex];
                            $scope.tempQuestions[$scope.myChapterIndex][topicIndex] = [];
                            quizCreateService.setTopic($scope.topicId, topicIndex);

                            ref.child('questions').child(quizService.getBook()).child(quizCreateService.getChapter()).child(quizCreateService.getTopic()).on('child_added',
                                function (snapShot) {
                                    $timeout(function () {
                                        $scope.questions.push(snapShot.val());
                                        $scope.questionsId.push(snapShot.key());
                                        $scope.nestedQuestions[$scope.myChapterIndex][topicIndex].push(snapShot.val());
                                        $scope.tempQuestions[$scope.myChapterIndex][topicIndex].push(snapShot.val());
                                        $scope.tempQuestions[$scope.myChapterIndex][topicIndex][myCounter].id = false;
                                        $scope.nestedQuestions[$scope.myChapterIndex][topicIndex][myCounter].id = false;
                                        myCounter++;
                                    }, 0)
                                });
                        }
                        else {
                            $scope.questionIndex = topicIndex;
                            $scope.nestedQuestions[$scope.myChapterIndex][topicIndex] = $scope.tempQuestions[$scope.myChapterIndex][topicIndex];
                        }
                    };
                    $scope.showQuestionView = function (question) {
                        $scope.showQuestionView1 = true;
                        if (question !== null) {
                            quizService.setQuestionObject(question);
                        }
                        $scope.questionView = question;
                    };
                    $scope.checkArray = [];
                    $scope.showTickIcon = function (trueFalseValue, questionIndex) {

                        console.log($scope.tickArray);

                        if (trueFalseValue == false) {
                            console.log("Checking");
                            $scope.checkArray.push(questionIndex)
                            //$scope.tickArray.push(trueFalseValue);
                            //console.log($scope.tickArray + 'pus');
                            $scope.showQuestionView1 = true;
                            $scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = true;
                            $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = true;
                            $scope.viewAllQuestions.push($scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex]);
                            if ($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'] == undefined) {
                                $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'] = {};
                                $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[$scope.questionIndex]] = {};
                            }
                            $scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'][$scope.questionsId[questionIndex]] = $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex];
                            $scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[$scope.questionIndex]][$scope.questionsId[questionIndex]] = $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex];
                        }
                        else if (trueFalseValue == true) {
                            $scope.checkArray.splice($scope.checkArray.indexOf(questionIndex), 1);
                            //$scope.tickArray.splice(trueFalseValue,1);
                            //console.log($scope.tickArray + 'splice');
                            $scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = false;
                            $scope.tempQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].id = false;
                            arr = $scope.viewAllQuestions;
                            name = $scope.nestedQuestions[$scope.myChapterIndex][$scope.questionIndex][questionIndex].Title;
                            angular.forEach(arr, function (data, key) {
                                if (data.Title == name) {
                                    arr.splice(key, 1);
                                }
                            });
                            $scope.viewAllQuestions = arr;
                            delete($scope.quizObject[bookId]['quizQuestion'][$scope.chaptersId[$scope.myChapterIndex]]['ChapterTopics'][$scope.topicsId[$scope.questionIndex]]['TopicQuestions'][$scope.questionsId[questionIndex]]);
                            delete($scope.awaisObject[bookId][$scope.chaptersId[$scope.myChapterIndex]][$scope.topicsId[$scope.questionIndex]][$scope.questionsId[questionIndex]]);
                        }


                    };


                    $scope.createQuiz = function () {
                        /*Quiz Create.*/

                        //Delete Topics if Questions not there.
                        console.log($scope.quizObject[bookId]['quizQuestion']);
                        angular.forEach($scope.quizObject[bookId]['quizQuestion'], function (datum, key, obj) {
                            //$scope.consoleObj = datum;
                            //console.log($scope.consoleObj + 'TIS IS T LENT OF AN OBJECT');
                            //console.log(datum +  'TIS IS T LENT OF AN OBJECT');
                            //console.log(datum +  'TIS IS T LENT OF AN OBJECT');
                            angular.forEach(datum['ChapterTopics'], function (datum1, key2) {
                                if (Object.keys(datum1['TopicQuestions']).length == 0) {
                                    delete ($scope.quizObject[bookId]['quizQuestion'][key]['ChapterTopics'][key2]);
                                }
                            })
                        });
                        //console.log($scope.consoleObj);
                        //console.log($scope.consoleObj.length + 'TIS IS T LENT OF AN OBJECT');
                        //Delete Chapters if Topics not there.
                        angular.forEach($scope.quizObject[bookId]['quizQuestion'], function (data, key) {
                            if (Object.keys(data['ChapterTopics']).length == 0) {
                                delete($scope.quizObject[bookId]['quizQuestion'][key])
                            }
                        });


                        /*Quiz Attempt*/

                        //Delete Topics if Questions not there.
                        angular.forEach($scope.awaisObject[bookId], function (datum, key) {
                            angular.forEach(datum, function (datum1, key2) {
                                if (Object.keys(datum1).length == 0) {
                                    delete ($scope.awaisObject[bookId][key][key2]);
                                }
                            })
                        });


                        //Delete Chapters if Topics not there.
                        angular.forEach($scope.awaisObject[bookId], function (data, key) {
                            if (Object.keys(data).length == 0) {
                                delete($scope.awaisObject[bookId][key])
                            }
                        })
                        ;

                        $scope.quizObject[bookId]['quizDetails'] = {
                            title: $scope.quizTitle,
                            description: $scope.quizDescription,
                            time: $scope.quizTime
                        };


                        //Object With Answer.
                        ref.child('quiz-create').child(bookId).push($scope.quizObject[bookId], function () {

                            angular.forEach($scope.awaisObject[bookId], function (one) {
                                angular.forEach(one, function (two) {
                                    angular.forEach(two, function (three) {
                                        angular.forEach(three.QuestionOptions, function (deleteAnswer) {
                                            delete(deleteAnswer.rightAnswer);
                                        });
                                    });
                                });
                            });
                            //Object WithoutAnswer.
                            // ref.child('quiz-attempt').child(bookId).push($scope.awaisObject[bookId]);
                            angular.forEach($scope.viewAllQuestions, function (data) {
                                delete(data.$$hashKey);
                                angular.forEach(data.QuestionOptions, function (option) {
                                    delete(option.$$hashKey);
                                });
                                ref.child('quiz-create').child(bookId).on("child_added", function (snapshot) {
                                    $scope.latestNode.push(snapshot.key());
                                });
                                ref.child('quiz-attempt').child(bookId).child($scope.latestNode[$scope.latestNode.length - 1]).set(
                                    $scope.awaisObject[bookId]
                                );
                            });
                        });

                    };


                }, 0);


            } else {
                $mdToast.show({
                    template: '<md-toast style="z-index:3;">' + 'Please Select Book' + '</md-toast>',
                    //position: 'top right',
                    hideDelay: 5000
                });
            }



            console.log($scope.quizes);
        }

        function closeQuiz() {
            $scope.showbook = navService.toggleRight5;
            $scope.showbook();
        }


        function hover(item) {
            //console.log('Hover')
            // Shows/hides the delete button on hover
            //return item.showEdit = !item.showEdit;
        }

        function editHover(item) {
            alert("Deleting the " + item.name);
            return item.show = false;
        }
    }
})();