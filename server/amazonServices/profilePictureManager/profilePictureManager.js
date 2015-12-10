/**
 * Created with JetBrains WebStorm.
 * User: MEHMOOD
 * Date: 12/8/14
 * Time: 1:59 PM
 * To change this template use File | Settings | File Templates.
 */

var amazonServices = require("../core/amazonServices");
var config = require("../config/amazonConfig");
var user = require("../../app/controllers/users");
var User = require('mongoose').model('User');
var firebaseCtrl = require('../../app/controllers/firebaseCtrl');




var fs = require("fs");
var Q = require("q");


function errorHandler(error, res){

     switch(error.statusCode){

         case 403:
             res.statusCode = 403;
             res.render("notFound", {errorMessage:"Presentation not found"});
         break;

     }

}

module.exports.remove = function(userID, token, res, bucketID){
    var that = this;
    User.findOne({userID: userID}, function (err, user) {
        if (err) {

            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });

        } else if (user) {

            if (user.token === token) {

                user['profile-image'] = {};// remove profile-image data
                //user.update({$push:{s3pId:{pID:pID, name:pName}}}, function(error, user){
                user.save(function (error, savedUser) {

                    if (error) {

                        res.send({
                            statusCode: 0,
                            statusDesc: "Internal Server Error."
                        });

                    } else {

                        firebaseCtrl.asyncRemoveUserProfileImage( userID )

                            .then(function (resolved) {

                                that.removeFile(userID).then(function(){

                                    res.send({
                                        statusCode: 1,
                                        statusDesc: "ProfilePicture removed."
                                    });

                                },function(){

                                    res.send({
                                        statusCode: 0,
                                        statusDesc: "Internal Server Error."
                                    });

                                });

                            }, function (error) {

                                res.send({
                                    statusCode: 0,
                                    statusDesc: "Internal Server Error."
                                });

                            })

                    }

                });

            } else {

                res.send({
                    statusCode: 0,
                    statusDesc: "Invalid token."
                });

            }

        }

    });

};

module.exports.saveUserProfilepicture = function (filePath, userID, token, res, bucketID) {

    var that = this;
    if(Object.keys(filePath).length && Object.keys(filePath.source).length){
        var fileType =  _fileType || (filePath.type && filePath.type.split('/')[1])||'png';
    } else{
        return errorHadler('No file soruce present.',res);
    }
    if(!userID){
        return errorHadler('userID is not defined',res);
    }

    if(!token){
        return errorHadler('token is not defined',res);
    }

    //var fileType = filePath.type.split('/')[1];


    that.putFile(filePath, userID, bucketID,fileType).then(function (response) {

        User.findOne({userID: userID}, function (err, user) {
            if (err) {

                res.send({
                    statusCode: 0,
                    statusDesc: "error occurred."
                });

            } else if (user) {

                if (user.token === token) {

                    user['profile-image'] = {
                        url: response, // pID is going to be changed with userID for single profile picture only
                        id: userID,
                        'bucket-name': config.bucketName,
                        source: 1,// 1 = google cloud storage
                        mediaType: 'image/' + fileType  //image/jpeg
                    };
                    //user.update({$push:{s3pId:{pID:pID, name:pName}}}, function(error, user){
                    user.save(function (error, savedUser) {

                        if (error) {

                            res.send({
                                statusCode: 0,
                                statusDesc: "Internal Server Error."
                            });

                        } else {

                            firebaseCtrl.asyncUpdateUser(userID, {'profile-image': savedUser['profile-image'].toObject()})

                                .then(function (resolved) {

                                    res.send({
                                        statusCode: 1,
                                        statusDesc: "ProfilePicture updated.",
                                        url: config.BASEURL + "/api/profilepicture/get" // get profile picture route in our server
                                    });

                                }, function (error) {

                                    res.send({
                                        statusCode: 0,
                                        statusDesc: "Internal Server Error."
                                    });

                                })

                        }

                    });

                } else {

                    res.send({
                        statusCode: 0,
                        statusDesc: "Invalid token."
                    });

                }

            }

        });

    }, function (error) {

        res.send({
            statusCode: 0,
            statusDesc: "Error occured while saving picture."
        });

    });

};
/*quiz bank api*/
module.exports.saveQuizBookPicture = function (filePath, userID, quizID, token, res, bucketID, _fileType) {
    try {

        var that = this;
        if (Object.keys(filePath).length) {

            var fileType = _fileType || (filePath.type && filePath.type.split('/')[1]) || 'png'

        } else {

            return errorHadler('No file soruce present.', res);
        }

        if (!userID) {
            return errorHadler('userID is not defined', res);

        }

        if (!quizID) {
            return errorHadler('groupID is not defined', res);

        }

        if (!token) {

            return errorHadler('token is not defined', res);

        }

        that.putFile(filePath, quizID, bucketID, fileType).then(function (response) {

            User.findOne({userID: userID}, function (err, user) {
                if (err) {

                    res.send({
                        statusCode: 0,
                        statusDesc: "error occurred."
                    });

                } else if (user) {

                    if (user.token === token) {
                        var logoImage = {
                            url: response, // pID is going to be changed with userID for single profile picture only
                            id: quizID,
                            'bucket-name': config.amazon.bucketName,
                            source: 1,// 1 = google cloud storage
                            mediaType: 'image/' + fileType //image/jpeg
                        };
                        firebaseCtrl.asyncUpdateQuizbank(quizID, {'logo-image': logoImage})

                            .then(function (resolved) {

                                res.send({
                                    statusCode: 1,
                                    statusDesc: "quizbank picture updated.",
                                    url: response // get profile picture route from s3 amazon
                                });

                            }, function (error) {

                                res.send({
                                    statusCode: 0,
                                    statusDesc: "Internal Server Error."
                                });

                            })

                    } else {

                        res.send({
                            statusCode: 0,
                            statusDesc: "Invalid token."
                        });

                    }

                } else {

                }

            });

        }, function (error) {

            res.send({
                statusCode: 0,
                statusDesc: "Error occured while saving picture."
            });

        });
    } catch (e) {

        res.send({
            statusCode: 0,
            statusDesc: "internal Server error"
        });
    }

};

