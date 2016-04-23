/// <reference path="../../../typings/tsd.d.ts" />

let postmark = require('postmark');

import {credentials} from './credentials';

export let client = new postmark.Client(credentials.postmark.SERVERAPIKEY);