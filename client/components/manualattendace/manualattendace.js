    
/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.manualattendace', ['core']).controller('ManualAttendaceController', ['dataService', 'userService', '$stateParams', ManualAttendaceController]);
    
    function ManualAttendaceController(dataService, userService, $stateParams) {
        var that = this;
        
        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }
        function init(){
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.users = dataService.getUserData();         //load users
        }        
        init();

    } // ActivityController
})();
