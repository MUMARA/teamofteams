/// <reference path="../../typings/tsd.d.ts" />

import {userSignin} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    userSignin(event, context);
};
