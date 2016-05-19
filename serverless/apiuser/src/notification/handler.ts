/// <reference path="../../typings/tsd.d.ts" />

import {sendPushNotification} from '../lib/controller/notificationController'

exports.handler = function(event, context: Context, cb) {
    sendPushNotification(event, context);
};
