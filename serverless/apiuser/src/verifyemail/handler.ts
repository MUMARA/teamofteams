/// <reference path="../../typings/tsd.d.ts" />

import {verifyEmail} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    verifyEmail(event, context);
};
