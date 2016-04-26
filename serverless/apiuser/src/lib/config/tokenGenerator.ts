/// <reference path="../../../typings/tsd.d.ts" />

import FirebaseTokenGenerator = require('firebase-token-generator');

import {credentials} from './credentials';

export let tokenGenerator = new FirebaseTokenGenerator(credentials.firebase.SECRET);
