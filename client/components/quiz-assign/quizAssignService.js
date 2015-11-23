/**
 * Created by Adnan Irfan on 06-Jul-15.
 */
(function () {
    'use strict';

    angular
        .module('app.quizAssign', ['firebase','app.quiz'])
        .factory('quizAssignService', quizAssignService);

    function quizAssignService(){

        var that = this;
        that.SelectedQuiz = null;
        that.SelectedGroup = null;

        return {
            'quiz': function () {

            }

            /*'getSelectedQuiz': function () {
             return that.SelectedQuiz;
             },

             'setSelectedQuiz': function (index) {
             that.SelectedQuiz = index;
             },*/

            /*'getSelectedGroup': function () {
             return that.SelectedGroup;
             },*/
            /*'setSelectedSubgroup': function (index) {
             that.SelectedSubgroup = index;
             },*/
        }



    }
})()