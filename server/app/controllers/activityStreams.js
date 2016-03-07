'use strict';

/*requires modules*/
var fireHandler = require("./fireHandler");

//activity Streams
exports.activityStreams = function(req, res) {

    console.log('activityStreams', req.body);

    var _activity = {
        actor: {
            "type": "user",
            "id": req.body.activity.actor.id, //this is the userID, and an index should be set on this
            "email": req.body.activity.actor.email,
            "displayName": req.body.activity.actor.displayName,
            'profile-image': req.body.activity.actor['profile-image']
        },
        object: {
            "type": req.body.activity.object.type,
            "id": req.body.activity.object.id, //an index should be set on this
            "email": req.body.activity.object.email,
            "displayName": req.body.activity.object.displayName
            //"seen": false
        },
        displayName: req.body.activity.displayName,
        language: req.body.activity.language,
        published: req.body.activity.published,
        seen: false,
        target: {
            "type": req.body.activity.target.type,
            "id": req.body.activity.target.id,
            "url": req.body.activity.target.url,
            "displayName": req.body.activity.target.displayName
        },
        groupID: req.body.activity.groupID
    };

    fireHandler.addActivityStream(_activity, function(err, data) {
        if (err) {
            res.send({
                statusCode: 0,
                statusDesc: "error occurred while adding activity streams."
            });
        } else {
            res.send({
                statusCode: 1,
                statusDesc: "activity stream insert successfully."
            });
        }

    });
}
