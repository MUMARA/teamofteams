/**
 * Created by sj on 7/15/2015.
 */





(function() {
        'use strict';
        angular
            .module('app.createTeamsChannels')
            .controller('CreateTeamsChannelsController', ['messageService', 'chatService', "$stateParams", '$http', '$rootScope', '$firebaseObject', '$location', 'createGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', 'appConfig', '$q', CreateTeamsChannelsController]);

        function CreateTeamsChannelsController(messageService, chatService, $stateParams, $http, $rootScope, $firebaseObject, $location, createGroupService, userService, authService, $timeout, utilService, $mdDialog, appConfig, $q) {



            // console.log('team channels controller')

            var $scope = this;
            $scope.groupID = $stateParams.groupID;
            $scope.teamID = $stateParams.teamID;
            var user = userService.getCurrentUser();
            $scope.hide = hide;
            $scope.channel = {
                channelID: "",
                title: ""
            };

            // for creating channels
            function hide() {
                /*   createGroupService.cancelGroupCreation();*/
                /* $mdDialog.cancel();*/
                //$rootScope.newImg=null;
                $location.path('/user/group/' + $scope.groupID);

            }
            $scope.createChannel = function(groupForm) {

                $scope.abc = true;
                //return if form has invalid model.
                if (groupForm.$invalid) {
                    return;
                }
                // groupForm.channelID = groupForm.channelID.toLowerCase();
                //groupForm.channelID = groupForm.channelID.replace(/[^a-z0-9]/g, '');
                chatService.CreateTeamChannel($scope.groupID, $scope.channel, $scope.teamID, user)
                    .then(function() {
                        // console.log("channel Creation Successful");
                        $location.path('/user/group/' + $scope.groupID);
                        messageService.showSuccess("channel creation Successful");
                    }, function(reason) {
                        messageService.showFailure(reason);
                    })

            };

        }

    }

)();
