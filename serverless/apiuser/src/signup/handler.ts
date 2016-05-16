/// <reference path="../../typings/tsd.d.ts" />

import {userSignup} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    userSignup(event, context);
};
