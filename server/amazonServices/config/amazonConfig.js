'use strict';

var BASEURL = '';

if (process.env.NODE_ENV == 'development') {
    BASEURL = 'https://panacloudapi.herokuapp.com/';
} else if (process.env.NODE_ENV == 'production') {
    BASEURL = 'https://teamofteams.herokuapp.com/';
}

var AWS = {};

if (process.env.NODE_ENV == 'development') {
    AWS = {
        'userBucketName': 'pwowuserimg',
        'groupBucketName': 'pwowgroupimg',
        'subgroupBucketName': 'pwowsubgroupimg',
        'quizbankBucketName': 'pwowquizbankimg',
        'questionbankBucketName': 'pwowquestionbankimg'
    }
} else if (process.env.NODE_ENV == 'production') {
    AWS = {
        'userBucketName': 'totsuserimg',
        'groupBucketName': 'totsgroupimg',
        'subgroupBucketName': 'totssubgroupimg',
        'quizbankBucketName': 'totsquizbankimg',
        'questionbankBucketName': 'totsquestionbankimg'
    }
}

var config = {
    "BASEURL": BASEURL, // our domain
    /*"amazon":{
        "accessKeyId": "AKIAJIQLONGMPUZUD7YA",
        "secretAccessKey": "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",
        'bucketName':'test2pwow',
        "userProfilePicture": "profileBucket",
        "groupProfilePicture":'groupProfileBucket',
        //"groupProfilePicture":'test',
        "subgroupProfilePicture":'subgroupProfileBucket',
        's3BaseUrl':'https://s3.amazonaws.com'
    }*/
    "amazon": {
        // "accessKeyId": "AKIAJIQLONGMPUZUD7YA",
        "accessKeyId": "AKIAIQUMDHTDUMB7LZVQ",
        // "secretAccessKey": "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",
        "secretAccessKey": "sM/OO6WKgSDkqfmZ629EV2VWc7XR1pgehJYnz2aX",
        'userBucketName': AWS.userBucketName,
        'groupBucketName': AWS.groupBucketName,
        'subgroupBucketName': AWS.subgroupBucketName,
        'quizbankBucketName': AWS.quizbankBucketName,
        'questionbankBucketName': AWS.questionbankBucketName,
        's3BaseUrl': 'https://s3.amazonaws.com'
    }
};

module.exports = config;
