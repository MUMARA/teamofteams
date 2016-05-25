/// <reference path="../../typings/tsd.d.ts" />

import {getS3SignedUrl} from '../lib/controller/amazonController'

exports.handler = function(event, context: Context, cb) {
    getS3SignedUrl(event, context);
};
