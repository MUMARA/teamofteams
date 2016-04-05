/**
 * on 2/02/2016.
 */
(function() {
    'use strict';
    angular.module('app.chat', ['core']).controller('ChatController', ['messageService', 'groupService', 'chatService', 'userService', '$mdBottomSheet', '$mdDialog', '$stateParams', '$state', ChatController]);

    function ChatController(messageService, groupService, chatService, userService, $mdBottomSheet, $mdDialog, $stateParams, $state) {
        var that = this;
        var user = userService.getCurrentUser();
        this.setFocus = function() {
            document.getElementById("#UserSearch").focus();
        };
        this.returnMoment = function (timestamp) {
            if (timestamp) {
                return moment().to(timestamp);
            } else {
                return ''
            }
        }
        this.showNewChannel = function(ev) {
            if (that.subgroupID) {
                $state.go('user.create-teams-channels', {groupID: that.groupID, teamID: that.subgroupID});
            } else {
                $state.go('user.create-channels', {groupID: that.groupID});
            }
        };
        this.gotoChannel = function(channel){
            if (that.subgroupID) {
                $state.go('user.group.subgroup-chat', {channelID : channel.$id, channelTitle: channel.title});
            } else {
                $state.go('user.group.chat', {channelID : channel.$id, channelTitle: channel.title});
            }
        };
        this.viewChannelMessages = function(channelID) {
            if (that.subgroupID) {
                that.messagesArray = chatService.getTeamChannelMessagesArray(that.groupID, that.subgroupID, channelID);
            } else {
                that.messagesArray = chatService.getChannelMessagesArray(that.groupID, channelID);
            }
        };
        this.ScrollToMessage = function() {
            var element = document.getElementById('messagebox');
            element.scrollTop = element.scrollHeight - element.clientHeight;
        };
        this.SendMsg = function() {
            if (that.subgroupID) {
                chatService.TeamSendMessages(that.groupID, that.subgroupID, that.activeChannelID, user, that.text).then(function() {
                    that.text.msg = "";
                    that.ScrollToMessage();
                }, function(reason) {
                    messageService.showFailure(reason);
                });
            } else {
                chatService.SendMessages(that.groupID, that.activeChannelID, user, that.text).then(function() {
                    that.text.msg = "";
                    that.ScrollToMessage();
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
        this.showChannelBottomSheet = function(){
            that.channelBottomSheet = true;
        };
        this.createChannel = function () {
            if (that.subgroupID) {
                chatService.checkSubGroupChannelExists(that.groupID, that.subgroupID, that.channelTitle).then(function(exists){
                    if(exists){
                        onSuccessErrorChannelCreation('Channel already exists with the Name: ' + that.channelTitle);
                    } else {
                        chatService.createSubGroupChannel(that.groupID, that.subgroupID, that.channelTitle, user.userID, onSuccessErrorChannelCreation);
                    }
                });
            } else {
                chatService.checkGroupChannelExists(that.groupID, that.channelTitle).then(function(exists){
                    if(exists){
                        onSuccessErrorChannelCreation('Channel already exists with the Name: ' + that.channelTitle);
                    } else {
                        chatService.createGroupChannel(that.groupID, that.channelTitle, user.userID, onSuccessErrorChannelCreation);
                    }
                });
            }
        };
        function onSuccessErrorChannelCreation(err){
            if (err) {
                messageService.showFailure(err);
            } else {
                messageService.showSuccess('Channel created Successfullly!');
            }
            that.channelTitle = null;
            that.channelBottomSheet = false;
        }
        function init(){
            groupService.setActivePanel('chat');
            that.groupID = $stateParams.groupID;
            that.subgroupID = $stateParams.subgroupID;
            if (that.subgroupID) {
                chatService.getSubGroupChannel(that.groupID, that.subgroupID).$loaded().then(function(snapshot){
                    that.channels = snapshot;
                    if(snapshot.length > 0) {
                        that.gotoChannel(snapshot[0])
                    }
                });
            } else {
                chatService.getGroupChannel(that.groupID).$loaded().then(function(snapshot){
                    that.channels = snapshot;
                    if(snapshot.length > 0) {
                        that.gotoChannel(snapshot[0])
                    }
                });
            }
            that.activeTitle = 'Select Channel to Start Chat';
            that.activeChannelID = null;
            that.activeTeamChannelID = null;
            that.messagesArray = [];
            that.profilesCacheObj = {};
            that.text = { msg: "" };
            that.channelBottomSheet = false;
            that.channelTitle = null;
            that.activeChannelID = $stateParams.channelID;
            that.activeTitle = $stateParams.channelTitle;
            if (that.activeChannelID) {
                that.viewChannelMessages(that.activeChannelID);
            }
            that.ScrollToMessage();
        }
        init();

    } // ChatController
})();
