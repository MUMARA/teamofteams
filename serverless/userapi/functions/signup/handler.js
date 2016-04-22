/// <reference path="../../typings/main.d.ts" />
var User_1 = require('../lib/User');
exports.handler = function (event, context) {
    var user = new User_1.User(event.email, event.userID);
    context.succeed(user);
};
//# sourceMappingURL=handler.js.map