/// <reference path="../../../typings/tsd.d.ts" />
var FirebaseTokenGenerator = require('firebase-token-generator');
var credentials_1 = require('./credentials');
exports.tokenGenerator = new FirebaseTokenGenerator(credentials_1.credentials.firebase.SECRET);
//# sourceMappingURL=tokenGenerator.js.map