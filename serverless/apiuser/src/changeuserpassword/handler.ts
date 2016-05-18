/// <reference path="../../typings/tsd.d.ts" />

import {changeUserPassword} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    changeUserPassword(event, context);
};
