/**
 * Created by Adnan Irfan on 06-Jul-15.
 */
(function () {
    'use strict';

    angular
        .module('app.quizAssign')
        .controller('QuizAssignController', QuizAssignController);

    QuizAssignController.$inject = ["$firebaseArray", "firebaseService", "$firebaseObject",  "$timeout", "$location","userService", "quizService", "quizAssignService", "groupFirebaseService", "$localStorage"]

    function QuizAssignController($firebaseArray, firebaseService, $firebaseObject, $timeout, $location, userService, quizService, quizAssignService, groupFirebaseService, $localStorage){
        //Local Variables
        var that = this;
        this.back = back;
        var bookId = '';
        var chapId = '';
        that.flagChapters = [];
        that.flagTopics = [];
        that.showQuestionView1 = false;
        that.quizObject = {};
        var marker = 0;
        that.temporary = [];
        that.subGroupTemp = [];
        this.showTick = true;
        this.buttonText = 'Next';
        this.quizTitle = '';
        var topicCounter = 0;
        this.quizDescription = '';
        this.quizTime = '';
        var myCounter = 0;
        this.mySubgroupIndex = 0;
        that.tempQuestions = [];
        that.myGroupIndex = 0;
        that.viewAllQuestions = [];
        that.viewAllTopics = [];
        that.groupNest = [];
        that.groupIndexGlobal = 0;
        that.detailNest = [];
        that.subgroupIndexGlobal = 0;
        that.groupMine = [];
        that.object = {};
        that.subGroupMine = [];
        that.groupName = '';
        that.quizesList = [];
        that.quizSelect = [];
        that.subgroupIndex = '';
        //bring the chapters from firebase

        that.secondBookName = 'angular101';
        that.secondChapters = [];
        that.secondChaptersKey = [];




        /*This will show hide quiz tabs*/
        var counter = 1;
        var tabCounter = 1;
        var arr = [], name = '';
        that.myChapters = [];
        that.myChaptersKey = [];
        that.thirdTopics = [];
        //Data fetching from firebase
        that.chapters = [];
        that.chaptersId = [];
        that.nestedQuestions = [];
        that.topics = [];
        that.topicsId = [];
        that.questions = [];
        that.questionsId = [];
        that.groupId = [];
        that.subgroups=[];
        that.group = [];
        that.checkSubgroup = [];
        that.quizId = [];


        function back() {
            $timeout(function () {
                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            }, 0)
        };

        //Firebase
        var ref = new Firebase('https://pspractice.firebaseio.com');
        var ref2 = new Firebase('https://pspractice.firebaseio.com');

        
        that.showOne = true;
        that.showTwo = false;
        that.showThree = false;
        that.showFour = false;
        //Tab Icons
        this.oneTab = true;
        this.twoTab = false;
        this.threeTab = false;

        //Show Hide Head Buttons.
        this.one = function () {
            counter = 1;
            this.buttonText = 'Next';
            that.showOne = true;
            that.showTwo = false;
            that.showThree = false;
        };

        this.two = function () {
            this.buttonText = 'Next';
            counter = 2;
            that.showOne = false;
            that.showTwo = true;
            that.showThree = false;
        };

        this.three = function () {
            counter = 3;
            that.showOne = false;
            that.showTwo = false;
            that.showThree = true;
        };


        this.four = function () {
            counter = 4;
            that.showOne = false;
            that.showTwo = false;
            that.showThree = false;

        };


        var groupDataUbind = {}
        var userDataUbind = {}
        var userObjUbind;
        that.userObj = [];
        function getUserObj() {
            //console.log('getUserObj: ' + userService.getCurrentUser().userID)
            //var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child($scope.userID))
            var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child(userService.getCurrentUser().userID))
                .$loaded()
                .then(function (data) {
                    //alert(data.$id)
                    //console.log('THEN getUserObj')

                    userObjUbind = data.$watch(function () {
                        getUserObj()
                    })
                    that.userObj = data;
                    data.forEach(function (el, i) {
                        that.temporary[i] = false;
                        that.subGroupTemp[i] = false;

                        var j = i;
                        $firebaseObject(firebaseService.getRefGroups().child(el.$id))
                            .$loaded()
                            .then(function (groupData) {
                                groupDataUbind[j] = groupData.$watch(function () {
                                    that.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""
                                });
                                that.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""

                                if (groupData['group-owner-id']) {
                                    //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/!*.child('profile-image')*!/)
                                    $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
                                        .$loaded()
                                        .then(function (img) {

                                            //that.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value);
                                            userDataUbind[j] = img.$watch(function (dataVal) {

                                                that.userObj[j].userImg = $sce.trustAsResourceUrl(img)
                                            })

                                        })

                                    //console.log("tabish" + that.userObj[i].$id);
                                    that.groupId[i] = that.userObj[i].$id;

                                    that.groupNest[i] = that.userObj[i].$id;
                                    //alert(i);
                                }

                            });

                    });

                })
                .catch(function (err) {
                    alert(err + "   in catch");
                })
        }

        getUserObj();
        //console.log("Owais");
        //console.log(that.groupId);
        angular.forEach(that.groupId, function(data){
            alert("a");
            console.log("this" + data);
        })



            //Next Button
        this.goToNext = function () {
            counter++;
            if (counter == 2) {
                that.showOne = false;
                that.showTwo = true;
                that.showThree = false;
                if (tabCounter == 1) {
                    //Tab Icons
                    that.oneTab = true;
                    that.twoTab = true;
                    that.threeTab = false;
                    tabCounter++;

                }
                //Second Page
                // all variables
                that.show = false;
                that.showView = false;
                that.showQuizBar = false;
                that.showTick = false;
                that.bookId = '';
                that.chapterId = '';
                that.topicId = null;
                that.SelectedBook = null;
                that.SelectedChapter = null;
                that.SelectedTopic = null;
                that.SelectedQuestion = null;
                that.quizes = [];
                that.chaptersId = [];
                that.chapters = [];
                that.topicsId = [];
                that.topics = [];
                that.questions = [];
                that.questionView = '';
                that.subGroups = [];
                that.quiz=[];

                that.selectedQuizIndex = null;
                that.selectedGroupIndex = null;
                that.selectedSubgrouprIndex = null;



                that.setSelectedQuiz = function(index) {
                    that.selectedQuizIndex = index;
                    that.selectedGroupIndex = null;
                    that.selectedSubgrouprIndex = null;
                    //quizAssignService.selectedQuizIndex(index);
                    //console.log("index1:  " + that.selectedQuizIndex);
                     }

                that.setSelectedGroup = function(index){
                    that.selectedGroupIndex = index;
                    that.selectedSubgroupIndex = null;

                    //console.log("index2:  " + that.selectedGroupIndex);
                }
                that.setSelectedSubgroup = function(index){
                    //that.selectedGroupIndex = index;
                    that.selectedSubgroupIndex = index;

                    //console.log("index2:  " + that.selectedGroupIndex);
                }


                that.showTickIcon = function(trueFalseValue,name) {
                    console.log("quiz");
                    console.log(that.object);
                    //if(that.object == undefined){

                    //}

                    //console.log(quiz);
                    that.detailNest[trueFalseValue] = that.groupId[trueFalseValue]
                    that.groupIndexGlobal = trueFalseValue;

                    //that.groupNest[trueFalseValue]
                    console.log("M here");
                    console.log(that.groupIndexGlobal);

                    if (that.temporary[trueFalseValue] == false) {
                        that.temporary[trueFalseValue] = true;
                        that.groupMine.push(that.groupId[trueFalseValue]);
                        var groupIndex = trueFalseValue;
                        that.object[name] = {};
                        that.groupName = name

                        that.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync(that.groupId[groupIndex], userService.getCurrentUser().userID)
                            .then(function (syncObj) {
                                that.groupSyncObj = syncObj;
                                console.log("SyncObject");
                                console.log(syncObj);

                                //console.log("groupSyncObj");
                                //console.log(that.groupSyncObj);
                                //alert("test " + that.groupID[trueFalseValue]);
                                // $rootScope.groupSyncObj2 = syncObj;
                                // $scope.groupSyncObj.groupSyncObj.$bindTo($scope, "group");
                                that.group = that.groupSyncObj.groupSyncObj;
                                that.subgroups = that.groupSyncObj.subgroupsSyncArray;

                                // = that.groupSyncObj.subgroupsSyncArray.$id;
                                angular.forEach(that.subgroups, function(data){

                                    //alert("qwe");
                                    //console.log(data);
                                });

                                //onsole.log(that.subgroups.title);

                                //alert(that.subgroups);
                                //console.log("groupNesst");
                                //console.log(that.object);
                                //that.subGroupObject =
                                //console.log(that.groupSyncObj.subgroupsSyncArray);
                            });
                    }

                    else if (that.temporary[trueFalseValue] == true) {
                        that.temporary[trueFalseValue] = false;
                        that.subgroups = [];
                        console.log("delete")
                        delete(that.object[name]);
                        //that.object[that.groupName] = {};
                        alert("Tabish")
                        //that.groupNest[trueFalseValue] = false
                       /* angular.forEach(that.groupMine, function (data, key) {
                                that.groupMine.splice(key, 1);
                        });*/

                        //console.log(that.groupMine);
                    }


                    /*angular.forEach(that.groupMine, function(data){
                        that.object[data] = {}

                    });
                    console.log("abc");
                    console.log(that.object);
-
                    angular.forEach(that.object, function(data, key){
                        console.log("abc");
                        console.log(key);
                    })*/
                    console.log(that.object);
                };


                that.subgroupShowTickIcon = function(trueFalseValues,subgroupName) {

                    //console.log("I m");
                    console.log(subgroupName);
                    //that.groupNest[groupIndexGlobal] = [];
                    //that.groupNest[groupIndexGlobal] = that.subgroups;

                      //G: "Tabish"
                    //};
                    that.subgroupIndexGlobal = trueFalseValues;

                    if (that.subGroupTemp[trueFalseValues] == false) {
                        that.subGroupTemp[trueFalseValues] = true;

                        that.subGroupMine.push(that.subgroups[trueFalseValues]);

                        if(that.object[that.groupName] == undefined){
                            that.object[that.groupName] = {};
                        }
                        that.object[that.groupName][subgroupName] ={};
                        that.object[that.groupName][subgroupName][quizService.getBook()] = {};

                        //that.subgroupIndex = 'group' + trueFalseValues;
                        //that.object[that.groupName]['group' + trueFalseValues]= {};
                        /*if(that.object[that.groupName]['group' + trueFalseValues] == undefined) {

                        }*/
                        that.object[that.groupName][subgroupName][quizService.getBook()][that.quizSelect] = {};

                        that.object[that.groupName][subgroupName][quizService.getBook()][that.quizSelect] = {
                            passingPercent: that.quizPercentage
                        };

                        //var groupIndex = trueFalseValues;
                    }

                    else if (that.subGroupTemp[trueFalseValues] == true) {
                        that.subGroupTemp[trueFalseValues] = false;

                        angular.forEach(that.subGroupMine, function (data, key) {
                            that.subGroupMine.splice(key, 1);
                        });
                        console.log("Check");
                        console.log(that.subGroupMine);

                        delete(that.object[that.groupName]['group' + trueFalseValues])
                    }
                      //angular.forEach(that.object, function(data){
                        //angular.forEach()
                        //that.object[data] = {}
                        //  console.log("SubMine");
                      //});

                    console.log("object")
                    console.log(that.object);

                };




                ref2.child('quiz-create').child(quizService.getBook()).on('child_added',function(snapShot) {
                    that.quizId.push(snapShot.key());
                    that.quizesList.push(snapShot.val().quizDetails);
                    console.log(snapShot.val());
                });

                console.log("QuizList");
                console.log(that.quizesList);


                that.quizList = function(index){
                    that.quizSelect = that.quizId[index];
                }



                /*ref.child('quiz-create').child(quizService.getBook()).on('child_added',function(snapShot){
                    that.quiz.push(snapShot.val().quizDetails);
                    //console.log("Data Key"+that.quiz);

                        //console.log('Key' + that.quiz);
                });*/





                that.quizObject[quizService.getBook()] = {};
                bookId = quizService.getBook();

                //Topics

                //Questions.
                that.showQuestions = function (topicIndex) {
                    that.showQuestionView1 = false;
                    if(that.quizObject[bookId][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]] == undefined){
                        that.quizObject[bookId][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]] = {};
                        //Topic Object
                        that.quizObject[bookId][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]]['TopicDetails'] = {
                            title       : that.topics[topicIndex].title,
                            description : that.topics[topicIndex].description
                        };
                        that.quizObject[bookId][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]]['TopicQuestions'] = {};
                        console.log("Topic Details");
                        console.log(that.quizObject[bookId][that.chaptersId[that.myChapterIndex]]['ChapterTopics'][that.topicsId[topicIndex]]);
                    }
                    if (that.flagTopics[that.myChapterIndex][topicIndex].id == true) {

                        that.flagTopics[that.myChapterIndex][topicIndex].id = false;
                        that.nestedQuestions[that.myChapterIndex][topicIndex] = [];
                        myCounter = 0;
                        that.questionIndex = topicIndex;
                        that.showView = false;
                        that.topicId = that.topicsId[topicIndex];
                        that.tempQuestions[that.myChapterIndex][topicIndex] = [];
                        quizAssignService.setTopic(that.topicId, topicIndex);

                        ref.child('questions').child(quizService.getBook()).child(quizAssignService.getChapter()).child(quizAssignService.getTopic()).on('child_added',
                            function (snapShot) {
                                $timeout(function () {
                                    that.questions.push(snapShot.val());
                                    that.questionsId.push(snapShot.key());
                                    that.nestedQuestions[that.myChapterIndex][topicIndex].push(snapShot.val());
                                    that.tempQuestions[that.myChapterIndex][topicIndex].push(snapShot.val());
                                    that.tempQuestions[that.myChapterIndex][topicIndex][myCounter].id = false;
                                    that.nestedQuestions[that.myChapterIndex][topicIndex][myCounter].id = false;
                                    myCounter++;
                                }, 0)
                            });
                    }
                    else {
                        that.questionIndex = topicIndex;
                        that.nestedQuestions[that.myChapterIndex][topicIndex] = that.tempQuestions[that.myChapterIndex][topicIndex];
                    }
                };
                that.showQuestionView = function (question) {
                    that.showQuestionView1 = true;
                    if (question !== null) {
                        quizService.setQuestionObject(question);
                    }
                    that.questionView = question;
                };

            }
            else if (counter == 3) {
                this.buttonText = 'Finish and Exit';
                that.showOne = false;
                that.showTwo = false;
                that.showThree = true;
                //Tab Icons
                if (tabCounter == 2) {
                    //Tab Icons
                    that.oneTab = true;
                    that.twoTab = true;
                    that.threeTab = true;
                    tabCounter++;
                }
                console.log(that.viewAllQuestions);
                angular.forEach(that.quizObject[bookId], function(data, key){
                    if(Object.keys(data['ChapterTopics']).length == 0){
                        delete(that.quizObject[bookId][key])
                    }
                });
            }
            //Last option.
            else if (counter == 4) {
                angular.forEach(that.viewAllQuestions, function (data) {
                    delete(data.$$hashKey);
                    angular.forEach(data.QuestionOptions, function(option){
                        delete(option.$$hashKey);
                    });

                });
                //ref.child('quiz-create').child(bookId).push(that.quizObject);
               /* ref.child('quiz-create').child(bookId).push({
                    'quizQuestion' : that.quizObject[bookId],
                    'quizDetails'  : {
                        'title'      :   that.quizTitle,
                        'description':   that.quizDescription,
                        'quiz-time'  : that.quizTime
                    }
                });*/
                that.showOne = false;
                that.showTwo = false;
                that.showThree = false;
                //Tab Icons
                if (tabCounter == 3) {
                    //Tab Icons
                    that.oneTab = true;
                    that.twoTab = true;
                    that.threeTab = true;
                    tabCounter++;
                }
                ref2.child('quiz-assign').set(that.object);

                $location.path('/user/' + userService.getCurrentUser().userID + '/quiz');
            }
        };




    }
})();