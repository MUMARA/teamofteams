"use strict";
var AWS = require('aws-sdk');
var credentials_1 = require('../config/credentials');
function bucketName(bucketType) {
    switch (bucketType) {
        case 'user':
            return credentials_1.credentials.amazon.userBucketName;
        case 'group':
            return credentials_1.credentials.amazon.groupBucketName;
        case 'subgroup':
            return credentials_1.credentials.amazon.subgroupBucketName;
        case 'quizBank':
            return credentials_1.credentials.amazon.quizbankBucketName;
        case 'questionBank':
            return credentials_1.credentials.amazon.questionbankBucketName;
    }
}
function errorHandler(error, context) {
    context.fail(error);
}
function init() {
    AWS.config.update({
        accessKeyId: credentials_1.credentials.amazon.accessKeyId,
        secretAccessKey: credentials_1.credentials.amazon.secretAccessKey,
        region: 'us-west-2',
        signatureVersion: 'v4'
    });
}
function getS3SignedUrl(event, context) {
    init();
    var fileName = event.id + '.' + event.file_type.split('/')[1];
    var s3_params = {
        Bucket: bucketName(event.bucket_type),
        Key: fileName,
        Expires: 60,
        ContentType: event.fileType,
        ACL: 'public-read'
    };
    generateSignature(s3_params, event.bucket_type, fileName, context);
}
exports.getS3SignedUrl = getS3SignedUrl;
function generateSignature(s3_params, bucketType, filename, context) {
    var s3 = new AWS.S3();
    s3.getSignedUrl('putObject', s3_params, function (err, data) {
        if (err) {
            return errorHandler(err, context);
        }
        else {
            var return_data = {
                signed_request: data,
                url: 'https://' + bucketName(bucketType) + '.s3.amazonaws.com/' + filename
            };
            context.succeed(return_data);
        }
    });
}
//# sourceMappingURL=amazonController.js.map