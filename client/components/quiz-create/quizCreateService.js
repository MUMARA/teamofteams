(function () {
    'use strict';
    angular
        .module('app.quizCreate', ['firebase', 'app.quiz'])
        .factory('quizCreateService',
            function () {

                var that = this;
                that.book = null;
                that.bookIndex = null;
                that.chapter = null;
                that.chapterIndex = null;
                that.topic = null;
                that.topicIndex = null;
                that.question = null;
                return {
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


                    'setBook': function (bookId, bookIndex) {
                        that.book = bookId;
                        that.bookIndex = bookIndex;
                        console.log('Book Saved in Service Index: ' + bookIndex)
                    },
                    'setChapter': function (chapterId, chapterIndex) {
                        that.chapter = chapterId;
                        that.chapterIndex = chapterIndex;
                        console.log('Chapter Saved in Service Index: ' + chapterIndex);
                    },
                    'setTopic': function (topicId, topicIndex) {
                        that.topic = topicId;
                        that.topicIndex = topicIndex;
                        console.log('Topic Saved in Service Index: ' + topicIndex)
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
                    }
                }
            })
})();

/*

 */