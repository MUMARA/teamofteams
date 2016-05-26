"use strict";
var fireHandler_1 = require('./fireHandler');
var credentials_1 = require('../config/credentials');
var webpush = require('web-push-encryption');
webpush.setGCMAPIKey(credentials_1.credentials.pushNotifications.fcm.API_KEY);
var ref = fireHandler_1.myFirebaseRef;
var activeUserCount = 0;
var notificationCount = 0;
var userCount = 0;
// var dataObj = {msg: "First push notification, PWA-TodoApp", title: "Title From Server", tag: "my-taggy", icon: "https://fs02.androidpit.info/a/10/3a/cornie-icons-103aff-w192.png"};
function sendPushNotification(event, context) {
    activeUserCount = 0;
    var token = event.token, userId = event.userId, groupId = event.groupId, subgroupId = event.subgroupId, dataObj = event.dataObj;
    auth(token, context, function () {
        getUsersOfSubGroup(groupId, subgroupId, userId, dataObj, context);
    });
}
exports.sendPushNotification = sendPushNotification;
function auth(token, context, callback) {
    ref.authWithCustomToken(token, function (error, authData) {
        if (error) {
            console.log("FireBase Login Failed!", error);
            context.fail(error);
        }
        else {
            console.log("FireBase Login Succeeded!", authData);
            callback();
        }
    });
}
function getUsersOfSubGroup(groupId, subgroupId, userId, dataObj, context) {
    ref.child('subgroup-members').child(groupId).child(subgroupId).once('value', function (snapshot) {
        var uCount = snapshot.numChildren();
        if (snapshot.val()) {
            for (var uId in snapshot.val()) {
                //checking membership-Type is greater then zero
                if (snapshot.val()[uId]['membership-type'] > 0) {
                    // checking user presence
                    if (userId !== uId) {
                        userCount++;
                        // checkUserPresence(uId, dataObj, context);
                        getUserSubscription(uId, dataObj, context);
                    }
                }
            }
        }
    });
}
// // checking user persence
// function checkUserPresence(userId, dataObj, context) {
//     ref.child('users-presence').child(userId).child('connections').once('value', function (snapshot) {
//         if (snapshot.val()) {
//             activeUserCount++;
//             for (var pushId in snapshot.val()) {
//                 //console.log('device type: ', snapshot.val()[pushId]['type']);
//                 // getting subscription
//                 getUserSubscription(userId, dataObj, context);
//             }
//         }
//     });
// } // checking user persence 
// Get Subcription From Firebase
function getUserSubscription(userId, dataObj, context) {
    ref.child('user-push-notifications').child(userId).once('value', function (snapshot) {
        if (snapshot.val()) {
            for (var os in snapshot.val()) {
                for (var browser in snapshot.val()[os]) {
                    for (var id in snapshot.val()[os][browser]) {
                        var subcription = snapshot.val()[os][browser][id];
                        //Send Push Notification
                        console.log('subs--------', subcription);
                        sendPushMessage(subcription, dataObj, context);
                    }
                }
            }
        }
        else {
            userCount--;
        }
    });
} // Get Subcription From Firebase
// send PushMessage  // dataObj = {msg: "", title: "", tag: "", icon: ""};
function sendPushMessage(subscription, dataObj, context) {
    if (subscription.endpoint.indexOf('https://android.googleapis.com/gcm/send/') === 0) {
        notificationCount++;
        var data = JSON.stringify({
            data: dataObj.msg || "",
            title: dataObj.title || "",
            tag: dataObj.tag || "",
            icon: dataObj.icon || ""
        });
        webpush.sendWebPush(data, subscription).then(function (resolve, reject) {
            if (reject) {
                console.log('chrome reject: ', reject);
            }
            else {
                console.log('chrome resolve: ', resolve);
            }
            console.log('Counts : ', userCount, notificationCount);
            if (userCount === notificationCount) {
                console.log('fire context: ');
                context.succeed();
            }
        });
    }
} // send PushMessage
//# sourceMappingURL=notificationController.js.map