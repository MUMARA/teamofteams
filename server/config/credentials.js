/**
 * Created by Shahzad on 3/12/2015.
 */

'use strict';

/*credentials used on server application*/
var credentialsObj = {

    /*product application*/
    product: {
        BASEURL: 'https://panacloudapi.herokuapp.com/',
        //BASEURL: 'https://127.0.0.1:3000/',
        TITLE: 'Automated Attendance System',
        SUPPORT: 'support@aasystem.com'
    },
    /*firebase credentials*/
    firebase: {
        SECRET: 'Jixsdx7sC1tMpovUMMV5AeMMR8EXFcw3JgCf4k4m',
        BASEURL: 'https://luminous-torch-4640.firebaseio.com/'
    },

    /*sendgrid credentials*/
    sendgrid: {
        USERNAME : 'app32789651@heroku.com',
        PASSWORD : 'miqn2z73'
    },

    /*mongoDB ( mongoLab ) credentials*/
    mongoDB: {
        URI : 'mongodb://heroku_app32789651:6439bsgc56ehi5cpkpnoelqgmt@ds047950.mongolab.com:47950/heroku_app32789651'
    },

    /*push notification services credential e.g. GCM, APN*/
    pushNotifications: {
        gcm: {
            SERVER_KEY : 'AIzaSyCn52lhDmCGEj6djV3chw4Uvw8P10NFEGs'
        }
    }

};

module.exports = credentialsObj;