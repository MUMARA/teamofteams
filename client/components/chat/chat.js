/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.chat', ['core']).controller('ChatController', ['messageService', 'groupService', 'chatService', 'userService', '$mdDialog', '$stateParams', '$state', ChatController]);

    function ChatController(messageService, groupService, chatService, userService, $mdDialog, $stateParams, $state) {
        var that = this;
        var user = userService.getCurrentUser();
        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        };
        this.showNewChannel = function(ev) {
            if (that.subgroupID) {
                $state.go('user.create-teams-channels', {groupID: that.groupID, teamID: that.subgroupID});
            } else {
                $state.go('user.create-channels', {groupID: that.groupID});
            }
        };
        this.viewChannelMessages = function(channel) {
            that.activeChannelID = channel.$id;
            that.activeTitle = channel.title;
            if (that.subgroupID) {
                that.messagesArray = chatService.getTeamChannelMessagesArray(that.groupID, that.subgroupID, channel.$id);
            } else {
                that.messagesArray = chatService.getChannelMessagesArray(that.groupID, channel.$id);
            }
        };
        this.SendMsg = function() {
            if (that.subgroupID) {
                chatService.TeamSendMessages(that.groupID, that.subgroupID, that.activeChannelID, user, that.text).then(function() {
                    that.text.msg = "";
                }, function(reason) {
                    messageService.showFailure(reason);
                });
            } else {
                chatService.SendMessages(that.groupID, that.activeChannelID, user, that.text).then(function() {
                    that.text.msg = "";
                }, function(reason) {
                    messageService.showFailure(reason);
                });
            }

        };
        this.filterchatters = function(chatterID) {
            var sender = false;
            if (chatterID === user.userID) {
                sender = true;
            }
            return sender;
        };
        this.getUserProfile = function(userID) {
            var profileObj;
            if (that.profilesCacheObj[userID]) {
                profileObj = that.profilesCacheObj[userID];
            } else {
                profileObj = that.profilesCacheObj[userID] = chatService.getUserEmails(userID);
            }
            return profileObj;
        };
        function init(){
            groupService.setActivePanel('chat');
            groupService.setSubgroupIDPanel($stateParams.subgroupID)
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            if (that.subgroupID) {
                that.channels = chatService.geTeamChannelsSyncArray(that.groupID, that.subgroupID);
            } else {
                that.channels = chatService.getGroupChannelsSyncArray(that.groupID);
            }
            that.activeTitle = 'Select Channel to Start Chat';
            that.activeChannelID = null;
            that.activeTeamChannelID = null;
            that.messagesArray = [];
            that.profilesCacheObj = {};
            that.text = { msg: "" };
        }
        init();

    } // ChatController
})();