/*quiz bank api end*/
module.exports.saveGroupProfilePicture = function (filePath, userID, groupID, token, res, bucketID, _fileType) {
    try {

        var that = this;
        if (Object.keys(filePath).length) {

            var fileType = _fileType || (filePath.type && filePath.type.split('/')[1]) || 'png'

        } else {

            return errorHadler('No file soruce present.', res);
        }

        if (!userID) {
            return errorHadler('userID is not defined', res);

        }

        if (!groupID) {
            return errorHadler('groupID is not defined', res);

        }

        if (!token) {

            return errorHadler('token is not defined', res);

        }

        that.putFile(filePath, groupID, bucketID, fileType).then(function (response) {

            User.findOne({userID: userID}, function (err, user) {
                if (err) {

                    res.send({
                        statusCode: 0,
                        statusDesc: "error occurred."
                    });

                } else if (user) {

                    if (user.token === token) {
                        var logoImage = {
                            url: response, // pID is going to be changed with userID for single profile picture only
                            id: groupID,
                            'bucket-name': config.amazon.bucketName,
                            source: 1,// 1 = google cloud storage
                            mediaType: 'image/' + fileType //image/jpeg
                        };
                        firebaseCtrl.asyncUpdateGroup(quizID, {'logo-image': logoImage})

                            .then(function (resolved) {

                                res.send({
                                    statusCode: 1,
                                    statusDesc: "groupProfilePicture updated.",
                                    url: response // get profile picture route from s3 amazon
                                });

                            }, function (error) {

                                res.send({
                                    statusCode: 0,
                                    statusDesc: "Internal Server Error."
                                });

                            })

                    } else {

                        res.send({
                            statusCode: 0,
                            statusDesc: "Invalid token."
                        });

                    }

                } else {

                }

            });

        }, function (error) {

            res.send({
                statusCode: 0,
                statusDesc: "Error occured while saving picture."
            });

        });
    } catch (e) {

        res.send({
            statusCode: 0,
            statusDesc: "internal Server error"
        });
    }

};
module.exports.saveSubGroupProfilePicture = function (filePath, userID, groupID, subgroupID, token, res, bucketID, _fileType) {
    try {

        var that = this;
        if (Object.keys(filePath).length) {

            var fileType = _fileType || (filePath.type && filePath.type.split('/')[1]) || 'png'

        } else {

            return errorHadler('No file soruce present.', res);
        }

        if (!userID) {
            return errorHadler('userID is not defined', res);

        }

        if (!groupID) {
            return errorHadler('groupID is not defined', res);

        }

        if (!subgroupID) {
            return errorHadler('subgroupID is not defined', res);

        }

        if (!token) {

            return errorHadler('token is not defined', res);

        }

        that.putFile(filePath, subgroupID, bucketID, fileType,subgroupID).then(function (response) {

            User.findOne({userID: userID}, function (err, user) {
                if (err) {

                    res.send({
                        statusCode: 0,
                        statusDesc: "error occurred."
                    });

                } else if (user) {

                    if (user.token === token) {
                        var logoImage = {
                            url: response, // pID is going to be changed with userID for single profile picture only
                            id: subgroupID,
                            'bucket-name': config.amazon.bucketName,
                            source: 1,// 1 = google cloud storage
                            mediaType: 'image/' + fileType //image/jpeg
                        };
                        firebaseCtrl.asyncUpdateSubGroup(groupID, subgroupID, {'logo-image': logoImage})

                            .then(function (resolved) {

                                res.send({
                                    statusCode: 1,
                                    statusDesc: "subGroupProfilePicture updated.",
                                    url: response // get profile picture route from s3 amazon
                                });

                            }, function (error) {

                                res.send({
                                    statusCode: 0,
                                    statusDesc: "Internal Server Error."
                                });

                            })

                    } else {

                        res.send({
                            statusCode: 0,
                            statusDesc: "Invalid token."
                        });

                    }

                } else {

                }

            });

        }, function (error) {

            res.send({
                statusCode: 0,
                statusDesc: "Error occured while saving picture."
            });

        });
    } catch (e) {

        res.send({
            statusCode: 0,
            statusDesc: "internal Server error"
        });
    }

};
/*
module.exports.update = function(filePath, pID, res){
//todo:: depricated as we r using only save for both apis
    var that = this;

    that.putFile(filePath, pID).then(function(response){

       res.status(200);
       res.json({success:true, url:config.domain+"/presentation/"+pID});

    }, function(error){

        res.status(500);
        res.json({success:false, error:error});
    });

};
*/

