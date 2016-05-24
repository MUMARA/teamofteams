/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.progressreport').controller('ProgressReportController', ['firebaseService', '$state', 'messageService', '$timeout', 'groupService', 'ProgressReportService', 'dataService', 'userService', '$stateParams', ProgressReportController]);

    function ProgressReportController(firebaseService, $state, messageService, $timeout, groupService, ProgressReportService, dataService, userService, $stateParams) {
        var that = this;
        this.loadingData = false;
        this.setFocus = function(startDate , endDate) {
            that.loadingData = true;
             if(startDate && endDate) {
                 $timeout(function() {
                     that.dailyProgressReport = ProgressReportService.getGroupReportByDates(that.users, that.groupID, that.startDate ,that.endDate);
                     // that.showReportData();
                     that.loadingData = false;
                 	// console.log(that.startDate.setHours(0,0,0,0) , that.endDate.setHours(23,59,59,0));
                 }, 2000);
             }else{
                 document.getElementById("#UserSearch").focus();
                 that.loadingData = false;
             }

        };
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return '';
            }
        };
        this.returnGroupTitle = function(groupID) {
            firebaseService.getRefGroupsNames().child(groupID).child('title').once('value', function(snapshot) {
                that.grouptitle = snapshot.val();
            });
        };
        this.returnSubGroupTitle = function(groupID, subgroupID) {
            if (subgroupID) {
                firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).child('title').once('value', function(snapshot) {
                    that.subgrouptitle = snapshot.val();
                });
            } else {
                that.subgrouptitle = '';
            }
        };
        this.updatecheckinhours = function(value) {
            that.checkinHours = value;
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
        this.everyone = function(){
            that.activeUser = '';
        };
        this.showReportData = function () {
            that.attendancereport = [];
            that.count = -1;
            that.checkinHours = 0;
            // that.reportParam = {
            //     fullName: user.fullName,
            //     groupsubgroupTitle: user.groupsubgroupTitle,
            // };
            firebaseService.getRefsubgroupCheckinRecords()
                .child(that.groupID)
                .child(that.subgroupID)
                .child(that.activeUser)
                .orderByChild('timestamp')
                .startAt(new Date().setHours(0,0,0,0))
                .endAt(new Date().setHours(23,59,59,0))
                .on('child_added', function(snapshot){
                    var fullDate = new Date(snapshot.val().timestamp);
                    var newDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
                    if (snapshot.val().message == 'Checked-in') {
                        that.attendancereport.push({
                            checkin: snapshot.val().timestamp,
                            checkindate: newDate,
                            location: snapshot.val()['identified-location-id'],
                            checkout: 0
                        });
                        that.count++;
                    } else if (snapshot.val().message == 'Checked-out') {
                        that.attendancereport[that.count].checkout = snapshot.val().timestamp;
                        that.attendancereport[that.count].checkoutdate = newDate;
                        that.attendancereport[that.count].checkoutlocation = snapshot.val()['identified-location-id'];
                    }
            });
        }
        function init() {
            groupService.setActivePanel('progressreport');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID || '';
            that.returnGroupTitle(that.groupID);
            that.returnSubGroupTitle(that.groupID, that.subgroupID);
            that.user = userService.getCurrentUser();
            that.users = dataService.getUserData();
            //that.activeUser = ($stateParams.u) ? that.user.userID : '';
            that.activeUser = that.user.userID;
            that.activeTitle = "Progress Report";

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
                        that.showReportData();
                         // $timeout(function() {
                         //     console.log('xxxx',that.dailyProgressReport);
                         // }, 5000);
                    }, 2000);
                } else {
                    that.dailyProgressReport = true;
                    //group report
                    // $timeout(function() {
                    //     that.dailyProgressReport = ProgressReportService.getGroupDailyProgressReport(that.users, that.groupID);
                    //     that.activeUser = '';
                    // }, 2000);
                }

            }



        }
        init();

    } // ProgressReportController
})();
