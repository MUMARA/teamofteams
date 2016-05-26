/// <reference path="../../typings/tsd.d.ts" />
"use strict";
var amazonController_1 = require('../lib/controller/amazonController');
exports.handler = function (event, context, cb) {
    amazonController_1.getS3SignedUrl(event, context);
};
//# sourceMappingURL=handler.js.map