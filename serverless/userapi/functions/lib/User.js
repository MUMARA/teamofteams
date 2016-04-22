/// <reference path="../../typings/main.d.ts" />
"use strict";
var User = (function () {
    function User(email, userID) {
        this.email = email;
        this.userID = userID;
    }
    User.prototype.Signup = function () {
        return this.email + " // " + this.userID;
    };
    return User;
}());
exports.User = User;
//# sourceMappingURL=User.js.map