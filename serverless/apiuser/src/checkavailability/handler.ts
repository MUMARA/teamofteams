/// <reference path="../../typings/tsd.d.ts" />

import {checkAvailability} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    checkAvailability(event, context);
};
