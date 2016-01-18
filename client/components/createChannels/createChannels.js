/**
 * Created by sj on 7/7/2015.
 */
(function() {
    'use strict';

    angular.module('app.createChannels', ['core'])
        .controller('createChannelsController', ["chatService"

            ,
            function(chatService) {

                var $scope = this;

                // for creating channels
                $scope.createChannel = function(ev) {
                    $mdDialog.show({
                            controller: 'DialogCreateChannalCtrl',
                            templateUrl: 'chat/views/dialogCreateChannel.html',
                            targetEvent: ev
                        })
                        .then(function(channelInfo) {
                            channelInfo.channelID = channelInfo.channelID.toLowerCase();
                            channelInfo.channelID = channelInfo.channelID.replace(/[^a-z0-9]/g, '');
                            chatService.asyncCreateChannel($scope.groupID, channelInfo, $loggedInUserID)
                                .then(function() {
                                    // console.log("channel Creation Successful");
                                    messageService.showSuccess("channel creation Successful");
                                }, function(reason) {
                                    messageService.showFailure(reason);
                                })
                        }, function() {
                            // console.log("channel Creation Cancelled");
                            messageService.showFailure("channel Creation Cancelled");
                        });
                };

            }
        ]);

})();
