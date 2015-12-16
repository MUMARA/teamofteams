/**
 * Created by ZiaKhan on 16/12/14.
 */
'use strict';

// Create the 'example' controller
angular.module('core')
    .factory('authService', ["$q", "$http", "appConfig", "$firebaseAuth", "$localStorage", "$location",
        "$sessionStorage", "firebaseService",
        function($q, $http, appConfig, $firebaseAuth, $localStorage, $location, $sessionStorage,
            firebaseService) {

            return {
                //userData: null,

                login: function(userCred, successFn, failureFn) {
                    var self = this;
                    $http.post(appConfig.apiBaseUrl + '/api/signin', userCred).
                    success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        //self.userData = data.user;
                        if (data.statusCode != 0) {
                            //$sessionStorage.loggedInUser = data.user;
                            $localStorage.loggedInUser = data.user;
                            //console.log('login response object: ' + JSON.stringify(data));

                            //firebaseService.asyncLogin($sessionStorage.loggedInUser.userID, $sessionStorage.loggedInUser.token)
                            firebaseService.asyncLogin($localStorage.loggedInUser.userID, $localStorage.loggedInUser.token)
                                .then(function(response) {
                                    successFn(data, response);
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

                    $http.post(appConfig.apiBaseUrl + '/api/forgotpassword', userCred)
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
                    $http.post(appConfig.apiBaseUrl + '/api/signup', {
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
                    // console.info('signing out');
                    $location.path("/");
                    // for manually sign out from firebase.
                    firebaseService.getRefMain().unauth();
                    Firebase.goOffline();
                    //delete $sessionStorage.loggedInUser;
                    delete $localStorage.loggedInUser;
                },
                //to resolve route "/user/:user" confirming is authenticated from firebase
                resolveUserPage: function() {
                    //alert('inside authService');
                    var defer = $q.defer();
                    //if ( $sessionStorage.loggedInUser ) {
                    if ($localStorage.loggedInUser) {
                        if (appConfig.firebaseAuth) {
                            defer.resolve();
                        } else {
                            //firebaseService.asyncLogin( $sessionStorage.loggedInUser.userID, $sessionStorage.loggedInUser.token )
                            firebaseService.asyncLogin($localStorage.loggedInUser.userID, $localStorage.loggedInUser.token)
                                .then(function(response) {
                                    //console.info("Firebase Authentication Successful when restarting app");
                                    firebaseService.addUpdateHandler();
                                    defer.resolve();
                                }, function(error) {
                                    if (error) {
                                        console.log("Firebase Authentication failed: ", error);
                                        $location.path("/signin");
                                    }
                                });
                        }
                    } else {
                        console.log("No user logged in");
                        $location.path("/signin");
                    }

                    return defer.promise;
                },
                test: function() {
                    var defer = $q.defer();

                    // alert('inside authService');
                    return defer.promise;
                }
            };
        }
    ]);
