/// <reference path="../../typings/tsd.d.ts" />

import {forgotPassword} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    forgotPassword(event, context);
};
