/**
 * Created by ZiaKhan on 22/12/14.
 */

/*requires modules*/
var superagent = require('superagent');
var expect = require('expect.js');
var http = require('http');
var firebaseTestApi = require('./apiserver.firebase.test.js');

var config = {
    //for http server
    PORT: 3000,
    //timeout config for each "it" declaration.
    TIMEOUT: 5000,
    //application configurations e.g BASE_URL
    app: {
        //BASE_URL: "https://panacloudapi.herokuapp.com/api/"
        BASE_URL: "http://localhost:3000/api/"
    },
    //user credentials can be used in following tests
    testUser: {
        email: 'panacloudservice@gmail.com',
        password : '123456',
        firstName : 'Pana',
        lastName : 'Cloud',
        userID : 'panacloud67344',
        token: '', //to be stored on login test.
        groupID : 'testgroup',
        // TODO should be dynamic to resolve validity issues.
        devices: {
            android: "APA91bFS6o8Ycd2s_22uVnhwEsdwRM0PhBM3EXdtrN2qWEDP4CYlbBLKEWkqO9_yF0F8aAv94zjFsD5rvJdzf6oDjeysIHgtTNdLmDko0sdhwpo39kMNslz04Vb4529BJS3T43QLDpGi5vCISv4it7fcJVZV-XYndNVUfrqAmm1_UAeBmP4fZDSnD4X5CJykV7uE0BOB0Xu8"
        }
    },
    testGroup: {
        groupID: 'testgroup1',
        title: 'Test Group',
        desc: 'Group created for testing purpose'
        //other field will be injected from firebase test API.
    }
};

//create a server for firebase authentication
http.createServer(function( req, res ){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, Automated Attendance System!\n');
}).listen(config.PORT);


/*test declarations*/
describe('express rest api server', function(){
    //this.timeout(10000);

    it('should sign-up successfully', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'signup')
            .send(config.testUser)
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(1);
                expect(typeof res.body.statusDesc).to.eql('string');
                expect(res.body.uid).not.to.be(undefined);
                done();
            });
    });

    it('should fail signing-up again with same credentials', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'signup')
            .send(config.testUser)
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(2); //email address already used.
                expect(typeof res.body.statusDesc).to.eql('string');
                expect(res.body.uid).to.be(undefined);
                done();
            });
    });

    it('should sign-in successfully with valid credentials', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'signin')
            .send({
                email: config.testUser.email,
                password : config.testUser.password
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(1);
                expect(typeof res.body.statusDesc).to.eql('string');
                expect(typeof res.body.user).to.eql('object');
                expect(res.body.user.token).not.to.be(undefined);

                config.testUser.token = res.body.user.token;
                done();
            });
    });

    it('should fail signing-in with invalid credentials', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'signin')
            .send({
                email: config.testUser.email,
                password : 'invalidpassword'
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(0);
                expect(typeof res.body.statusDesc).to.eql('string');
                expect(res.body.user).to.be(undefined);
                done();
            });
    });

    //authenticate from firebase.
    it('should login server from firebase', function(){
        this.timeout(8000);

        var promise = firebaseTestApi.authenticateServer();
        promise.finally(function(){
            expect( promise.inspect().state ).to.eql('fulfilled');
            done();
        });
    });

    /*all tests that requires user to be logged in*/

    it('should register android device', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'registerdevice')
            .send({
                userID: config.testUser.userID,
                token: config.testUser.token,
                devices: {
                    android: config.testUser.devices.android
                }
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(1);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });

    it('should not register same android device', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'registerdevice')
            .send({
                userID: config.testUser.userID,
                token: config.testUser.token,
                devices: {
                    android: config.testUser.devices.android
                }
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(0);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });

    it('should create a new group via firebaseTestApi.', function ( done ) {
        this.timeout(8000);

        var promise = firebaseTestApi.createGroup( config.testGroup, config.testUser.userID );
        promise.finally(function(){
            expect( promise.inspect().state ).to.eql('fulfilled');
            done();
        });

    });

    it('should send a push notification to all group members\'s devices', function(done){
        //this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'sendnotification')
            .send({
                title: 'Test',
                message: 'This is a test notification.',
                groupID: config.testGroup.groupID,
                userID: config.testUser.userID,
                token: config.testUser.token
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(1);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });

    it('should not send a push notification with invalid payload', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'sendnotification')
            .send({
                title: 'Test',
                message: 'This is a test notification.',
                groupID: 'invalidgroupid11',
                userID: config.testUser.userID,
                token: config.testUser.token
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(0);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });

    it('should remove user\'s android device', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'unregisterdevice')
            .send({
                userID: config.testUser.userID,
                token: config.testUser.token,
                devices: {
                    android: config.testUser.devices.android
                }
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(1);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });

    it('should not remove user\'s same android device', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'unregisterdevice')
            .send({
                userID: config.testUser.userID,
                token: config.testUser.token,
                devices: {
                    android: config.testUser.devices.android
                }
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(0);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });

    /*Removes user*/
    it('should delete user', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'deleteuser')
            .send({
                userID: config.testUser.userID,
                password: config.testUser.password,
                token: config.testUser.token
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(1);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });

    it('should not get sign in with credentials of deleted user', function(done){
        this.timeout(config.TIMEOUT);
        superagent.post(config.app.BASE_URL + 'signin')
            .send({
                email: config.testUser.email,
                password : config.testUser.password
            })
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(0);
                expect(typeof res.body.statusDesc).to.eql('string');
                expect(res.body.user).to.be(undefined);
                done();
            });
    });

    it('should confirm that the userID ( ' + config.testUser.userID + ' ) is available for new sign-up', function(done){
        this.timeout(config.TIMEOUT);
        superagent.get(config.app.BASE_URL + 'checkuserid/' + config.testUser.userID)
            .send()
            .end(function(e, res){
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.statusCode).to.eql(1);
                expect(typeof res.body.statusDesc).to.eql('string');
                done();
            });
    });
});
