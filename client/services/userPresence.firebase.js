/**
 * Created by Shahzad on 5/15/2015.
 */

/*
 * dependency:
 * init: after successful login, call setUserPresence()
 * */
(function() {
    "use strict";

    angular
        .module('core')
        .service('userPresenceService', userPresenceService);

    userPresenceService.$inject = ['$firebaseObject', '$timeout'];

    function userPresenceService($firebaseObject, $timeout) {

        var refs = {};

        //initialize code

        //exports list
        return {
            init: init,
            syncUserPresence: syncUserPresence,
            getUserSyncObject: getUserSyncObject
        };

        //to set references for firebase nodes, avoid injecting firebase service to avoid circular dependency
        function init(refsObj) {
            refs.main = refsObj.main;
            refs.users = refsObj.users;

            refs.fireConnection = refsObj.main.child('.info/connected');
            refs.usersPresence = refsObj.main.child('users-presence');
        }

        //to set user presence
        function syncUserPresence(userID) {
            //for run once
            var i = 0;
            refs.fireConnection.on('value', function(snapshot) {

                if (snapshot.val() && i === 0) {
                    var userPresenceRef = refs.usersPresence.child(userID);

                    //get an entry for the current connection.
                    var currentConnRef = userPresenceRef.child('connections').push();

                    // when user disconnect, remove the connection. ( we should run .remove() before .set(), to avoid ghost entries. )
                    currentConnRef.onDisconnect().remove(
                        //@for debugging purpose for mahmood bhai
                        //    function(err){
                        //    if ( err ) {
                        //        console.info('remove error', err);
                        //    }
                        //}
                    );

                    //var x = userPresenceRef.child('last-modified');

                    // setting up details about current connection
                    currentConnRef.set({
                            type: 3, // 1 = mobile, 2 = tablet, 3 = web, 4 = watch , 5 = hololens
                            started: Firebase.ServerValue.TIMESTAMP,
                            //'last-modified': 'assasa'

                        } //@for debugging purpose for mahmood bhai
                        //    function( err ) {
                        //    if ( err ) {
                        //        console.info('push error', err);
                        //    }
                        //}
                    );

                    // when user disconnect, update the last time user was connected
                    userPresenceRef.child('last-modified').onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

                    i++; //for run once (increment)
                } 
            });
        }

        //to get user sync object that contains profile, and availability object.
        function getUserSyncObject(userID) {
            var userSyncObject, userRef, userPresenceRef;

            userSyncObject = {};

            // get user profile
            userRef = refs.users.child(userID);
            userSyncObject.profile = $firebaseObject(userRef);

            //get user presence
            userPresenceRef = refs.usersPresence.child(userID);
            userPresenceRef.on('value', getUserPresenceObj);

            //method to destroy user presence syncObjects
            userSyncObject.off = function() {
                userPresenceRef.off('value', getUserPresenceObj);
            };

            //handler for user presence.
            function getUserPresenceObj(snapshot) {
                var userPresenceObj, recentConnection;
                userPresenceObj = snapshot.val() || {}; //A FIX for inconsistent data in Attendance System.

                $timeout(function() {
                    userSyncObject.availability = {};

                    userSyncObject.availability.lastSeen = userPresenceObj['last-modified'];

                    if (!userPresenceObj.connections) { //if no connections
                        userSyncObject.availability.status = "Offline";
                    } else {
                        switch (userPresenceObj['defined-status']) { // 0 = offline, 1 = online, 2 = away, 3 = busy.
                            case 1:
                                userSyncObject.availability.status = 'Online';
                                break;
                            case 2:
                                userSyncObject.availability.status = 'Away';
                                break;
                            case 3:
                                userSyncObject.availability.status = 'Busy';
                                break;
                            default:
                                userSyncObject.availability.status = 'Online'; //A FIX for inconsistent data in Attendance System.
                        }

                        //find the most recent connection to show the type of device from which the user is connected
                        recentConnection = Object.keys(userPresenceObj.connections);
                        recentConnection = recentConnection[recentConnection.length - 1];

                        switch (userPresenceObj.connections[recentConnection].type) { // 1 = mobile, 2 = tablet, 3 = web, 4 = iWatch , 5 = hololens
                            case 1:
                                userSyncObject.availability.device = 'Mobile';
                                break;
                            case 2:
                                userSyncObject.availability.device = 'Tablet';
                                break;
                            case 3:
                                userSyncObject.availability.device = 'Web';
                                break;
                            case 4:
                                userSyncObject.availability.device = 'iWatch';
                                break;
                            case 5:
                                userSyncObject.availability.device = 'HoloLens';
                                break;
                            default:
                                userSyncObject.availability.device = 'Unknown';
                        }
                    }
                });
            }

            return userSyncObject;
        }
    }

})();
