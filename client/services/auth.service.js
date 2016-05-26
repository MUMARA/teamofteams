/**
 * Created by ZiaKhan on 16/12/14.
 */
'use strict';

// Create the 'example' controller
angular.module('core')
    .factory('authService', ["$state", "dataService", "userPresenceService", "messageService", "$q", "$http", "appConfig", "$firebaseAuth", "$location", "firebaseService", "userService",
        function($state, dataService, userPresenceService, messageService, $q, $http, appConfig, $firebaseAuth, $location, firebaseService, userService) {

            return {
                //userData: null,

                login: function(userCred, successFn, failureFn) {
                    var self = this;
                    $http.defaults.headers.post["Content-Type"] = "text/plain";
                    // $http.post(appConfig.apiBaseUrl + '/api/signin', userCred).
                    $http.post(appConfig.apiBaseUrl + '/signin', userCred).
                    success(function(data, status, headers, config) {

                        // this callback will be called asynchronously
                        // when the response is available
                        //self.userData = data.user;
                        if (data.statusCode != 0) {
                            //$sessionStorage.loggedInUser = data.user;
                            userService.setCurrentUser(data.user);
                            //firebaseService.asyncLogin($sessionStorage.loggedInUser.userID, $sessionStorage.loggedInUser.token)
                            firebaseService.asyncLogin(userService.getCurrentUser().userID, userService.getCurrentUser().token)
                                .then(function() {
                                    successFn(data);
                                    // dataService.loadData();
                                }, function(error) {
                                    if (error) {
                                        console.error("Firebase Authentication failed: ", error);
                                        failureFn();
                                    }
                                })

                        } else {
                            failureFn(data);
                        }

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //console.log('login error response object: ' + JSON.stringify(status));
                        failureFn();
                    });

                },
                forgotPassword: function(userCred) {
                    var defer = $q.defer();
                    $http.defaults.headers.post["Content-Type"] = "text/plain";
                    // $http.post(appConfig.apiBaseUrl + '/api/forgotpassword', userCred)
                    $http.post(appConfig.apiBaseUrl + '/forgotpassword', userCred)
                        .success(function(data, status, headers, config) {
                            if (data.statusCode === 1) {
                                defer.resolve(data.statusDesc);
                            } else {
                                defer.reject(data.statusDesc);
                            }
                        })
                        .error(function(data, status, headers, config) {
                            console.log('forgot error response object: ' + JSON.stringify(data));
                            defer.reject('Error occurred in sending data. Please try again.');
                        });

                    return defer.promise;
                },
                signup: function(userInfo, successFn, failureFn) {
                    var self = this;
                    $http.defaults.headers.post["Content-Type"] = "text/plain";
                    // $http.post(appConfig.apiBaseUrl + '/api/signup', {
                    $http.post(appConfig.apiBaseUrl + '/signup', {
                        email: userInfo.email,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        password: userInfo.password,
                        userID: userInfo.userID
                    }).
                    success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        //console.log("response: " + data);
                        //console.log('signup response object: ' + JSON.stringify(data));
                        successFn(data);
                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        failureFn();
                    });
                },
                logout: function() {
                    //empty data in dataservice
                    dataService.unloadData();
                    userPresenceService.removeCurrentConRef();
                    // for manually sign out from firebase.
                    userService.removeCurrentUser();
                    firebaseService.logout();
                    Firebase.goOffline();
                    $state.go('signin');
                },
                //to resolve route "/user/:user" confirming is authenticated from firebase
                resolveUserPage: function() {
                    // alert('inside authService');
                    var defer = $q.defer();
                    // console.log('1')
                    if (userService.getCurrentUser() && userService.getCurrentUser().userID) {
                        // console.log('2')
                        if (appConfig.firebaseAuth) {
                            dataService.loadData();
                            defer.resolve();
                            // console.log('3')
                        } else {
                            //firebaseService.asyncLogin( $sessionStorage.loggedInUser.userID, $sessionStorage.loggedInUser.token )
                            firebaseService.asyncLogin(userService.getCurrentUser().userID, userService.getCurrentUser().token)
                                .then(function() {
                                    //console.info("Firebase Authentication Successful when restarting app");
                                    firebaseService.addUpdateHandler();
                                    dataService.loadData();
                                    defer.resolve();
                                    // console.log('4')
                                }, function(error) {
                                    if (error) {
                                        console.log("Firebase Authentication failed: ", error);
                                        $location.path('/signin')
                                        // console.log('5')
                                    }
                                });
                        }
                    } else {
                        console.log("No user logged in");
                        $location.path('/signin')
                        // console.log('6')
                    }
                    // console.log('7')
                    return defer.promise;
                },
                resolveDashboard: function(userID){
                    var defer = $q.defer();
                    // console.log('a1')
                    if (userService.getCurrentUser() && userID !== userService.getCurrentUser().userID) {
                        $location.path('/profile/' + userID)
                        // console.log('a2')
                        // $state.go('user.dashboard', {userID: user.userID})
                    } else {
                        defer.resolve();
                        // console.log('a3')
                    }
                    return defer.promise;
                }
            };
        }
    ]);
