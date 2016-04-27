/// <reference path="../../typings/tsd.d.ts" />

import {userSignup, userSignin} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    userSignin(event, context);
};
