/**
 * Created by Mehmood on 5/21/2015.
 */
(function () {
    'use strict';
    angular.module('app.signin', ['core'])
    .factory('singInService', ['firebaseService', '$state', '$q', 'authService', "$location", "messageService",
    function (firebaseService, $state, $q, authService, $location, messageService) {

        return {
            'login': function (user, location) {

                var defer = $q.defer();
                authService.login(user, function (data) {
                    messageService.showSuccess('Login successful');
                    //firebaseService.addUpdateHandler();
                    // $location.path(location + data.user.userID);

                    //region Service Worker
                    //checking if service workder supported then add subcription in firebase
                    console.log('running serviceWorkerrrrr......... from singin');
                    if ('serviceWorker' in navigator) {

                        // user-push-notifications => userId => windows => browser => pushID => subcription

                        // SUBSCRIBING FOR PUSH NOTIFICATIONS
                        navigator.serviceWorker.ready.then(function (reg) {
                            reg.pushManager.subscribe({ userVisibleOnly: true }).then(function (sub) {

                                var sBrowser, sPlatfrom, userID = data.user.userID, subcription = sub.toJSON(),
                                    sUsrAg = navigator.userAgent,
                                    sUsrPlt = navigator.platform,
                                    userObj = { browser: "", platform: "", subcription: "" };

                                console.log('Subcription: ', subcription);

                                if (sUsrAg.indexOf("Chrome") > -1) {
                                    sBrowser = "GoogleChrome";
                                } else if (sUsrAg.indexOf("Safari") > -1) {
                                    sBrowser = "AppleSafari";
                                } else if (sUsrAg.indexOf("Opera") > -1) {
                                    sBrowser = "Opera";
                                } else if (sUsrAg.indexOf("Firefox") > -1) {
                                    sBrowser = "MozillaFirefox";
                                } else if (sUsrAg.indexOf("MSIE") > -1) {
                                    sBrowser = "MicrosoftInternetExplorer";
                                } else {
                                    sBrowser = "OtherBrowser"
                                }

                                if (sUsrPlt.indexOf('Mac') > -1) {
                                    sPlatfrom = "Mac";
                                } else if (sUsrPlt.indexOf("Linux") > -1) {
                                    sPlatfrom = "Linux";
                                } else if (sUsrPlt.indexOf("Win") > -1) {
                                    sPlatfrom = "Windows";
                                } else if (sUsrPlt.indexOf("Android") > -1) {
                                    sPlatfrom = "Android";
                                } else if (sUsrPlt.indexOf("Linux") > -1) {
                                    sPlatfrom = "Linux";
                                } else if (sUsrPlt.indexOf("iPhone") > -1 || sUsrPlt.indexOf("iPad") > -1) {
                                    sPlatfrom = "IOS";
                                } else {
                                    sBrowser = "OtherOS"
                                }

                                userObj = { browser: sBrowser, platform: sPlatfrom, subcription: subcription }

                                console.dir(userObj, firebaseService.getRefMain());
                                
                                var newRef = firebaseService.getRefMain().child("user-push-notifications").child(userID).child(sPlatfrom).child(sBrowser);
                                newRef.once('value', function(snapshot) {
                                   if(snapshot.val()) {
                                       for(var pushId in snapshot.val()) {
                                         newRef.child(pushId).update(subcription, function(err) {
                                             if (err) {
                                                console.log('watch Error on update subcription on firebase: ', err);
                                            } else {
                                                console.log('watch Updated subcription on firebase');
                                            }
                                         });  
                                       }
                                   } else {
                                       newRef.push(subcription, function (err) {
                                            if (err) {
                                                console.log('watch Error on add subcription on firebase: ', err);
                                            } else {
                                                console.log('watch Added subcription on firebase');
                                            }
                                       });
                                   }
                                });

                            }).catch(function (e) {
                                // Permission denied or an error occurred
                                console.log('Permission denied  :^( ');

                                ref.child("user-errors").child('on-permission').push(e.toJSON(), function (err) {
                                    console.log('FB: ', err);
                                });
                            });
                        });

                    } //if 'serviceWorker'
                    //endregion Service Worker

                    $state.go('user.dashboard', { userID: data.user.userID })
                    defer.resolve()
                }, function (data) {
                    if (data) {
                        if (data.statusCode == 0) {
                            messageService.showFailure(data.statusDesc);
                        } else {
                            messageService.showFailure('Network Error Please Submit Again');
                        }
                    } else {
                        messageService.showFailure('Network Error Please Submit Again');
                    }
                    defer.reject(data)
                });
                return defer.promise;
            }
        }
    }]);
})();
