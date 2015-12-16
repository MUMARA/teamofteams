(function() {
        'use strict';
        angular
            .module('app.createChannels')
            .controller('CreateChannelsController', ['messageService', 'chatService', "$stateParams", '$http', '$rootScope', 'firebaseService', '$firebaseObject', '$location', 'createGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', 'appConfig', '$q', CreateChannelsController]);

        function CreateChannelsController(messageService, chatService, $stateParams, $http, $rootScope, firebaseService, $firebaseObject, $location, createGroupService, userService, authService, $timeout, utilService, $mdDialog, appConfig, $q) {



            

            var $scope = this;
            $scope.groupID = $stateParams.groupID;
            var $loggedInUserID = firebaseService.getSignedinUserObj();
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
                chatService.asyncCreateChannel($scope.groupID, $scope.channel, $loggedInUserID)
                    .then(function() {

                        console.log("channel Creation Successful");
                        $location.path('/user/group/' + $scope.groupID);
                        messageService.showSuccess("channel creation Successful");
                    }, function(reason) {
                        messageService.showFailure(reason);
                    })

            };

        }

    }

)();
