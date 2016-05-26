/// <reference path="../../typings/tsd.d.ts" />

import {editUser} from '../lib/controller/userController'

exports.handler = function(event, context: Context, cb) {
    editUser(event, context);
};
