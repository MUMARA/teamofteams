
/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.manualattendace', ['core']).controller('ManualAttendaceController', ['groupService', 'checkinService', '$firebaseArray', 'messageService', 'dataService', 'userService', '$stateParams', ManualAttendaceController]);
    
    function ManualAttendaceController(groupService, checkinService, $firebaseArray, messageService, dataService, userService, $stateParams) {
        var that = this;
        var userCurrentCheckinRefBySubgroup;
        var user = userService.getCurrentUser();
        
        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }

        this.CheckInuser = function(grId, sgrId, userID, type) {
            // Do not change status of self login user
            if (user.userID === userID) {
                messageService.showFailure('To change your status, please use toolbar!');
                dataService.setUserCheckInOut(grId, sgrId, userID, type)
                return;
            }
            that.processTeamAttendance = true;

            // check if user is already checked in
            $firebaseArray(checkinService.getRefSubgroupCheckinCurrentByUser().child(userID)).$loaded().then(function(userdata) {
                // console.log(userdata);
                // console.log(userdata[5]);
                // console.log(type)
                if (!type) {
                    // console.log(userdata)
                    if (userdata[5] && userdata[5].$value === 1) {
                        messageService.showFailure('User already checked in at : ' + userdata[0].$value + '/' + userdata[3].$value);
                        that.processTeamAttendance = false;
                        dataService.setUserCheckInOut(grId, sgrId, userID, true)
                        return;
                    }
                }
                // console.log('Note (on switch off condition), Checkin: ', !type, 'Checkout: ', type);
                // check in the user
                var groupObj = {groupId: grId, subgroupId: sgrId, userId: userID};
                checkinService.ChekinUpdateSatatus(groupObj, userID, type, function(result, msg){   //type is checkoutflag
                    if(result){
                        messageService.showSuccess(msg);
                    } else {
                        messageService.showFailure(msg)
                        dataService.setUserCheckInOut(grId, sgrId, userID, false)
                    }
                    that.processTeamAttendance = false;
                });
            });
        }
        function init(){
            groupService.setActivePanel('manualattendace');
            groupService.setSubgroupIDPanel($stateParams.subgroupID)
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.processTeamAttendance = false;
            that.checkinObj = {
                newStatus: {}
            };
            that.users = dataService.getUserData();         //load users
        }
        init();

    } // ActivityController
})();
