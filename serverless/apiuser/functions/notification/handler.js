/// <reference path="../../typings/tsd.d.ts" />
"use strict";
var notificationController_1 = require('../lib/controller/notificationController');
exports.handler = function (event, context, cb) {
    notificationController_1.sendPushNotification(event, context);
};
//# sourceMappingURL=handler.js.map