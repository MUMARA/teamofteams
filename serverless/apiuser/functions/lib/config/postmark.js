/// <reference path="../../../typings/tsd.d.ts" />
"use strict";
var postmark = require('postmark');
var credentials_1 = require('./credentials');
exports.client = new postmark.Client(credentials_1.credentials.postmark.SERVERAPIKEY);
//# sourceMappingURL=postmark.js.map