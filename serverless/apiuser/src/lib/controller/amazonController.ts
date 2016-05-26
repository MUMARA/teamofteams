import * as AWS from 'aws-sdk';

import {credentials} from '../config/credentials';

function bucketName(bucketType) {
    switch (bucketType) {
        case 'user':
            return credentials.amazon.userBucketName;
        case 'group':
            return credentials.amazon.groupBucketName;
        case 'subgroup':
            return credentials.amazon.subgroupBucketName;
        case 'quizBank':
            return credentials.amazon.quizbankBucketName;
        case 'questionBank':
            return credentials.amazon.questionbankBucketName;
    }
}

function errorHandler(error, context: Context){
    context.fail(error)
}

function init() {
    AWS.config.update(<any>{
        accessKeyId: credentials.amazon.accessKeyId,
        secretAccessKey: credentials.amazon.secretAccessKey,
        region: 'us-west-2',
        signatureVersion: 'v4'
    });
}

export function getS3SignedUrl(event, context: Context) {
    init()
    let fileName = event.id + '.' + event.file_type.split('/')[1];
    let s3_params = {
        Bucket: bucketName(event.bucket_type),
        Key: fileName,
        Expires: 60,
        ContentType: event.fileType,
        ACL: 'public-read'
    };
    generateSignature(s3_params, event.bucket_type, fileName, context);
}

function generateSignature(s3_params, bucketType, filename, context: Context) {
    let s3 : any = new AWS.S3();
    s3.getSignedUrl('putObject', s3_params, (err, data) => {
        if (err) {
            return errorHandler(err, context);            
        } else {
            let return_data = {
                signed_request: data,
                url: 'https://' + bucketName(bucketType) + '.s3.amazonaws.com/' + filename
            };
            context.succeed(return_data);
        }
    });
}