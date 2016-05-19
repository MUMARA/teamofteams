import {myFirebaseRef} from './fireHandler';
import {tokenGenerator} from '../config/tokenGenerator';
import {credentials} from '../config/credentials'

let webpush = require('web-push-encryption');
webpush.setGCMAPIKey(credentials.pushNotifications.gcm.SERVER_KEY);

let ref: Firebase = myFirebaseRef;
let activeUserCount = 0;
let notificationCount = 0;
let userCount = 0;

// var dataObj = {msg: "First push notification, PWA-TodoApp", title: "Title From Server", tag: "my-taggy", icon: "https://fs02.androidpit.info/a/10/3a/cornie-icons-103aff-w192.png"};

export function sendPushNotification(event, context: Context) {

    activeUserCount = 0;
    
    let token = event.token,
        userId = event.userId,
        groupId = event.groupId,
        subgroupId = event.subgroupId,
        dataObj = event.dataObj
    
    auth(token, context, function(){
        getUsersOfSubGroup(groupId, subgroupId, userId, dataObj, context);
    });

}

function auth(token, context: Context, callback) {
    
    ref.authWithCustomToken(token, function (error, authData) {
        if (error) {
            console.log("FireBase Login Failed!", error);
            context.fail(error);
        } else {
            console.log("FireBase Login Succeeded!", authData);
            callback();
        }
    });
    
}

function getUsersOfSubGroup(groupId, subgroupId, userId, dataObj, context: Context) {

    ref.child('subgroup-members').child(groupId).child(subgroupId).once('value', function (snapshot) {
        var uCount = snapshot.numChildren();
        
        if (snapshot.val()) {

            for (var uId in snapshot.val()) {
                
                //console.log(uId, snapshot.val()[uId])

                //checking membership-Type is greater then zero
                if (snapshot.val()[uId]['membership-type'] > 0) {
                    // checking user presence
                    if (userId !== uId) {
                        userCount++;
                        // checkUserPresence(uId, dataObj, context);
                        getUserSubscription(uId, dataObj, context);
                    } 
                }

                // if (userCount === uCount && activeUserCount === 0) { 
                //     context.succeed('No User Online');
                // }                
                
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
    });

} // Get Subcription From Firebase


// send PushMessage  // dataObj = {msg: "", title: "", tag: "", icon: ""};
function sendPushMessage(subscription, dataObj, context: Context) {

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
            } else {
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