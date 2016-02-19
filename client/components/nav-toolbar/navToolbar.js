(function() {
    'use strict';

    angular.module('app.navToolbar')

    .controller('NavToolbarController', ['ProgressReportService', '$mdSidenav', '$mdDialog', '$mdMedia','$scope','$q','$rootScope', 'soundService', 'messageService', '$timeout', '$firebaseArray', 'navToolbarService', 'authService', '$firebaseObject', 'firebaseService', 'userService', '$state',  '$location', 'checkinService',
        function(ProgressReportService, $mdSidenav, $mdDialog, $mdMedia, $scope, $q, $rootScope, soundService, messageService, $timeout, $firebaseArray, navToolbarService, authService, $firebaseObject, firebaseService, userService, $state, $location, checkinService) {
            /*private variables*/
            // alert('inside controller');

            var self = this;
            var userID = userService.getCurrentUser().userID;
            self.myUserId = userID;
            /*VM properties*/

            this.checkinObj = {
                newStatus: {}
            };
            this.checkout = false;
            this.showUrlObj = {};
            this.switchMsg = false;
            this.userImgClickCard = false;
            this.groups = {};
            this.ListGroupSubGroup = [];
            this.subgroups = [];
            this.filteredGroups;
            this.groupObj1;
            this.currentLocation = {};
            //this.userObj2;
            this.switchCheckIn = false;
            this.isProgressReport = false;
            var firebaseTimeStamp = Firebase.ServerValue.TIMESTAMP;     //Firebase TimeStamp

            /*VM function ref*/
            this.logout = logout;
            this.PersonalSetting = PersonalSetting;
            this.showSubGroup = showSubGroup;
            this.shiftToUserPage = shiftToUserPage;
            //this.doChange = doChange;
            this.updateStatus = updateStatus;

            //if report not submitted show switchMsg
            this.isDailyProgessSubmit = false;
            this.todayDate = Date.now();

            //this.logout = logout;
            this.queryGroups = queryGroups;
            this.quizStart = quizStart

            this.progressReport = function(){
              $mdSidenav('right').toggle().then(function(){
                self.openNav = !self.openNav;
              });
            }
                // alert(this.test)
            this.setFocus = function() {
                document.getElementById("#GroupSearch").focus();
            }

            function quizStart() {
                // console.log('done')
                // $location.path('/user/' + userService.getCurrentUser().userID + '/quiz')
                $state.go('user.quiz', {userID: userService.getCurrentUser().userID})
            }

            //this.userObj = $firebaseObject(firebaseService.getRefUsers().child(userID))

            $firebaseObject(firebaseService.getRefUsers().child(userID))
                .$loaded().then(function(data) {
                    //debugger;
                    $rootScope.userImg = data['profile-image'];
                    // console.log(data)
                })
                .catch(function(error) {
                    console.error("Error:", error);
                    soundService.playFail('Error occurred.');
            });

            // $firebaseObject(checkinService.getRefSubgroupCheckinCurrentByUser().child(userID)).$loaded().then(function(snapshot) {
            //     if (snapshot.type == 1 && snapshot.groupID && snapshot.subgroupID) {
            //         self.checkout = true;
            //         self.switchCheckIn = true;
            //         self.showUrlObj.userID = userID;
            //         self.showUrlObj.groupID = snapshot.groupID;
            //         self.showUrlObj.subgroupID = snapshot.subgroupID;
            //     }
            // }, function(e) {
            //     console.log(e)
            // });

        //using multipath -- START --

            self.subGroupHasPolicy = false;
            self.subGroupPolicy = {};
            function checkingHasPolicy(groupID, subgroupID, cb) {
                firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).once('value', function(snapshot) {
                    self.subGroupHasPolicy = (snapshot.val() && snapshot.val().hasPolicy) ? snapshot.val().hasPolicy : false;
                    // console.log('subGroupHasPolicy', self.subGroupHasPolicy);

                    if(self.subGroupHasPolicy) {
                        firebaseService.getRefPolicies().child(groupID).child(snapshot.val().policyID).once('value', function(policy){
                            self.subGroupPolicy = policy.val();
                            cb(true);
                            // console.log('policy key', policy.key());
                            // console.log('policy val', policy.val());
                        }); //getting policy
                    } else {//self.subGroupHasPolicy if true
                        cb(false);
                    }
                });
            } //subgroupHasPolicy


            //using multipath -- END --


            checkinService.getRefSubgroupCheckinCurrentByUser().child(userID).on('value', function(snapshot, prevChildKey) {
                // console.log(snapshot.val());
                // console.log(snapshot.val().type);
                if (snapshot.val() && snapshot.val().type == 2) {
                    self.checkout = false;
                    self.switchCheckIn = false;
                    self.showUrlObj.userID = '';
                    self.showUrlObj.groupID = '';
                    self.showUrlObj.subgroupID = '';
                    // self.showUrlObj.recordref = '';
                } else if (snapshot.val() && snapshot.val().type == 1) {
                    self.checkout = true;
                    self.switchCheckIn = true;
                    self.showUrlObj.userID = userID;
                    self.showUrlObj.groupID = snapshot.val().groupID;
                    self.showUrlObj.subgroupID = snapshot.val().subgroupID;
                    // self.showUrlObj.recordref = snapshot.val()['record-ref'];
                }
            })

            checkinService.getRefSubgroupCheckinCurrentByUser().child(userID).on('child_changed', function(snapshot, prevChildKey) {
                // console.log(snapshot.val());
                // console.log(snapshot.val().type);
                if (snapshot.val() && snapshot.val().type == 2) {
                    self.checkout = false;
                    self.switchCheckIn = false;
                    self.showUrlObj.userID = '';
                    self.showUrlObj.groupID = '';
                    self.showUrlObj.subgroupID = '';
                    // self.showUrlObj.recordref = '';
                } else if (snapshot.val() && snapshot.val().type == 1) {
                    self.checkout = true;
                    self.switchCheckIn = true;
                    self.showUrlObj.userID = userID;
                    self.showUrlObj.groupID = snapshot.val().groupID;
                    self.showUrlObj.subgroupID = snapshot.val().subgroupID;
                    // self.showUrlObj.recordref = snapshot.val()['record-ref'];
                }
            })

            self.groups = $firebaseArray(firebaseService.getRefUserSubGroupMemberships().child(userID));

            /* VM and Helper Functions*/
            // this.userLocation = {};
            this.groupLocation = {};
            this.CalculateDistance = function(lat1, lon1, lat2, lon2, unit) {
                //:::    unit = the unit you desire for results                               :::
                //:::           where: 'M' is statute miles (default)                         :::
                //:::                  'K' is kilometers                                      :::
                //:::                  'N' is nautical miles                                  :::
                var radlat1 = Math.PI * lat1 / 180;
                var radlat2 = Math.PI * lat2 / 180;
                var radlon1 = Math.PI * lon1 / 180;
                var radlon2 = Math.PI * lon2 / 180;
                var theta = lon1 - lon2;
                var radtheta = Math.PI * theta / 180;
                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                dist = Math.acos(dist);
                dist = dist * 180 / Math.PI;
                dist = dist * 60 * 1.1515;
                if (unit == "K") {
                    dist = dist * 1.609344;
                }
                if (unit == "N") {
                    dist = dist * 0.8684;
                }
                return dist;
            };

            //Show Dailogue Box for Daily Report Questions -- START --
            var html = "<md-dialog aria-label=\"Daily Report\" ng-cloak> <form> <md-toolbar> <div class=\"md-toolbar-tools\"> <h2>Daily Progress Report</h2> <span flex></span> </div> </md-toolbar> <md-dialog-content> <div class=\"md-dialog-content\"> <h2>Questions List</h2> <p ng-repeat=\"(id, name) in questions\"> <strong>*</strong> {{name}} </p> <div layout=\"row\"> <md-input-container flex> <label>Please write...</label><textarea ng-model=\"reportText\"></textarea></md-input-container> </div> </div> </md-dialog-content> <md-dialog-actions layout=\"row\"> <span flex></span> <md-button ng-click=\"cancel('not useful')\"> Later </md-button> &nbsp; <md-button ng-click=\"report()\" style=\"margin-right:20px;\"> Submit </md-button> </md-dialog-actions> </form> </md-dialog>";
            self.showAdvanced = function(ev) {
                //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
                $mdDialog.show({
                  controller: DailyReportController,
                  // templateUrl: 'http://yahoo.com',
                  template: html,
                  //parent: angular.element(document.body),
                  targetEvent: ev,
                  locals: { questions: self.subGroupPolicy.dailyReportQuestions},
                  clickOutsideToClose:false,
                  //fullscreen: useFullScreen
                })
                .then(function(reportAnswer) {

                    //save report in firebase
                    firebaseService.getRefMain().child('daily-progress-report-by-users').child('user').child('group').child('subgroup').push({
                        date: firebaseTimeStamp,
                        answer: reportAnswer,
                        questions: self.subGroupPolicy.dailyReportQuestions
                    })

                    alert(reportAnswer);
                    self.reportAnswer = 'You said the information was "' + reportAnswer + '".';
                }, function() {
                    // alert('Cancel - Later');
                    $scope.status = 'You cancelled the dialog.';
                });
            };

            function DailyReportController($scope, $mdDialog, questions) {
              $scope.questions = questions;
              $scope.hide = function() {
                $mdDialog.hide();
              };
              $scope.cancel = function() {
                $mdDialog.cancel();
              };
              $scope.report = function() {
                $mdDialog.hide($scope.reportText);
              };
            }
            //Show Dailogue Box for Daily Report Questions -- END --

            function updateStatus(group, checkoutFlag, event) {
                var groupObj = {};
                self.checkinSending = true;
                if(group){
                    groupObj = {groupId: group.pId, subgroupId: group.subgroupId, userId: userID};
                } else {
                     groupObj = {
                        groupId: self.showUrlObj.groupID,
                        subgroupId: self.showUrlObj.subgroupID,
                        userId: self.showUrlObj.userID
                    }
                }
                checkinService.ChekinUpdateSatatus(groupObj, userID, checkoutFlag, function(result, msg, isSubmitted, groupObject){
                    if(result){
                        self.checkinSending = false;
                        if(checkoutFlag){
                            messageService.showSuccess('Checkout Successfully!');
                            if(isSubmitted){
                                //if daily progress report is not submitted load progress Report side nav bar..
                                var userObj = { id: userID, groupID: groupObj.groupId, subgroupID: groupObj.subgroupId }
                                self.dailyProgressReport = ProgressReportService.getSingleSubGroupReport(userObj, groupObj.groupId, groupObj.subgroupId);

                                //open side nav bar for getting progress report
                                self.progressReportSideNav();

                                // self.switchCheckIn = true;
                                // self.switchMsg = true;
                                // self.isDailyProgessSubmit = true
                                // self.isDailyProgessgroupID = groupObject.groupId;
                                // self.isDailyProgesssubgroupID = groupObject.subgroupId;
                            }
                        } else {
                            self.checkinSending = false;
                            messageService.showSuccess('Checkin Successfully!');
                        }
                    } else {
                        self.checkinSending = false;
                        messageService.showFailure(msg);
                    }
                });
            }

            function updateStatus1(group, checkoutFlag, event) {
                // console.log('group', group)
                // console.log('checkoutFlag', checkoutFlag)
                self.checkinSending = true;

                 //getting Current Location
                checkinService.getCurrentLocation().then(function(location) {
                    // console.log('current location', location.coords);

                    if(location.coords) {
                        self.currentLocation = { lat: location.coords.latitude, lng: location.coords.longitude };

                        if(group) { //if group (on checkin)
                            checkinService.subgroupHasPolicy(group.pId, group.subgroupId, function(hasPolicy, Policy) {
                                if(hasPolicy){ //if has policy
                                    // console.log('hasPolicy', true)
                                    checkinPolicy(function(){
                                        updateHelper(group, false, event, function(bool){
                                            if(bool) {
                                                chekinSwitch(group, false);
                                                messageService.showSuccess('Checkin Successfully!');
                                            } else {
                                                messageService.showFailure('Please contact to your administrator');
                                            }
                                        });
                                    });
                                } else {    //if no policy
                                    // console.log('hasPolicy', false)
                                    updateHelper(group, false, event, function(bool){
                                        if(bool){
                                            chekinSwitch(group, false);
                                            messageService.showSuccess('Checkin Successfully!');
                                        } else {
                                            messageService.showFailure('Please contact to your administrator');
                                        }
                                    });
                                }
                            })
                            // checkingHasPolicy(group.pId, group.subgroupId, function(result) {
                            //     if(hasPolicy){ //if has policy
                            //         // console.log('hasPolicy', true)
                            //         checkinPolicy(function(){
                            //             updateHelper(group, false, event, function(bool){
                            //                 if(bool) {
                            //                     chekinSwitch(group, false);
                            //                     messageService.showSuccess('Checkin Successfully!');
                            //                 } else {
                            //                     messageService.showFailure('Please contact to your administrator');
                            //                 }
                            //             });
                            //         });
                            //     } else {    //if no policy
                            //         // console.log('hasPolicy', false)
                            //         updateHelper(group, false, event, function(bool){
                            //             if(bool){
                            //                 chekinSwitch(group, false);
                            //                 messageService.showSuccess('Checkin Successfully!');
                            //             } else {
                            //                 messageService.showFailure('Please contact to your administrator');
                            //             }
                            //         });
                            //     }
                            // }); // checkingHasPolicy
                        } else {    //if no group (on checkout)
                            // console.log('Checkout', true)
                            updateHelper(false, true, event, function(bool){
                                if(bool){
                                    self.showAdvanced(event); //show dailogue box to take progress report
                                    //chekinSwitch(false, true);    //checkinswitch(group, checkoutFlag)
                                    messageService.showSuccess('Checkout Successfully!');
                                    self.subGroupHasPolicy = false; self.subGroupPolicy = {};
                                 } else {
                                    messageService.showFailure('Please contact to your administrator');
                                }
                            }); // update data on firebase

                        } //else group

                    } else { //if not location.coords
                        chekinSwitch(false, true);
                        self.switchCheckIn = false;
                        messageService.showFailure('Please allow your location (not getting current location)!');
                        return false;
                    }
                }); //checkinService.getCurrentLocation()
            } // updateStatus
            this.laterReport = function(){
                self.checkout = false;
                self.checkinSending = false;
                self.switchMsg = false;
                self.isDailyProgessSubmit = false;
                self.switchCheckIn = false;
            };
            this.submitReport = function(){
                //self.showUrlObj.userID
                //self.showUrlObj.groupID
                //self.showUrlObj.subgroupID
                //$location
                self.switchCheckIn = false;
                self.switchMsg = false;
                self.isDailyProgessSubmit = false;
                $state.go('user.group.subgroup-progressreport', {groupID: self.isDailyProgessgroupID, subgroupID: self.isDailyProgesssubgroupID, u: true});
            };
            function checkinPolicy(callback) {
                if(self.subGroupPolicy.locationBased) {  //checking if location Based

                    //checking distance (RADIUS)
                    var distance = self.CalculateDistance(self.subGroupPolicy.location.lat, self.subGroupPolicy.location.lng, self.currentLocation.lat, self.currentLocation.lng, 'K');
                    // console.log('distance:' + distance);
                    // console.log('distance in meter:' + distance * 1000);

                    if ((distance * 1000) > self.subGroupPolicy.location.radius) {  //checking lcoation radius
                        chekinSwitch(false, true);
                        self.switchCheckIn = false;
                        messageService.showFailure('Current Location does not near to the Team Location');
                        return false;
                    } else { // if within radius

                        checkinTimeBased(function(d) {  //policy has also timeBased
                            if(d) {
                                callback();     //if result true (checkin allow)
                            }
                        }); //checking if time based
                    } //if within radius

                } else if(self.subGroupPolicy.timeBased) { //policy has timeBased
                    checkinTimeBased(function(d) {
                        if(d) {
                            callback();      //if result true (checkin allow)
                        }
                    }); //checking if time based
                } else {    //checking others like if dailyReport
                    callback();      //result true (checkin allow) (might be only dailyReport has checked)
                }
            } //checkinLocationBased
            function checkinTimeBased(callback) {
                var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                //if timeBased true
                if(self.subGroupPolicy.timeBased) {
                    var today = new Date();
                    var Schduleday = days[today.getDay()];

                    //(self.subGroupPolicy.schedule[Schduleday] && self.subGroupPolicy.schedule[Schduleday][today.getHours()]) ?  console.log('t') : console.log('f');
                    if(self.subGroupPolicy.schedule[Schduleday] && self.subGroupPolicy.schedule[Schduleday][today.getHours()]) {
                        //if allow then checkin
                        callback(true);
                    } else {   //checking allow in days with hours
                        chekinSwitch(false, true);
                        self.switchCheckIn = false;
                        messageService.showFailure('You Don\'t have to permission to checkin at this day/hour');
                        return false;
                    }

                } else {//timeBased false
                    callback(true);    //if not timebased then return true....
                }
            } //checkinTimeBased
            function chekinSwitch(group, checkoutFlag){
                var grId = group && group.pId || self.showUrlObj.groupID;
                var sgrId = group && group.subgroupId || self.showUrlObj.subgroupID;
                if (!checkoutFlag) {
                    // console.log('on checkin -- checkoutflag false')
                    self.showUrlObj.userID = userID;
                    self.showUrlObj.groupID = grId;
                    self.showUrlObj.subgroupID = sgrId;
                    self.checkout = true;
                    self.checkinSending = false;
                } else {
                    // console.log('on checkout -- checkoutflag true')
                    self.checkout = false;
                    self.checkinSending = false;
                    self.switchMsg = false;
                    // console.log('switchCheckIn', self.switchCheckIn)
                }
            }
            function updateHelper(group, checkoutFlag, event, cb) {
                var groupObj = {};

                if(group) { //on checkin
                    groupObj = {
                        groupId: group.pId,
                        subgroupId: group.subgroupId,
                        userId: userID
                    }
                } else {    //on checkout
                    groupObj = {
                        groupId: self.showUrlObj.groupID,
                        subgroupId: self.showUrlObj.subgroupID,
                        userId: self.showUrlObj.userID
                    }
                }

                // //checking daily progress report is exists or not -- START --
                // firebaseService.getRefMain().child('daily-progress-report-by-users').child('user').child('group').child('subgroup').orderByChild('date')
                // .startAt(new Date().setHours(0,0,0,0)).endAt(new Date().setHours(23,59,59,0)).once('value', function(snapshot){
                //     console.log(snapshot.val());
                //     if(snapshot.val() == null){
                //         //if null then show alert for add daily progress report
                //         self.showAdvanced(event); //show dailogue box for getting progress report
                //         //add/updatcde in firebase...
                //         checkinService.saveFirebaseCheckInOut(groupObj, checkoutFlag, cb);
                //         //updateFirebase(groupObj, checkoutFlag, cb);
                //     } else {
                //         //add/update in firebase...
                //         //updateFirebase(groupObj, checkoutFlag, cb);
                //         checkinService.saveFirebaseCheckInOut(groupObj, checkoutFlag, cb);
                //     }
                // });
                // //checking daily progress report is exists or not -- END --

                //add/update in firebase...
                checkinService.saveFirebaseCheckInOut(groupObj, checkoutFlag, self.currentLocation, cb);
                //updateFirebase(groupObj, checkoutFlag, cb);

            } //updateHelper
            function updateStatusHelper(groupID, subgroupID, userID, checkoutFlag) {
                checkinService.getCurrentLocation().then(function(location) {
                    if (location) {
                        self.checkinObj.newStatus.location = {
                            lat: location.coords.latitude,
                            lon: location.coords.longitude
                        };
                    } else {
                        self.checkinObj.newStatus.location = {
                            lat: 0,
                            lon: 0
                        };
                    }

                    checkinService.updateUserStatusBySubGroup(groupID, subgroupID, userID, self.checkinObj.newStatus, self.definedSubGroupLocations, null)
                        .then(function(res) {
                            $timeout(function() {
                                self.checkinObj.newStatus.message = '';
                                self.checkinSending = false;
                                if (!checkoutFlag) {
                                    self.showUrlObj.userID = userID;
                                    self.showUrlObj.groupID = groupID;
                                    self.showUrlObj.subgroupID = subgroupID;
                                    self.checkout = true;
                                } else {
                                    self.checkout = false;
                                    self.switchCheckIn = false;
                                    self.switchMsg = false;
                                }
                            });

                            messageService.showSuccess(res);
                        }, function(reason) {
                            self.checkinSending = false;
                            messageService.showFailure(reason);
                        });
                }, function(err) {
                    messageService.showFailure(err.error.message);
                    self.checkinSending = false;
                });
            }
            //update firebase on checkin or checkout
            function updateFirebase(groupObj, checkoutFlag, cb) { //on checkout checkoutFlag is true, on checkin checkoutFlag is false

                var multipath = {};
                var dated = Date.now();
                var ref = firebaseService.getRefMain();         //firebase main reference
                var refGroup = firebaseService.getRefGroups();  //firebase groups reference

                //generate key
                var newPostRef = firebaseService.getRefsubgroupCheckinRecords().child(groupObj.groupId).child(groupObj.subgroupId).child(groupObj.userId).push();
                var newPostKey = newPostRef.key();

                var checkinMessage = (checkoutFlag) ? "Checked-out" : "Checked-in";
                var statusType = (checkoutFlag) ? 2 : 1;

                multipath["subgroup-check-in-records/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId+"/"+newPostKey] = {
                "identified-location-id": "Other",
                "location": {
                    "lat": self.currentLocation.lat,
                    "lon": self.currentLocation.lng
                },
                "message": checkinMessage,
                "source-device-type": 1,
                "source-type": 1,
                "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
                }
                multipath["subgroup-check-in-current-by-user/"+groupObj.userId] = {
                    "groupID": groupObj.groupId,
                    "source-device-type": 1,
                    "source-type": 1,
                    "subgroupID": groupObj.subgroupId,
                    "timestamp": dated,
                    "type": statusType
                }
                multipath["subgroup-check-in-current/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId] = {
                    "identified-location-id": "Other",
                    "location": {
                        "lat": self.currentLocation.lat,
                        "lon": self.currentLocation.lng
                    },
                    "message": checkinMessage,
                    "record-ref": newPostKey,
                    "source-device-type": 1,
                    "source-type": 1,
                    "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                    "timestamp": dated,
                    "type": statusType
                }
                //multipath["groups/"+groupObj.groupId+"/members-checked-in-count"] = 0;
                refGroup.child(groupObj.groupId).child('members-checked-in').child('count').once('value', function(snapshot){
                    multipath["groups/"+groupObj.groupId+"/members-checked-in/count"] = (checkoutFlag) ? (snapshot.val() - 1) : (snapshot.val() + 1);
                    ref.update(multipath, function(err){
                        if(err) {
                            console.log('err', err);
                            cb(false);
                        }
                        //calling callbAck....
                         cb(true);
                    }); //ref update
                }); //getting and update members-checked-in count
            } //updateFirebase
            function logout() {
                authService.logout();
            }
            function shiftToUserPage() {
                // $location.path('/user/' + userService.getCurrentUser().userID)
                $state.go('user.dashboard', {userID: userService.getCurrentUser().userID})
            }
            this.checkTeamAvailable = function () {
                if (self.groups.length === 0) {
                    messageService.showFailure('Currently you are not a member of any Team!');
                    self.switchCheckIn = false;
                    return
                }
            };
            this.checkinClick = function(event) {
                if (self.checkinSending) {
                    self.switchCheckIn = !self.switchCheckIn;
                    return
                }
                if (self.groups.length === 0) {
                    return
                }
                if (!self.switchMsg) {
                    if (self.checkout) {
                        updateStatus(false, true, event);
                        //self.updateStatus(self.showUrlObj.group, true)
                        return
                    }
                }
                self.switchMsg = !self.switchMsg
                self.ListGroupSubGroup = [];
                self.groups.forEach(function(group, groupId) {
                    var tmp = {
                        group: group.$id,
                        groupTitle: checkinService.getGroupTitle(group.$id),
                        subGroups: []
                    }
                    for (var i in group) {
                        if (['$priority', '$id'].indexOf(i) == -1 && typeof group[i] === 'object') {
                            var temp = {};
                            temp.pId = group.$id; // group Name == pId
                            temp.subgroupId = i;
                            temp.subgroupTitle = checkinService.getSubGroupTitle(group.$id, i);
                            temp.data = group[i];
                            tmp.subGroups.push(temp)
                        }
                    }
                    self.ListGroupSubGroup.push(tmp);
                })
            };
            function showSubGroup(group, pId) {
                self.subgroups = [];
                for (var i in group) {
                    if (['$priority', '$id'].indexOf(i) == -1 && typeof group[i] === 'object') {
                        var temp = {};
                        temp.pId = group.$id; // group Name == pId
                        temp.subgroupId = i;
                        temp.data = group[i];
                        self.subgroups.push(temp)
                    }
                }
            }
            function queryGroups() {
                if (self.search) {
                    var filteredGroupsNamesRef = firebaseService.getRefUserSubGroupMemberships().child(userID)
                        .orderByKey()
                        .startAt(self.search)
                        .endAt(self.search + '~');

                    self.filteredGroups = Firebase.getAsArray(filteredGroupsNamesRef);
                    self.groupObj1 = self.filteredGroups;
                    // console.log(self.filteredGroups);
                    // console.log(self.groupObj1);


                } else {
                    // self.filteredGroups = [];
                    self.filteredGroups = Firebase.getAsArray(firebaseService.getRefUserSubGroupMemberships().child(userID));
                }

                return
                self.filteredGroups
                self.groupObj1;
            }
            function PersonalSetting() {
                // $location.path('/user/' + userID + '/personalSettings')
                $state.go('user.personal-settings', {userID: userService.getCurrentUser().userID})
            }

            this.progressReportSideNav = function(){
            //side nav bar for daily progress report
              $mdSidenav('right').toggle().then(function(){
              });
            };

            this.updateProgressReport = function() {
                //console.log(self.dailyProgressReport[0]);
                ProgressReportService.updateReport(self.dailyProgressReport[0], function(result) {
                    if (result) {
                        messageService.showSuccess('Progress Report Updated!');
                        self.progressReportSideNav();
                    } else {
                        messageService.showFailure('Progress Report Update Failure!');
                    }
                });
            };
        }
    ]);

})();
