/**
 * Created by Shahzad on 12/26/2014.
 */

'use strict';

var User = require('mongoose').model('User'),
    fireHandler = require("./fireHandler");

//to confirm an account email address.
exports.confirmEmail = function(req, res) {

    //check for user with uuid similar to token
    User.findOneAndUpdate({
        uuid: req.params.token
    }, {
        $set: {
            status: 1
        }
    }, function(err, user) {
        if (err) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if (user) {
            fireHandler.updateUserStatus(user.userID, 1, function(err) {
                if (err) {
                    res.send({
                        statusCode: 0,
                        statusDesc: "account has been verified successfully."
                    });
                } else {
                    res.send({
                        statusCode: 1,
                        statusDesc: "account has been verified successfully."
                    });
                }
            });
        } else {
            res.send({
                statusCode: 1,
                statusDesc: "invalid token."
            });
        }
    });
};
