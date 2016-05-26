/// <reference path="../../../typings/tsd.d.ts" />

let development = {

    /*product application*/
    product: {
        BASEURL: 'https://wgco9m0sl1.execute-api.us-east-1.amazonaws.com/dev',
        // BASEURL: 'https://panacloudapi.herokuapp.com/',
        // BASEURL: 'https://127.0.0.1:3000/',
        TITLE: 'Team of Teams',
        SUPPORT: 'zia@panacloud.com',
        DOMAIN: 'https://app.teamofteams.io/'
    },
    
    /*firebase credentials*/
    firebase: {
        SECRET: 'Jixsdx7sC1tMpovUMMV5AeMMR8EXFcw3JgCf4k4m',
        BASEURL: 'https://luminous-torch-4640.firebaseio.com/'
    },

    /*Email Sending Service Post Mark API*/
    postmark:{
        SERVERAPIKEY: 'bd40d4b9-342b-42d9-9279-b8c61d76d71c'
    },
    
    /*mongoDB ( mongoLab ) credentials*/
    mongoDB: {
        URI: 'mongodb://heroku_app32789651:6439bsgc56ehi5cpkpnoelqgmt@ds047950.mongolab.com:47950/heroku_app32789651'
    },

    /*push notification services credential e.g. GCM, APN*/
    pushNotifications: {
        gcm: {
            // SERVER_KEY: 'AIzaSyCn52lhDmCGEj6djV3chw4Uvw8P10NFEGs'
            SERVER_KEY: 'AIzaSyCsCOzXB8Ewo2XcM1_YTUkFTnmIPNKD95s'
        },
        fcm: {
            API_KEY: "AIzaSyAmK_hY3ro-OGq_j_Etnb7EwQPIyZrJ_H0"
        }
    },

    amazon: {
        "accessKeyId": "AKIAIQUMDHTDUMB7LZVQ",
        "secretAccessKey": "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",
        'userBucketName': 'pwowuserimg',
        'groupBucketName': 'pwowgroupimg',
        'subgroupBucketName': 'pwowsubgroupimg',
        'quizbankBucketName': 'pwowquizbankimg',
        'questionbankBucketName': 'pwowquestionbankimg',
        's3BaseUrl': 'https://s3.amazonaws.com'
    }

};

let production = {

    /*product application*/
    product: {
        BASEURL: 'https://wgco9m0sl1.execute-api.us-east-1.amazonaws.com/prod',
        // BASEURL: 'https://teamofteams.herokuapp.com/',
        TITLE: 'Team of Teams',
        SUPPORT: 'zia@panacloud.com',
        DOMAIN: 'https://app.teamofteams.io/'
    },
    
    /*firebase credentials*/
    firebase: {
        SECRET: 'yyj8pfLYpdNfXH3onn3n8abmNZOD7bRG0t91hHvF',
        BASEURL: 'https://panacloud.firebaseio.com/'
    },
    
    /*Email Sending Service Post Mark API*/    
    postmark:{
        SERVERAPIKEY: 'bd40d4b9-342b-42d9-9279-b8c61d76d71c'
    },

    /*mongoDB ( mongoLab ) credentials*/
    mongoDB: {
        URI: 'mongodb://heroku_z1gg2qp7:kf4cemovh3t2vrgco5qpruogrn@ds057214.mongolab.com:57214/heroku_z1gg2qp7'
    },

    /*push notification services credential e.g. GCM, APN*/
    pushNotifications: {
        gcm: {
            // SERVER_KEY: 'AIzaSyCn52lhDmCGEj6djV3chw4Uvw8P10NFEGs'
            SERVER_KEY: 'AIzaSyCsCOzXB8Ewo2XcM1_YTUkFTnmIPNKD95s'
        },
        fcm: {
            API_KEY: "AIzaSyAmK_hY3ro-OGq_j_Etnb7EwQPIyZrJ_H0"
        }
    },

    amazon: {
        "accessKeyId": "AKIAIQUMDHTDUMB7LZVQ",
        "secretAccessKey": "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",
        'userBucketName': 'totsuserimg',
        'groupBucketName': 'totsgroupimg',
        'subgroupBucketName': 'totssubgroupimg',
        'quizbankBucketName': 'totsquizbankimg',
        'questionbankBucketName': 'totsquestionbankimg',
        's3BaseUrl': 'https://s3.amazonaws.com'
    }

};

export let credentials = process.env.SERVERLESS_STAGE == 'prod' ? production : development;   
