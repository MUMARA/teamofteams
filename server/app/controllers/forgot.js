/**
 * Created by Shahzad on 04/10/2015.
 */

(function() {
    'use strict';

    /*requires modules*/
    var mongoose = require('mongoose'),
        User = mongoose.model('User'),
        fs = require('fs'),
        ejs = require('ejs'),
        sendgrid = require('../../config/sendgrid'),
        postmark = require('../../config/postmark'),
        credentials = require('../../config/credentials');


    /*private variables*/
    var appconfig, passwordRecoveryEmailTemplate;


    /*initialize stuff*/
    appconfig = credentials.product;
    passwordRecoveryEmailTemplate = '';

    //caching password recovery email template to use later on coming requests
    fs.readFile(__dirname + '/../views/passwordRecoveryEmail.ejs', function(err, template) {
        if (err) {
            console.log('file read error: ' + err);
        } else {
            //console.log('file read succeed');
            passwordRecoveryEmailTemplate = template + '';
        }
    });


    /*exports*/
    exports.forgotPassword = forgotPassword;


    /*functions declarations*/
    function forgotPassword(req, res) {
        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                res.send({
                    statusCode: 0,
                    statusDesc: "error occurred."
                });
            } else if (user) {
                sendPasswordRecoveryEmail(user);
                res.send({
                    statusCode: 1,
                    statusDesc: "you would receive an email with a password recovery link, shortly."
                });
            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "user with this email does not exist."
                });
            }
        });
    }

    //to send a password email
    function sendPasswordRecoveryEmail(user) {
        var template = ejs.render(passwordRecoveryEmailTemplate, {
            user: user,
            app: appconfig
        });

        ////using sendgrid
        // var payload = {
        //     to: user.email,
        //     from: appconfig.SUPPORT,
        //     subject: 'Account Recovery Email - "' + appconfig.TITLE,
        //     html: template
        // };
        // sendgrid.send(payload, function(err, json) {
        //     if (err) {
        //         console.log('email sent error: ' + user.email);
        //         return console.error(err);
        //     }

        //     console.log('email sent success: ' + user.email);
        //     console.log(json);
        // });

        ////using postmark
        var payload = {
            "To": user.email,
            "From": appconfig.SUPPORT,
            "Subject": 'Account Recovery Email - "' + appconfig.TITLE,
            "HtmlBody": template/*,
            "TextBody": template,
            "Attachments": [{
                "Content": File.readFileSync("./unicorns.jpg").toString('base64'),
                "Name": "PrettyUnicorn.jpg",
                "ContentType": "image/jpeg"
            }]*/
        };
        postmark.sendEmail(payload,function(err, json) {
            if (err) {
                console.log('email sent error: ' + user.email);
                return console.error(err.message);
            }

            console.log('email sent success: ' + user.email);
            console.log(json);
        });
    }

})();
