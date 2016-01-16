/**
 * Created by sj on 6/6/2015.
 */
(function() {
    'use strict';
    angular
        .module('core')
        .factory('chatService', chatService);

    chatService.$inject = ['$q', 'firebaseService', '$firebaseObject'];

    function chatService($q, firebaseService, $firebaseObject) {

        // private variables
        var refs, fireTimeStamp;

        //firebase unix-epoch time
        fireTimeStamp = Firebase.ServerValue.TIMESTAMP;
        // main firebase reference
        refs = {
            main: firebaseService.getRefMain()
        };
        // group chat reference
        refs.refGroupChats = refs.main.child('group-chats');
        refs.refTeamChats = refs.main.child('subgroup-chats')

        return {
            // creating channel
            asyncCreateChannel: function(groupID, channelObj, user) {
                var self = this;
                var deferred = $q.defer();

                //Step 1: see if it already exists - check if channelID exists
                self.asyncCheckIfChannelExists(groupID, channelObj.channelID).then(function(response) {
                    if (response.exists) {
                        return deferred.reject('Channel creation failed. ' + channelObj.channelID + 'already exists.');
                    } else {

                        //Step 2: Add to channel
                        var channelRef = refs.refGroupChats.child(groupID).child(channelObj.channelID)
                            .set({
                                title: channelObj.title,
                                timestamp: fireTimeStamp,
                                "created-by": user.userID//,
                                // messages: {}

                            }, function(error) {
                                if (error) {
                                    deferred.reject("error occurred in creating channel====");
                                } else {
                                    //step 3: add to messages
                                    // var chatRef = refs.refGroupChats.child(groupID).child(channelObj.channelID).child("messages")
                                        // .push({

                                            // from: user.userID,
                                            // timestamp: fireTimeStamp,
                                            // text: "Welcome to " + channelObj.title + " Group"


                                        // }, function(error) {
                                            if (error) {
                                                deferred.reject("error occurred in creating channel");
                                            } else {

                                                //step4 - create an activity for "channel-created" verb.
                                                self.asyncRecordChannelCreationActivity(channelObj, user, groupID).then(

                                                    deferred.resolve("channel created successfully and also pushed activity.")
                                                )
                                            }


                                        // });
                                }
                            });

                    }



                });

                return deferred.promise;
            },
            // sending msgs
            SendMessages: function(groupID, channelID, user, text) {

                var deferred = $q.defer();
                var msgRef = refs.refGroupChats.child(groupID + '/' + channelID + '/messages').push({

                    from: user.userID,
                    timestamp: fireTimeStamp,
                    text: text.msg


                }, function(error) {
                    if (error) {
                        deferred.reject("error occurred in sending msg");
                    } else {
                        deferred.resolve("msg sucessfully sent")
                    }


                });



                return deferred.promise;

            },
            // checking if channel exists
            asyncCheckIfChannelExists: function(groupID, channelID) {
                var deferred = $q.defer();

                refs.refGroupChats.child(groupID + '/' + channelID).once('value', function(snapshot) {
                    var exists = (snapshot.val() !== null);
                    deferred.resolve({
                        exists: exists,
                        channel: snapshot.val()
                    });
                });

                return deferred.promise;
            },
            // getting channel Array
            getGroupChannelsSyncArray: function(groupID) {
                return Firebase.getAsArray(refs.refGroupChats.child(groupID));
            },
            //getting channels msg array
            getChannelMessagesArray: function(groupID, channelID) {

            var ref = refs.refGroupChats.child(groupID + '/' + channelID + '/messages');
                return Firebase.getAsArray(ref);
            },
            // creating channel Activity
            asyncRecordChannelCreationActivity: function(channel, user, group) {
                var deferred = $q.defer();
                var ref = firebaseService.getRefGroupsActivityStreams().child(group);
                var actor = {
                    "type": "user",
                    "id": user.userID, //this is the userID, and an index should be set on this
                    "email": user.email,
                    "displayName": user.firstName + " " + user.lastName
                };

                var target = {
                    type: "group",
                    id: group
                        //url:"",
                        //displayName:""
                }

                var object = {
                    "type": "channel",
                    "id": channel.channelID, //an index should be set on this
                    //"url": group.groupID,
                    "displayName": channel.title
                };


                var activity = {
                    language: "en",
                    verb: "group-channel-creation",
                    published: fireTimeStamp,
                    displayName: actor.displayName + " created " + channel.title + "channel in " + target.id + " group.",
                    actor: actor,
                    object: object,
                    target: target
                };

                var newActivityRef = ref.push();
                newActivityRef.set(activity, function(error) {
                    if (error) {
                        deferred.reject();
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = ref.child(activityID);
                        activityEntryRef.once("value", function(snapshot) {
                            var timestamp = snapshot.val().published;
                            newActivityRef.setPriority(0 - timestamp, function(error2) {
                                if (error2) {
                                    deferred.reject();
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });


                    }
                });

                return deferred.promise;
            },
            // getting user emails object
            getUserEmails: function(userID) {
                // var deferred = $q.defer();
                return $firebaseObject(refs.main.child("users").child(userID));
                // deferred.resolve(EmailSyncObj);



            },


            //  SUB TEAMs SERVICESSSSSSSS

            //    creating team channels

            CreateTeamChannel: function(groupID, channelObj, TeamID, user) {
                var self = this;
                var deferred = $q.defer();

                /*      //Step 1: see if it already exists - check if channelID exists
                self.asyncCheckIfChannelExists(groupID, channelObj.channelID).then(function(response){
                    if( response.exists ){
                        return deferred.reject('Channel creation failed. ' + channelObj.channelID + 'already exists.');
                    }
                    else{
*/
                //Step 2: Add to channel
                var channelRef = refs.refTeamChats.child(groupID).child(TeamID).child(channelObj.channelID)
                    .set({
                        title: channelObj.title,
                        timestamp: fireTimeStamp,
                        "created-by": user.userID,
                        messages: {}

                    }, function(error) {
                        if (error) {
                            deferred.reject("error occurred in creating channel");
                        } else {
                            //step 3: add to messages
                            var chatRef = refs.refTeamChats.child(groupID).child(TeamID).child(channelObj.channelID).child("messages")
                                .push({

                                    from: user.userID,
                                    timestamp: fireTimeStamp,
                                    text: "Welcome to " + channelObj.title + " Group"


                                }, function(error) {
                                    if (error) {
                                        deferred.reject("error occurred in creating channel");
                                    } else {
                                        deferred.resolve("channel created successfully and also pushed activity.")
                                            /*//step4 - create an activity for "channel-created" verb.
                                            self.asyncRecordChannelCreationActivity(channelObj,user,groupID ).then(
                                                deferred.resolve("channel created successfully and also pushed activity.")
                                            )*/
                                    }


                                });








                        }
                    });

                //}



                // });

                return deferred.promise;
            },
            geTeamChannelsSyncArray: function(groupID, TeamID) {
                return Firebase.getAsArray(refs.refTeamChats.child(groupID).child(TeamID));
            },
            getTeamChannelMessagesArray: function(groupID, teamID, channelID) {

                var ref = refs.refTeamChats.child(groupID + '/' + teamID + '/' + channelID + '/messages');
                return Firebase.getAsArray(ref);
            },

            TeamSendMessages: function(groupID, teamID, channelID, user, text) {

                var deferred = $q.defer();
                var msgRef = refs.refTeamChats.child(groupID + '/' + teamID + '/' + channelID + '/messages').push({

                    from: user.userID,
                    timestamp: fireTimeStamp,
                    text: text.msg


                }, function(error) {
                    if (error) {
                        deferred.reject("error occurred in sending msg");
                    } else {
                        deferred.resolve("msg sucessfully sent")
                    }


                });



                return deferred.promise;

            }
        }
    }
})();
