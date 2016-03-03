/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.report', ['core']).controller('ReportController', ['firebaseService', 'groupService', 'dataService', 'userService', '$stateParams', ReportController]);

    function ReportController(firebaseService, groupService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        };
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return ''
            }
        };
        this.showReportData = function (user) {
            this.report = [];
            that.showParams = false;
            this.count = -1;
            that.reportParam = {
                fullName: user.fullName,
                groupsubgroupTitle: user.groupsubgroupTitle,
            };
            firebaseService.getRefsubgroupCheckinRecords().child(user.groupID).child(user.subgroupID).child(user.id).on('child_added', function(snapshot){
                var fullDate = new Date(snapshot.val().timestamp);
                var newDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
                if (snapshot.val().message == 'Checked-in') {
                    that.report.push({
                        checkin: snapshot.val().timestamp,
                        checkindate: newDate
                    });
                    that.count++;
                } else if (snapshot.val().message == 'Checked-out') {
                    that.report[that.count].checkout = snapshot.val().timestamp;
                    that.report[that.count].checkoutdate = newDate;
                }
            });
        };
        function init(){
            groupService.setActivePanel('report');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.showParams = true;
            that.report = [];
            that.reportParam = {};
            that.users = dataService.getUserData();         //load users
        }
        init();

    } //ReportController
})();
