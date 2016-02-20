/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.activity', ['core']).controller('ActivityController', ['groupService', 'dataService', 'userService', '$stateParams', ActivityController]);

    function ActivityController(groupService, dataService, userService, $stateParams) {
        var that = this;

        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        }
        function init(){
            groupService.setActivePanel('activity');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            that.users = dataService.getUserData();         //load users
        }
        init();

    } // ActivityController
})();
