/**
 * on 2/02/2016.
 */
(function () {
    'use strict';
    angular.module('app.collaborator')
        .constant("ref", "https://firepad123.firebaseio.com/")
        .controller('CollaboratorController', ['ref', 'FileSaver', 'Blob', collaboratorFunction]);


    function collaboratorFunction(ref, FileSaver, Blob) {

        var that = this;
        that.ready = true;
        that.clicked = false;
        that.export = function () {

            if (that.clicked) {
                that.clicked = false;
            }
            else {
                that.clicked = true;
                var content = firepad.getHtml();
                var data = new Blob([content], {type: 'html;charset=utf-8'});
                FileSaver.saveAs(data, 'data.html');
                console.log(firepad.getHtml())
            }

        };
        var firepadRef = new Firebase(ref).child("firepad");
        var codeMirror = CodeMirror(document.getElementById('firepad'), {lineWrapping: true});
        var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
            richTextShortcuts: true,
            richTextToolbar: true,
            // userId: null,
            defaultText: null
            /*'Welcome to firepad!'*/
        });
        firepad.on("ready", function () {
            that.ready = false;
            //that.$digest();
        })


    }


    /*function CollaboratorController($state, messageService, $timeout, groupService, ProgressReportService, dataService, userService, $stateParams) {
     var that = this;
     console.log("in collaborator controller");
     /!*        // this.setFocus = function() {
     //     document.getElementById("#UserSearch").focus();
     // };
     // this.update = function(report) {
     //     // console.log(report);
     //     ProgressReportService.updateReport(report, function(result) {
     //         if (result) {
     //             messageService.showSuccess('Update Successfully!');
     //             $state.go('user.group.subgroup-collaborator', {groupID: that.groupID, subgroupID: that.subgroupID, u: ''});
     //         } else {
     //             messageService.showFailure('Update Failure!');
     //         }
     //     });
     // };

     function init() {
     groupService.setActivePanel('collaborator');
     groupService.setSubgroupIDPanel($stateParams.subgroupID);
     that.groupID = $stateParams.groupID;
     that.subgroupID = $stateParams.subgroupID;
     that.user = userService.getCurrentUser();
     that.users = dataService.getUserData();
     that.activeUser = ($stateParams.u) ? that.user.userID : '';
     that.activeTitle = "Collaborator";

     if ($stateParams.u) {
     $timeout(function() {
     that.users.forEach(function(val, index){
     if(val.id === that.user.userID && val.groupID == that.groupID &&  val.subgroupID == that.subgroupID){
     that.dailyProgressReport = ProgressReportService.getSingleSubGroupReport(val, that.groupID, that.subgroupID);
     }
     });
     }, 2000);
     } else {
     if ($stateParams.subgroupID) {
     //sub group report
     $timeout(function() {
     that.dailyProgressReport = ProgressReportService.getSubGroupDailyProgressReport(that.users, that.groupID, that.subgroupID);
     // $timeout(function() {
     //     console.log('xxxx',that.dailyProgressReport);
     // }, 5000);
     }, 2000);
     } else {
     //group report
     $timeout(function() {
     // that.dailyProgressReport = ProgressReportService.getGroupDailyProgressReport(that.users, that.groupID);
     }, 2000);
     }

     }



     }
     init();*!/

     } // ProgressReportController*/
})();