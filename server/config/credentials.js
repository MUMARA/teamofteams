/**
 * Created by Shahzad on 3/12/2015.
 */

'use strict';

/*credentials used on server application*/
var development = {

    /*product application*/
    product: {
        BASEURL: 'https://panacloudapi.herokuapp.com/',
        // BASEURL: 'https://127.0.0.1:3000/',
        TITLE: 'Automated Attendance System',
        SUPPORT: 'support@teamofteams.io',
        DOMAIN: 'https://app.teamofteams.io/'
    },
    /*firebase credentials*/
    firebase: {
        SECRET: 'Jixsdx7sC1tMpovUMMV5AeMMR8EXFcw3JgCf4k4m',
        BASEURL: 'https://luminous-torch-4640.firebaseio.com/'
    },

    /*sendgrid credentials*/
    sendgrid: {
        USERNAME: process.env.SENDGRID_USERNAME,
        PASSWORD: process.env.SENDGRID_PASSWORD
    },
    postmark:{
        SERVERAPIKEY: process.env.POSTMARK_API_KEY

    },
    /*mongoDB ( mongoLab ) credentials*/
    mongoDB: {
        URI: 'mongodb://heroku_app32789651:6439bsgc56ehi5cpkpnoelqgmt@ds047950.mongolab.com:47950/heroku_app32789651'
    },

    /*push notification services credential e.g. GCM, APN*/
    pushNotifications: {
        gcm: {
            SERVER_KEY: 'AIzaSyCn52lhDmCGEj6djV3chw4Uvw8P10NFEGs'
        }
    }

};

var production = {

    /*product application*/
    product: {
        BASEURL: 'https://teamofteams.herokuapp.com/',
        TITLE: 'Automated Attendance System',
        SUPPORT: 'zia@panacloud.com',
        DOMAIN: 'https://app.teamofteams.io/'
    },
    /*firebase credentials*/
    firebase: {
        SECRET: process.env.FIREBASE_SECRET,
        BASEURL: 'https://panacloud.firebaseio.com/'
    },
    postmark:{
        SERVERAPIKEY: process.env.POSTMARK_API_KEY

    },

    /*sendgrid credentials*/
    sendgrid: {
        USERNAME: process.env.SENDGRID_USERNAME,
        PASSWORD: process.env.SENDGRID_PASSWORD
    },
    /*mongoDB ( mongoLab ) credentials*/
    mongoDB: {
        URI: 'mongodb://heroku_z1gg2qp7:kf4cemovh3t2vrgco5qpruogrn@ds057214.mongolab.com:57214/heroku_z1gg2qp7'
    },

    /*push notification services credential e.g. GCM, APN*/
    pushNotifications: {
        gcm: {
            SERVER_KEY: 'AIzaSyCn52lhDmCGEj6djV3chw4Uvw8P10NFEGs'
        }
    }

};

var credentialsObj = {};

if (process.env.NODE_ENV == 'development') {
    credentialsObj = development
} else if (process.env.NODE_ENV == 'production') {
    credentialsObj = production
}

module.exports = credentialsObj
