/**
 * Created by Shahzad on 12/26/2014.
 */

'use strict';

/*requires modules*/
var User = require('mongoose').model('User'),
    fireHandler = require("./fireHandler"),
    credentials = require('../../config/credentials'),
    fs = require('fs'),
    ejs = require("ejs");

/*private variables*/
var appconfig, accountConfirmationTemplate;

appconfig = credentials.product;
accountConfirmationTemplate = '';

//caching verification email template to use later on every signup
fs.readFile( __dirname + '/../views/accountConfirmation.ejs', function( err, template ) {
    if (err) {
        console.log('file read error: ' + err);
    } else {
        //console.log('file read succeed');
        accountConfirmationTemplate = template + '';
    }
});


//to confirm an account email address.
exports.verifyEmail = function( req, res ){

    //check for user with uuid similar to token
    User.findOneAndUpdate({uuid : req.params.uuid}, {$set:{status: 'verified'}}, function( err, user ) {
        if( err ){
            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });
        } else if ( user ) {
            fireHandler.updateUserStatus( user.userID, 'verified', function( err ) {
                var template;

                if ( err ) {
                    res.send({
                        statusCode: 0,
                        statusDesc: "account verification failed. please try again."
                    });
                } else {

                    res.redirect(appconfig.DOMAIN+'#/signin/');
                    // template = ejs.render( accountConfirmationTemplate, {
                    //     user: user,
                    //     app: appconfig
                    // });

                    // res.send(template);
                }
            });
        } else {
            res.send({
                statusCode: 1,
                statusDesc: "account verification failed. invalid token."
            });
        }
    });
};