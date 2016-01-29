(function() {
    'use strict';

    angular.module('app.navToolbar')

    .controller('NavToolbarController', ['$q','$rootScope', 'soundService', 'messageService', '$timeout', '$firebaseArray', 'navToolbarService', 'authService', '$firebaseObject', 'firebaseService', 'userService', '$state',  '$location', 'checkinService',
        function($q, $rootScope, soundService, messageService, $timeout, $firebaseArray, navToolbarService, authService, $firebaseObject, firebaseService, userService, $state, $location, checkinService) {

            /*private variables*/
            // alert('inside controller');

            var userData;
            var self = this;
            var userID = userService.getCurrentUser().userID;
            self.myUserId = userID;
            var userCurrentCheckinRefBySubgroup;

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
            //this.userObj2;
            this.switchCheckIn = false;
                /*VM function ref*/

            this.logout = logout;
            this.PersonalSetting = PersonalSetting;
            this.showSubGroup = showSubGroup;
            this.shiftToUserPage = shiftToUserPage;
            //this.doChange = doChange;
            this.updateStatus = updateStatus;
            //this.logout = logout;
            this.queryGroups = queryGroups;
            this.quizStart = quizStart
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
            // this.groupObj = $firebaseArray(firebaseService.getRefUserSubGroupMemberships().child(userID))
            //     .$loaded().then(function(d) {
            //         if (d && d.length) {
            //             self.noSubgropData = false
            //             showSubGroup(d[0], d[0].$id);
            //             $timeout(function() {
            //                 // self.groups = d;
            //                 self.groups = self.groupObj;
            //                 // self.listGroupSubGroups = d;
            //                 console.log('asa')
            //                 console.log(self.groups);
            //             })
            //         } else {
            //             self.noSubgropData = true
            //         }
            //     }, function(e) {
            //         debugger;
            //         console.log(e)
            //     });

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


            var subGroupHasPolicy = false;
            var subGroupPolicy = {};
            function checkingHasPolicy(groupID, subgroupID) {
                //var defer = $q.defer(); 

                firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).once('value', function(snapshot) {
                    subGroupHasPolicy = (snapshot.val() && snapshot.val().hasPolicy) ? snapshot.val().hasPolicy : false;
                    console.log('subGroupHasPolicy', subGroupHasPolicy);

                    if(subGroupHasPolicy) {
                        firebaseService.getRefPolicies().child(groupID).child(snapshot.val().policyID).once('value', function(policy){
                            subGroupPolicy = policy.val();
                            console.log('policy key', policy.key());
                            console.log('policy val', policy.val());
                        });
                    }
                });


            } //subgroupHasPolicy

            function updateStatus(group, checkoutFlag) {
                if(group) { checkingHasPolicy(group.pId, group.subgroupId); } else { subGroupHasPolicy = false; subGroupPolicy = {}; }

                var grId = group && group.pId || self.showUrlObj.groupID;
                var sgrId = group && group.subgroupId || self.showUrlObj.subgroupID;
                if (self.checkinSending) return;
                self.checkinSending = true;
                self.showUrlObj.group = group;
                // self.checkout = false;
                checkinService.createCurrentRefsBySubgroup(grId, sgrId, userID).then(function() {
                    self.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations();
                    console.log('self.definedSubGroupLocations ', self.definedSubGroupLocations)
                    self.definedSubGroupLocationsObject = checkinService.getFireCurrentSubGroupLocationsObject();
                    //console.log(self.definedSubGroupLocationsObject)
                    //var tempRef = checkinService.getRefCheckinCurrentBySubgroup().child(grId + '/' + sgrId + '/' + userID);
                    var tempRef = checkinService.getRefCheckinCurrentBySubgroup().child(grId + '/' + sgrId + '/' + userID);
                    userCurrentCheckinRefBySubgroup = $firebaseObject(tempRef)
                        .$loaded(function(snapshot) {
                            self.checkinObj.newStatus.type = !snapshot || snapshot.type == 1 ? 2 : 1;
                            self.checkinObj.userLastStatus = snapshot;
                            self.checkinObj.subgroupPath = grId + '/' + sgrId;

                            updateStatusHelper(grId, sgrId, userID, checkoutFlag);
                            /*$timeout(function () {
                                self.checkinObj.newStatus.type = !snapshot || snapshot.type == 1 ? 2 : 1;
                                self.checkinObj.userLastStatus = snapshot;
                                self.checkinObj.subgroupPath = grId + '/' + sgrId;

                                updateStatusHelper(grId, sgrId, userID, checkoutFlag)
                            });*/
                        });
                });


            }

            function updateStatusHelper(groupID, subgroupID, userID, checkoutFlag) {
                /* function requestUpdate() {

                 };*/
                checkinService.getCurrentLocation()
                    .then(function(location) {
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

                        // var targetLat = self.definedSubGroupLocationsObject.location.lat;
                        // console.log('group target lat:' + targetLat);
                        // var targetLon = self.definedSubGroupLocationsObject.location.lon;
                        // console.log('group target lon:' + targetLon);
                        // var targetRadius = self.definedSubGroupLocationsObject.location.radius;
                        // console.log('group rad:' + targetRadius);
                        // var curLat = self.checkinObj.newStatus.location.lat;
                        // console.log('user lat:' + curLat);
                        // var curLon = self.checkinObj.newStatus.location.lon;
                        // console.log('user lon:' + curLon);
                        // var distance = self.CalculateDistance(targetLat, targetLon, curLat, curLon, 'K');
                        // console.log('distance:' + distance);
                        // console.log('distance in meter:' + distance * 1000);
                        /*if ((distance * 1000) > targetRadius) {
                            messageService.showFailure('Current Location does not near to the Team Location');
                            self.checkinObj = {
                                newStatus: {}
                            };
                            self.showUrlObj = {};
                            self.checkinSending = false;
                            self.switchCheckIn = false;
                            return;
                        } else {
                            messageService.showSuccess('You in the Team Location');
                        }*/
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
            }

            this.checkinClick = function() {
                if (self.checkinSending) {
                    self.switchCheckIn = !self.switchCheckIn;
                    return
                }
                if (self.groups.length === 0) {
                    return
                }
                if (!self.switchMsg) {
                    if (self.checkout) {
                        self.updateStatus(self.showUrlObj.group, true)
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
            }

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
                    //debugger
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


        }
    ]);

})();
 