/// <reference path="../../typings/tsd.d.ts" />
"use strict";
var userController_1 = require('../lib/controller/userController');
exports.handler = function (event, context, cb) {
    userController_1.editUser(event, context);
};
//# sourceMappingURL=handler.js.map