/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport').controller('ProgressReportController', ['$state', 'messageService', '$timeout', 'groupService', 'ProgressReportService', 'dataService', 'userService', '$stateParams', ProgressReportController]);

    function ProgressReportController($state, messageService, $timeout, groupService, ProgressReportService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        };
        this.update = function(report) {
            // console.log(report);
            ProgressReportService.updateReport(report, function(result) {
                if (result) {
                    messageService.showSuccess('Update Successfully!');
                    $state.go('user.group.subgroup-progressreport', {groupID: that.groupID, subgroupID: that.subgroupID, u: ''});
                } else {
                    messageService.showFailure('Update Failure!');
                }
            });
        };

        function init() {
            groupService.setActivePanel('progressreport');
            groupService.setSubgroupIDPanel($stateParams.subgroupID);
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.user = userService.getCurrentUser();
            that.users = dataService.getUserData();
            that.activeUser = ($stateParams.u) ? that.user.userID : '';
            that.activeTitle = "Daily Progress Report";

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
                        that.dailyProgressReport = ProgressReportService.getGroupDailyProgressReport(that.users, that.groupID);
                    }, 2000);
                }

            }



        }
        init();

    } // ProgressReportController
})();
