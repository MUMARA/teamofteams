/**
 * Created by Shahzad on 3/12/2015.
 */

(function() {
    'use strict';

    /*requires modules*/
    var gcm = require('node-gcm'),
        Q = require('q'),
        util = require('./../helpers/util'),
        firebaseCtrl = require('./firebaseCtrl'),
        User = require('mongoose').model('User'),
        credentials = require("../../config/credentials.js");

    /*private variables*/
    var sender;

    /*initialize stuff*/
    sender = new gcm.Sender(credentials.pushNotifications.gcm.SERVER_KEY);

    /*exported functions*/
    exports.sendNotification = sendNotification;
    exports.registerDevice = registerDevice;
    exports.unregisterDevice = unregisterDevice;

    //to confirm an account email address.
    function sendNotification(req, res) {
        var payload, isPayloadInvalid;

        payload = req.body;

        //check if userID, token, groupID, title, message, is missing or is of invalid type
        isPayloadInvalid = util.isMissingStrings(res, payload, ['userID', 'token', 'groupID', 'title', 'message']);
        if (isPayloadInvalid) {
            return;
        }

        //get groups members list or check if group exists
        firebaseCtrl.asyncGetGroupMembersList(payload.groupID)
            .then(function(data) {
                var promises, promise,
                    groupMembersAndroidDevices;

                groupMembersAndroidDevices = [];
                promises = [];

                for (var i = 0, len = data.membersArray.length; i < len; i++) {
                    promise = asyncGetUserAndroidDevices(data.membersArray[i], groupMembersAndroidDevices);
                    promises.push(promise);
                }

                Q.all(promises)
                    .then(function() {
                        //publish notifications
                        asyncPublishAndroidNotification(payload, groupMembersAndroidDevices)
                            .then(function() {
                                res.send({
                                    statusCode: 1,
                                    statusDesc: 'notification published to all members of the group.'
                                });
                            }, function(reason) {
                                res.send({
                                    statusCode: 0,
                                    statusDesc: reason
                                });
                            });
                    });

            }, function(reason) {
                res.send({
                    statusCode: 0,
                    statusDesc: reason
                });
            });
    }

    //to register user's device for push notifications.
    function registerDevice(req, res) {
        var payload, isPayloadInvalid;

        payload = req.body;

        //check if userID, token is missing or contains an invalid value
        isPayloadInvalid = util.isMissingStrings(res, payload, ['userID', 'token']);
        if (isPayloadInvalid) {
            return;
        }

        //check if device exists in payload as an object
        if (typeof payload.devices !== 'object') {
            res.send({
                statusCode: 0,
                statusDesc: "device property is not an object."
            });

            return;
        }

        //find user with userID
        User.findOne({
            userID: payload.userID,
            token: payload.token
        }, function(err, user) {
            if (err) {
                res.send({
                    statusCode: 0,
                    statusDesc: "error occurred."
                });

            } else if (user) {

                //HACK - only new users has devices object in database.
                user.devices = user.devices || {
                    android: [],
                    iphone: [],
                    windowsPhone: []
                };

                //to register an android device
                if (typeof payload.devices.android === 'string') {

                    addUserDevice('android', payload.devices.android, user, res);

                } else if (typeof payload.devices.iphone === 'string') {

                    addUserDevice('iphone', payload.devices.iphone, user, res);

                } else if (typeof payload.devices.windowsPhone === 'string') {

                    addUserDevice('windowsPhone', payload.devices.windowsPhone, user, res);

                } else {
                    res.send({
                        statusCode: 0,
                        statusDesc: "missing or invalid device."
                    });
                }
            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "invalid credentials."
                });
            }
        });
    }

    //to remove user's any previously registered device for push notifications.
    function unregisterDevice(req, res) {
        var payload, isPayloadInvalid;

        payload = req.body;

        //check if userID, token is missing or contains an invalid value
        isPayloadInvalid = util.isMissingStrings(res, payload, ['userID', 'token']);
        if (isPayloadInvalid) {
            return;
        }

        //check if device exists in payload as an object
        if (typeof payload.devices !== 'object') {
            res.send({
                statusCode: 0,
                statusDesc: "device property is not an object."
            });

            return;
        }

        //find user with userID
        User.findOne({
            userID: payload.userID,
            token: payload.token
        }, function(err, user) {
            if (err) {
                res.send({
                    statusCode: 0,
                    statusDesc: "error occurred."
                });

            } else if (user) {

                //HACK - only new users has devices object in database.
                user.devices = user.devices || {
                    android: [],
                    iphone: [],
                    windowsPhone: []
                };

                //to register an android device
                if (typeof payload.devices.android === 'string') {

                    removeUserDevice('android', payload.devices.android, user, res);

                } else if (typeof payload.devices.iphone === 'string') {

                    removeUserDevice('iphone', payload.devices.iphone, user, res);

                } else if (typeof payload.devices.windowsPhone === 'string') {

                    removeUserDevice('windowsPhone', payload.devices.windowsPhone, user, res);

                } else {
                    res.send({
                        statusCode: 0,
                        statusDesc: "missing or invalid device."
                    });
                }
            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "invalid credentials."
                });
            }
        });
    }

    //to get user's registered android devices in database.
    function asyncGetUserAndroidDevices(userID, groupMembersAndroidDevices) {
        var defer = Q.defer();

        //find user data from DB
        User.findOne({
            userID: userID
        }, function(err, user) {
            if (err) {
                //handle this case
            } else if (user) {
                var userAndroidDevices = user.devices ? user.devices.android : [];

                //push registered devices to usersAndroidDevices array.
                for (var i = 0, len = userAndroidDevices.length; i < len; i++) {
                    groupMembersAndroidDevices.push(userAndroidDevices[i]);
                }
            } else {
                //handle this case
            }

            defer.resolve();
        });

        return defer.promise;
    }

    //to publish notification to given GCM registered devices.
    function asyncPublishAndroidNotification(payload, regIDs) {
        var message, defer;

        //TODO: split regIDs array into batches by 1000 regIDs.
        // GCM sends push notification to only 1000 regIDs at a time.
        //https://github.com/ToothlessGear/node-gcm/issues/42
        //http://developer.android.com/training/cloudsync/gcm.html
        regIDs = regIDs.slice(0, 1000);

        defer = Q.defer();

        //creating message object for gcm push notification
        message = new gcm.Message({
            data: {
                title: payload.title,
                message: payload.message
            }
        });

        //sending request to GCM server for push notifications
        sender.send(message, regIDs, function(err, result) {
            if (err) {
                console.error('push notification:error', err);
                defer.reject('error occurred while publishing notifications.');
            } else if (result.success > 0) {
                console.log('push notification:success', result);
                defer.resolve();
            } else {
                defer.reject('could not find any recipient to publish notification.');
            }
        });

        return defer.promise;
    }

    //to add new device in user model. device can be android, iphone or windowsPhone.
    function addUserDevice(deviceType, device, user, res) {

        //check if device is already registered for the current user
        if (user.devices[deviceType].indexOf(device) >= 0) {
            res.send({
                statusCode: 0,
                statusDesc: "device is already registered."
            });

            return;
        }

        //add a new device in the collection
        user.devices[deviceType].push(device);

        //update user model.
        user.save(function(err) {
            if (err) {
                res.send({
                    statusCode: 0,
                    statusDesc: "error occurred in saving model."
                });
            } else {
                res.send({
                    statusCode: 1,
                    statusDesc: "device has been registered successfully."
                });
            }
        });
    }

    //to remove device from user model. device can be android, iphone or windowsPhone.
    function removeUserDevice(deviceType, device, user, res) {

        var deviceIndex = user.devices[deviceType].indexOf(device);

        //check if device exists in the collection
        if (deviceIndex == -1) {
            res.send({
                statusCode: 0,
                statusDesc: "device is not registered or has been already unregistered."
            });

            return;
        }

        //remove device from the collection
        user.devices[deviceType].splice(deviceIndex, 1);

        //update user model.
        user.save(function(err) {
            if (err) {
                res.send({
                    statusCode: 0,
                    statusDesc: "error occurred in saving model."
                });
            } else {
                res.send({
                    statusCode: 1,
                    statusDesc: "device has been unregistered successfully."
                });
            }
        });
    }

})();
