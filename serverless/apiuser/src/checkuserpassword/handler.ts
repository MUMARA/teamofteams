/// <reference path="../../typings/tsd.d.ts" />

import {checkUserPassword} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    checkUserPassword(event, context);
};
