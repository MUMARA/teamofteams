/// <reference path="../../typings/main.d.ts" />
"use strict";
var User_1 = require('../lib/User');
exports.handler = function (event, context) {
    var user = new User_1.User(event.email, event.userID);
    context.succeed(user.Signup());
};
//# sourceMappingURL=handler.js.map