/**
 * Created with JetBrains WebStorm.
 * User: Khurram
 * Date: 12/8/14
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */

var AWS = require("aws-sdk");
var config = require('../config/amazonConfig').amazon;
var Q = require("q");
var s3Client;


module.exports.init = function() {

    AWS.config.update({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
    });
    AWS.config.update({
        region: 'us-west-2',
        signatureVersion: 'v4'
    });
    s3Client = new AWS.S3();

};


module.exports.remove = function(fileID) {

    var result = Q.defer();

    var params = {
        Bucket: config.profilePictureBucketName,
        Key: fileID
    };

    s3Client.deleteObject(params, function(err, data) {
        if (err)
            result.reject(err);
        else {
            result.resolve(data.Body);
        }
    });

    return result.promise;
};

module.exports.download = function(fileID, bucketID) {

    var result = Q.defer();

    var params = {
        Bucket: config.bucketName,
        Key: setBuckPicturePath(bucketID, fileID)
    };

    s3Client.getObject(params, function(err, data) {
        if (err)
            result.reject(err);
        else {
            result.resolve(data.Body);
        }
    });

    return result.promise;
};

module.exports.upload = function(body, key, buckettype, fileType) {
    var bucketFilePath = setBuckPicturePath(buckettype, key, fileType);
    console.log("upload started");

    var result = Q.defer();
    var params = {

        Bucket: config.bucketName,
        Key: bucketFilePath,
        Body: body,
        //ContentType:"text/html"
        ContentType: "image/" + fileType,
        ACL: 'public-read'
            //'x-amz-acl':'public-read'
    };
    s3Client.putObject(params, function(err, data) {

        if (err)
            result.reject(err);
        else
            result.resolve(config.s3BaseUrl + '/' + config.bucketName + '/' + bucketFilePath);
    });

    return result.promise;

};
module.exports.getAmazonUrl = function(req, res, bucketType) {

    var fileName;
    if (bucketType === 'subgroup') {
        if (!req.query.groupID) {
            res.send({
                statusCode: 0,
                statusDesc: "groupID required"
            });
            return;
        }
        if (!req.query.subgroupID) {
            res.send({
                statusCode: 0,
                statusDesc: "subgroupID required"
            });
            return;
        }

        fileName = req.query.groupID + '_' + req.query.subgroupID + '.' + req.query.file_type.split('/')[1]
    } else {
        if (!req.query.file_name) {
            res.send({
                statusCode: 0,
                statusDesc: "file_name required"
            });
            return;
        }
    }
    if (!req.query.file_type) {
        res.send({
            statusCode: 0,
            statusDesc: "file_type required"
        });
        return;
    }


    //var s3 = new aws.S3();
    var s3_params = {
        Bucket: config.bucketName,
        //Key: req.query.file_name,
        Key: setUrl(bucketType, fileName || req.query.file_name),
        Expires: 60,
        ContentType: req.query.file_type,
        ACL: 'public-read'
    };
    s3Client.getSignedUrl('putObject', s3_params, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
            var return_data = {
                signed_request: data,
                //url: 'https://'+ config.bucketName + '.s3.amazonaws.com/' + req.query.file_name
                url: 'https://' + config.bucketName + '.s3.amazonaws.com/' + setUrl(bucketType, fileName || req.query.file_name)
                    //url: config.s3BaseUrl + '/' + setUrl(bucketType,req.query.file_name)

            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
}

function setBuckPicturePath(bucketType, key, fileType) {
    var bucketFilePath;
    switch (bucketType) {
        case 'user':
            bucketFilePath = config.userProfilePicture + '/' + key + '.' + fileType;
            break;
        case 'group':
            bucketFilePath = config.groupProfilePicture + '/' + key + '.' + fileType;
            break;
        case 'subgroup':
            bucketFilePath = config.subgroupProfilePicture + '/' + key + '.' + fileType;
            break;
        case 'quizbank':
            bucketFilePath = config.quizbankProfilePicture + '/' + key + '.' + fileType;
            break;
    }
    return bucketFilePath

}

function setUrl(bucketType, filename) {
    var bucketFilePath;
    switch (bucketType) {
        case 'user':
            bucketFilePath = config.userProfilePicture + '/' + filename;
            break;
        case 'group':
            bucketFilePath = config.groupProfilePicture + '/' + filename;
            break;
        case 'subgroup':
            bucketFilePath = config.subgroupProfilePicture + '/' + filename;
            break;
        case 'quizbank':
            bucketFilePath = config.quizbankProfilePicture + '/' + filename;
            break;
    }
    return bucketFilePath

}
