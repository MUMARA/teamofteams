/**
 * Created by ZiaKhan on 22/12/14.
 */

//read http://webapplog.com/express-js-4-node-js-and-mongodb-rest-api-tutorial/

var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');

//initializing local DB Server
require('./config/mongoose')();

var signUpCtrl = require('./app/controllers/signup'),
    signInCtrl = require('./app/controllers/signin'),
    forgotCtrl = require('./app/controllers/forgot'),
    verifyEmailCtrl = require('./app/controllers/verifyEmail'),
    usersCtrl = require('./app/controllers/users'),
    notification = require('./app/controllers/notification');
    //activityStreamCtrl = require('./app/controllers/activityStreams');

var amazonServiceRoutes = require('./amazonServices/routeManager');
var profilePictureManager = require('./amazonServices/profilePictureManager/profilePictureManager');

var app = express();

app.respRef = '';

var formidable = require('formidable');


app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));

//using morgan logger
app.use(morgan('dev'));

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    res.send('Panacloud WOW api are running, please select a api, e.g., /api/signup')
});

amazonServiceRoutes.setupRoutes(app);
profilePictureManager.init();

app.get('/api/env', function(req, res) {
    res.send(process.env.NODE_ENV);
});
app.get('/api/verifyemail/:uuid', verifyEmailCtrl.verifyEmail);
app.get('/api/checkuserid/:userID', usersCtrl.checkAvailability);

app.post('/api/signup', signUpCtrl.signUp);
app.post('/api/signin', signInCtrl.signIn);

app.post('/api/forgotpassword', forgotCtrl.forgotPassword);
app.post('/api/changepassword', usersCtrl.changeUserPassword);
app.post('/api/checkpassword', usersCtrl.checkUserPassword);
app.post('/api/edituser', usersCtrl.editUser);
app.post('/api/deleteuser', usersCtrl.removeUser);

app.post('/api/sendnotification', notification.sendNotification);
app.post('/api/registerdevice', notification.registerDevice);
app.post('/api/unregisterdevice', notification.unregisterDevice);

//app.post('/api/activitystream', activityStreamCtrl.activityStreams);

process.on('uncaughtException', function(err) {
    console.error(err);
    console.log("Node NOT Exiting...");
    console.log(err)

});
app.listen(app.get('port'), function() {
    console.log("Panacloud REST API Node app is running at localhost:" + app.get('port'));
});
