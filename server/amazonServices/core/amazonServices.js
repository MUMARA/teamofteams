/**
 * Created with JetBrains WebStorm.
 * User: Mehmood
 * Date: 12/8/14
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */

var AWS = require("aws-sdk");
var config = require('../config/amazonConfig').amazon;
var Q = require("q");
var s3Client;


module.exports.init = function(){

    AWS.config.update({accessKeyId:  config.accessKeyId, secretAccessKey: config.secretAccessKey});
    AWS.config.update({region: 'us-west-2' , signatureVersion: 'v4' });
    s3Client = new AWS.S3();

};

module.exports.userPictureUpload = function(req, res, bucketType){

    var fileName = req.query.userID + '.'  + req.query.file_type.split('/')[1];
    var s3_params = {
        Bucket: bucketName(bucketType),
        Key: fileName,
        Expires: 60,
        ContentType:req.query.file_type,
        ACL: 'public-read'
    };
    getS3SignedUrl(s3_params, bucketType, fileName, res);
};
module.exports.groupPictureUpload = function(req, res, bucketType){

    var fileName = req.query.groupID + '.' + req.query.file_type.split('/')[1];
    var s3_params = {
        Bucket: bucketName(bucketType),
        Key: fileName,
        Expires: 60,
        ContentType:req.query.file_type,
        ACL: 'public-read'
    };
    getS3SignedUrl(s3_params,bucketType,fileName,res);
};
module.exports.subgrouopPictureUpload = function(req, res, bucketType){

    var fileName = req.query.groupID + '_'+ req.query.subgroupID + '.' + req.query.file_type.split('/')[1];
    var s3_params = {
        Bucket: bucketName(bucketType),
        Key: fileName,
        Expires: 60,
        ContentType:req.query.file_type,
        ACL: 'public-read'
    };
    getS3SignedUrl(s3_params, bucketType, fileName, res);
};

module.exports.quizbankPictureUpload = function(req, res, bucketType){

    var fileName = req.query.quizID + '.' + req.query.file_type.split('/')[1];
    var s3_params = {
        Bucket: bucketName(bucketType),
        Key: fileName,
        Expires: 60,
        ContentType:req.query.file_type,
        ACL: 'public-read'
    };
    getS3SignedUrl(s3_params,bucketType,fileName,res);
};
function bucketName(bucketType){
    switch (bucketType){
        case 'user': return config.userBucketName;break;
        case 'group':return config.groupBucketName;break;
        case 'subgroup':return config.subgroupBucketName;break
        case 'quizbank':return config.quizbankBucketName;break
    }
}
function getS3SignedUrl(s3_params,bucketType,filename,res){
    var s3 = new AWS.S3();
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            console.log(data);

            var return_data = {
                signed_request: data,
                url: 'https://'+ bucketName(bucketType) + '.s3.amazonaws.com/' + filename
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
}