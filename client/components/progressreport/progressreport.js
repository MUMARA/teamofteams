/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport').controller('ProgressReportController', ['ProgressReportService', 'dataService', 'userService', '$stateParams', ProgressReportController]);
    
    function ProgressReportController(ProgressReportService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }
        this.update = function(report){
        	// console.log(report);
        	ProgressReportService.updateReport(report);
        }
        function init(){
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.user = userService.getCurrentUser();
            that.users = dataService.getUserData();
            that.dailyProgressReport = ProgressReportService.getDailyReport(that.users, that.groupID, that.subgroupID);
        }        
        init();

    } // ProgressReportController
})();
