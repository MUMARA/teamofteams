/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport').controller('ProgressReportController', ['messageService', '$timeout', 'groupService', 'ProgressReportService', 'dataService', 'userService', '$stateParams', ProgressReportController]);
    
    function ProgressReportController(messageService, $timeout, groupService, ProgressReportService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }
        this.update = function(report){
        	// console.log(report);
        	ProgressReportService.updateReport(report, function(result) {
                if(result){
                    messageService.showSuccess('Update Successfully!');    
                } else {
                    messageService.showFailure('Update Failure!');
                }
            });
        }
        function init(){
            groupService.setActivePanel('progressreport');
            groupService.setSubgroupIDPanel($stateParams.subgroupID)
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.user = userService.getCurrentUser();
            that.users = dataService.getUserData();
            that.activeUser = ($stateParams.u) ? that.user.userID : '';
            that.activeTitle = "Daily Progress Report";


            if($stateParams.subgroupID){
                //sub group report
                $timeout(function(){
                    that.dailyProgressReport = ProgressReportService.getSubGroupDailyProgressReport(that.users, that.groupID, that.subgroupID);
                    $timeout(function(){
                        that.questions = (that.dailyProgressReport.length > 0) ? JSON.parse(that.dailyProgressReport[0].questions) : null;
                    }, 500);
                }, 2000);
            } else {
                //group report
                $timeout(function(){
                    that.dailyProgressReport = ProgressReportService.getGroupDailyProgressReport(that.users, that.groupID);    
                }, 2000)
            }
            
        }        
        init();

    } // ProgressReportController
})();
