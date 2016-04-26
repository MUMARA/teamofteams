/// <reference path="../../typings/tsd.d.ts" />
var userController_1 = require('../lib/controller/userController');
exports.handler = function (event, context, cb) {
    userController_1.userSignup(event, context);
};
//# sourceMappingURL=handler.js.map