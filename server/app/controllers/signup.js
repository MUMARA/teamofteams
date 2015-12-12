/**
 * Created by Shahzad on 12/26/2014.
 */

'use strict';

/*requires modules*/
var User     = require('mongoose').model('User'),
    fs       = require('fs'),
    ejs      = require('ejs'),
    nodeUuid = require('node-uuid'),
    sendgrid = require('../../config/sendgrid'),
    credentials = require('../../config/credentials'),
    fireHandler = require("./fireHandler");

/*private variables*/
var appconfig, verificationEmailTemplate;
appconfig = credentials.product;
verificationEmailTemplate = '';

//caching verification email template to use later on every sign-up

fs.readFile( __dirname + '/../views/verificationEmail.ejs', function( err, template ) {
    if (err) {
        console.log('file read error: ' + err);
    } else {
        //console.log('file read succeed');
        verificationEmailTemplate = template + '';
    }
});

//to handle "user sign-up"
exports.signUp = function( req, res ) {

    var emailReg = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    //validates email address and userID missing
    if ( !emailReg.test(req.body.email) || (typeof req.body.userID !== 'string') ||  req.body.userID.length < 3 ) {
        res.send({
            statusCode: 0,
            statusDesc: "email address Or userID is invalid."
        });

        return;
    }

    //check for existing user with same email address
    User.findOne({
        $or: [
            {
                email : req.body.email
            }, {
                userID : req.body.userID
            }
        ]
    }, function( err, user ) {
        if ( user ){
            if ( user.email === req.body.email ) {
                res.send({
                    statusCode: 2,
                    statusDesc: "user already exists with this email address."
                });
            } else {
                res.send({
                    statusCode: 3,
                    statusDesc: "user already exists with this userID."
                });
            }
        } else {
            createUser( res, req.body );
        }
    });
};

//to create a new user into DB
function createUser( res, user ) {

    //create a user object to store in database
    var userObj = {
        userID      : user.userID,
        email       : user.email,
        password    : user.password,
        firstName   : user.firstName,
        lastName    : user.lastName,
        uuid        : nodeUuid.v1(),
        status      : 'pending'
    };

    fireHandler.addUser( userObj, function( err, firebaseObj ) {
        if ( err ) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred while saving user details."
            });

        } else {

            var timestamp = new Date( firebaseObj[ "date-created" ] );
            userObj.dateCreated = timestamp.toISOString();
            userObj.devices = {
                android: [],
                iphone: [],
                windowsPhone: []
            };

            user = new User( userObj );
            user.save(function( error, user ) {
                if ( error ) {
                    //add code here to delete entry from firebase
                    res.send({
                        statusCode: 0,
                        statusDesc: "error occurred while saving user details."
                    });
                } else {
                    res.send({
                        uid: user.userID,
                        statusCode: 1,
                        statusDesc: "signed up successfully."
                    });

                    //send a verification email to new user.
                    sendVerificationEmail( userObj );
                }
            });
        }
    });
}

//to send a verification email
function sendVerificationEmail( user ) {

    var template = ejs.render( verificationEmailTemplate, {
        email : user.email,
        token : user.uuid,
        baseUrl : appconfig.BASEURL,
        domain : appconfig.DOMAIN,
        supportEmail : appconfig.SUPPORT
    });

    var payload = {
        to : user.email,
        from : appconfig.SUPPORT,
        subject : 'Verify your "'+ appconfig.TITLE +'" email address',
        html : template
    };

    sendgrid.send( payload, function( err, json ) {
        if ( err ) {
            console.log( 'email sent error: ' + user.email );
            return console.error( err );
        }

        console.log( 'email sent success: ' + user.email );
        console.log( json );
    });
}
