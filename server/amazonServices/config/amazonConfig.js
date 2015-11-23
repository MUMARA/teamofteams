'use strict';

var config = {
    "BASEURL": 'https://panacloudapi.herokuapp.com/',  // our domain
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
    "amazon":{
        "accessKeyId": "AKIAJIQLONGMPUZUD7YA",
        "secretAccessKey": "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",
        'userBucketName':'pwowuserimg',
        'groupBucketName':'pwowgroupimg',
        'subgroupBucketName':'pwowsubgroupimg',
        'quizbankBucketName':'pwowquizbankimg',
        's3BaseUrl':'https://s3.amazonaws.com'
    }
};

module.exports = config;