module.exports.serveProfilePicture = function(userID, token, res, bucketID){

    var that = this;
    User.findOne({userID:userID},function(err,user){
        if(err){

            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });

        }else if( user ){

            if(user.token === token){

                that.getFile(userID,bucketID).then(function(profilePicture){// user ID will be used as file id on amazon

                    res.send({
                        statusCode: 1,
                        statusDesc: "error occurred.",
                        //profilePicture : profilePicture.toString("utf-8")
                        profilePicture :'data:image/png;base64,'+ profilePicture.toString('base64')
                    });


                }, function(error){

                        res.send({
                            statusCode: 0,
                            statusDesc: "error occurred."
                        });

                    // res.end("Oops, Some error occurred and presentation could not be opened!");
                });

            }else{

                res.send({
                    statusCode: 0,
                    statusDesc: "Invalid token."
                });

            }

        }else{

            res.send({
                statusCode: 0,
                statusDesc: "Invalid userID."
            });
        }

    });


};

module.exports.serveGroupProfilePicture = function(userID, token, res, bucketID){

    var that = this;
    User.findOne({userID:userID},function(err,user){
        if(err){

            res.send({
                statusCode: 0,
                statusDesc: "error occurred."
            });

        }else if( user ){

            if(user.token === token){

                that.getFile(userID,bucketID).then(function(profilePicture){// user ID will be used as file id on amazon

                    res.send({
                        statusCode: 1,
                        statusDesc: "error occurred.",
                        profilePicture : profilePicture.toString("utf-8")
                    });


                }, function(error){

                    res.send({
                        statusCode: 0,
                        statusDesc: "error occurred."
                    });

                    // res.end("Oops, Some error occurred and presentation could not be opened!");
                });

            }else{

                res.send({
                    statusCode: 0,
                    statusDesc: "Invalid token."
                });

            }

        }else{

            res.send({
                statusCode: 0,
                statusDesc: "Invalid userID."
            });
        }

    });


};

module.exports.removeFile = function(pID){

    var result = Q.defer();

//    return amazonServices.remove(pID).then(function(s3Response){
    amazonServices.remove(pID).then(function(s3Response){
        result.resolve({success:true});
    }, function(err){
        result.reject(err);
    });


    return result.promise;
};
module.exports.getAmazonUrl = function(req,res,bucketType){
    switch(bucketType){
        case 'user':amazonServices.userPictureUpload(req,res,bucketType);break;
        case 'group': amazonServices.groupPictureUpload(req,res,bucketType);break;
        case 'subgroup':amazonServices.subgrouopPictureUpload(req,res,bucketType);break
        case 'quizbank':amazonServices.quizbankPictureUpload(req,res,bucketType);break

    }

};

module.exports.putFile = function(filePath, pID, bucketType, fileType){

    var result = Q.defer();

        fs.readFile(filePath.path, function (err, data) {
            fs.unlink(filePath.path);
            if(err){
                result.reject(err);
            }
            var base64data = new Buffer(data, 'binary');
           return amazonServices.upload(base64data, pID, bucketType, fileType).then(function(s3Response){
           //return amazonServices.upload(data, pID, bucketType, fileType).then(function(s3Response){
               result.resolve(s3Response);
           }, function(err){
               result.reject(err);
           });

        });

    return result.promise;
};

module.exports.getFile = function(fileID,bucketID){

    var result = Q.defer();

   amazonServices.download(fileID,bucketID).then(function(presentation){
       result.resolve(presentation);
    }, function(error){
       result.reject(error);
    });

    return result.promise;
};

module.exports.init = function(){
    amazonServices.init();
};
function errorHadler(errStr,res){
    res.send({
        statusCode: 0,
        statusDesc: errStr
    });
    res.end()
}
/*
* Team.findOne({name: req.body.team}, function(err, teamData){
 if(teamData){
 teamData.score += 1
 teamData.save(function(err) {
 if (err) // do something
 });
 }else{
 console.log(err);
 }
 });*/

