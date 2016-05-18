/**
 * Created with JetBrains WebStorm.
 * User: Khurram
 * Date: 12/11/14
 * Time: 10:57 AM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

var profilePictureManager = require("./profilePictureManager");
var formidable = require("formidable");

var routes = {
    config: [{
            method: 'saveUserProfilepicture',
            httpVerb: 'post',
            url: 'api/profilepicture',
            params: []
        }, {
            method: 'saveuserprofilepicture',
            httpVerb: 'get',
            url: 'api/saveuserprofilepicture',
            params: []
        }, {
            method: 'removeUserProfilepicture',
            httpVerb: 'delete',
            url: 'api/profilepicture/:userID/:token',
            params: ['pid']
        }, {
            method: 'serveUserProfilepicture',
            httpVerb: 'get',
            url: 'api/profilepicture/:userID',
            params: ['pid']
        },
        //======================================
        {
            method: 'saveGroupProfilePicture',
            httpVerb: 'post',
            url: 'api/groupProfilepicture',
            params: []
        }, {
            method: 'savegroupprofilepicture',
            httpVerb: 'get',
            url: 'api/savegroupprofilepicture',
            params: []
        },

        {
            method: 'removeGroupProfilePicture',
            httpVerb: 'delete',
            url: 'api/groupProfilepicture/:groupID/:token',
            params: ['pid']
        }, {
            method: 'serveGroupProfilePicture',
            httpVerb: 'get',
            url: 'api/groupProfilepicture/:groupID',
            params: ['pid']
        },
        //======================================
        {
            method: 'saveSubGroupProfilePicture',
            httpVerb: 'post',
            url: 'api/subGroupProfilepicture',
            params: []
        }, {
            method: 'savesubgroupprofilepicture',
            httpVerb: 'get',
            url: 'api/savesubgroupprofilepicture',
            params: []
        },
        //======================================
        {
            method: 'saveQuizBookPicture',
            httpVerb: 'post',
            url: 'api/saveQuizBookPicture',
            params: []
        }, {
            method: 'savequizBookPicture',
            httpVerb: 'get',
            url: 'api/savequizBookPicture',
            params: []
        },
        //======================================
        {
            method: 'saveQuestionBankPicture',
            httpVerb: 'post',
            url: 'api/saveQuestionBankPicture',
            params: []
        }, {
            method: 'saveQuestionBankPicture',
            httpVerb: 'get',
            url: 'api/savequestionBankPicture',
            params: []
        }
    ],

    saveUserProfilepicture: function(req, res) {

        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {

            console.log(fields.token);
            if (Object.keys(files).length) {
                profilePictureManager.saveUserProfilepicture(files['source'], fields.userID, fields.token, res, 'user');
            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "User did not send any file to Upload."
                });
            }
        });

    },
    removeUserProfilepicture: function(req, res) {

        profilePictureManager.remove(req.params.userID, req.query.token, res, 'user');

    },



    serveUserProfilepicture: function(req, res) {

        profilePictureManager.serveProfilePicture(req.params.userID, req.query.token, res, 'user');

    },


    //    ===================== group Profile Picture===========================

    'saveGroupProfilePicture': function(req, res) {

        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {

            if (Object.keys(files).length) {

                profilePictureManager.saveGroupProfilePicture(files['source'], fields.userID, fields.groupID, fields.token, res, 'group');

            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "User did not send any file to Upload."
                });
            }

        });

    },

    removeGroupProfilePicture: function(req, res) {

        profilePictureManager.remove(req.params.groupID, req.params.token, res, 'group');

    },
    /*serveGroupProfilePicture:function(req, res){

        profilePictureManager.serveGroupProfilePicture(req.params.groupID, req.query.token , res, 'group');

    },*/

    'saveSubGroupProfilePicture': function(req, res) {

        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {

            if (Object.keys(files).length) {

                profilePictureManager.saveSubGroupProfilePicture(files['source'], fields.userID, fields.groupID, fields.subgroupID, fields.token, res, 'subgroup');

            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "User did not send any file to Upload."
                });
            }

        });

    },
    'savegroupprofilepicture': function(req, res) {
        checkFileType(req, res)
        if (!req.query.groupID) {
            res.send({
                statusCode: 0,
                statusDesc: "groupID required"
            });
            return;
        }
        profilePictureManager.getAmazonUrl(req, res, 'group')

    },
    'saveuserprofilepicture': function(req, res) {

        checkFileType(req, res)
        if (!req.query.userID) {
            res.send({
                statusCode: 0,
                statusDesc: "userID required"
            });
            return;
        }
        profilePictureManager.getAmazonUrl(req, res, 'user')

    },
    'savesubgroupprofilepicture': function(req, res) {

        checkFileType(req, res)
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

        }
        profilePictureManager.getAmazonUrl(req, res, 'subgroup')

    },

    /*quiz bank api*/

    'saveQuizBookPicture': function(req, res) {

        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {

            if (Object.keys(files).length) {

                profilePictureManager.saveQuizBookPicture(files['source'], fields.userID, fields.quizID, fields.token, res, 'quizbank');

            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "User did not send any file to Upload."
                });
            }

        });

    },

    'savequizBookPicture': function(req, res) {
        checkFileType(req, res)
        if (!req.query.quizID) {
            res.send({
                statusCode: 0,
                statusDesc: "quizID required"
            });
            return;
        }
        profilePictureManager.getAmazonUrl(req, res, 'quizbank')

    },

    /*question bank api*/

    'saveQuestionBankPicture': function(req, res) {

        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {

            if (Object.keys(files).length) {

                profilePictureManager.saveQuestionBookPicture(files['source'], fields.userID, fields.quizID, fields.token, res, 'questionbank');

            } else {
                res.send({
                    statusCode: 0,
                    statusDesc: "User did not send any file to Upload."
                });
            }

        });

    },

    'savequestionBankPicture': function(req, res) {
        checkFileType(req, res)
        if (!req.query.quizID) {
            res.send({
                statusCode: 0,
                statusDesc: "quuestionBankID required"
            });
            return;
        }
        profilePictureManager.getAmazonUrl(req, res, 'questionbank')

    }

};

function checkFileType(req, res) {
    var exp = /^.*\/(jpg|jpeg|gif|JPG|png|PNG)$/;
    if (!req.query.file_type) {
        res.send({
            statusCode: 0,
            statusDesc: "file_type required"
        });
        return;
    } else {
        if (!exp.test(req.query.file_type)) {
            res.send({
                statusCode: 0,
                statusDesc: 'file_type should match "image/png" or "image/< any of the following > --(jpg|jpeg|gif|JPG|png|PNG)"'
            });
        }
    }
}
module.exports = routes;
