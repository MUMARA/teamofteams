/// <reference path="../../typings/tsd.d.ts" />

import {removeUser} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    removeUser(event, context);
};
