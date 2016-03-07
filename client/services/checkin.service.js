 /**
 * Created by Shahzad on 1/21/2015.
 */

(function() {
    'use strict';

    angular
        // .module('checkin')
        .module('core')
        .factory('checkinService', checkinService);

    checkinService.$inject = ['activityStreamService', '$q', '$geolocation', 'firebaseService', 'userService', "$firebaseObject", '$firebaseArray'];

    function checkinService(activityStreamService, $q, $geolocation, firebaseService, userService, $firebaseObject, $firebaseArray) {

        /*private variables*/
        var refs, fireTimeStamp;

        //firebase unix-epoch time
        fireTimeStamp = Firebase.ServerValue.TIMESTAMP;

        refs = {
            main: firebaseService.getRefMain()
        };

        refs.refGroupCheckinCurrent = refs.main.child('group-check-in-current');
        refs.refGroupCheckinRecords = refs.main.child('group-check-in-records');
        refs.refGroupLocationsDefined = refs.main.child('group-locations-defined');

        refs.refSubGroupCheckinCurrent = refs.main.child('subgroup-check-in-current');
        refs.refSubGroupCheckinRecords = refs.main.child('subgroup-check-in-records');
        refs.refSubGroupLocationsDefined = refs.main.child('subgroup-locations-defined');
        refs.refSubGroupCheckinCurrentByUser = refs.main.child('subgroup-check-in-current-by-user');

        function getLocation(groupID, subgroupID) {
            var defer = $q.defer();
            // var locationRef = new Firebase(refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID).toString());
            // locationRef.orderByValue().on("value", function(snapshot) {
            //     snapshot.forEach(function(data) {
            //         //console.log(data.val());
            //         refs.$currentSubGroupLocationsObject = data.val();
            //     });
            //     defer.resolve();
            // });
                defer.resolve();
            return defer.promise;
        }


        //step 1 (calling from Controller)
        function ChekinUpdateSatatus(group, userId, checkoutFlag, cb){
            //var groupObj = {groupId: group.pId, subgroupId: group.subgroupId, userId: userId};
            $geolocation.getCurrentPosition({
                timeout: 60000,
                maximumAge: 250,
                enableHighAccuracy: true
            }).then(function(location){
                // console.log('location', location)
                 if(location.coords) {
                    var locationObj = {lat: location.coords.latitude, lng: location.coords.longitude};
                     subgroupHasPolicy(group.groupId, group.subgroupId, function(hasPolicy, Policy){
                        if(hasPolicy) {
                            //hasPolicy true
                            checkinPolicy(Policy, locationObj, function(result, msg, teamLocationTitle){
                                if(result){
                                    saveFirebaseCheckInOut(group, checkoutFlag, locationObj, Policy, teamLocationTitle, function(result, cbMsg, reportMsg){
                                        //console.log('group', group); //group = {groupId: "hotmaill", subgroupId: "yahooemail", userId: "usuf52"}
                                        cb(result, cbMsg, reportMsg, group);
                                    });
                                } else {
                                    cb(false, msg, null, null);
                                }
                            });
                        } else {
                            //hasPolicy false
                            saveFirebaseCheckInOut(group, checkoutFlag,  locationObj, Policy, function(result, cbMsg, reportMsg){
                                cb(result, cbMsg, null, null);
                            });
                        }
                    });
                 } else {
                     cb(false, 'Please allow your location (not getting current location)!', null, null);
                 }
            });
        }

        function subgroupHasPolicy(groupID, subgroupID, cb){
            //firebaseService.getRefSubGroupsNames().child(groupID).child(subgroupID).once('value', function(snapshot) {
            firebaseService.getRefSubgroupPolicies().child(groupID).child(subgroupID).once('value', function(snapshot) {
                if(snapshot.val() && snapshot.val().hasPolicy && snapshot.val().hasPolicy === true) {
                    firebaseService.getRefPolicies().child(groupID).child(snapshot.val().policyID).once('value', function(policy){
                        cb(true, policy.val());
                    }); //getting policy
                } else {//self.subGroupHasPolicy if true
                    cb(false, false);
                }
            }); //firebaseService.getRefSubGroupsNames()
        } //subgroupHasPolicy

        //calculating Distance
        function CalculateDistance(lat1, lon1, lat2, lon2, unit) {
            //:::    unit = the unit you desire for results                               :::
            //:::           where: 'M' is statute miles (default)                         :::
            //:::                  'K' is kilometers                                      :::
            //:::                  'N' is nautical miles                                  :::
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            // var radlon1 = Math.PI * lon1 / 180;
            // var radlon2 = Math.PI * lon2 / 180;
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
        }

        //checking Policy is Subgroup Has Policy (is that timebased or locationbased)
        function checkinPolicy(Policy, currentLocationObj, callback) {
            console.log('policy', Policy)
            if(Policy && Policy.locationBased) {  //checking if location Based

                //checking distance (RADIUS)
                var distance = CalculateDistance(Policy.location.lat, Policy.location.lng, currentLocationObj.lat, currentLocationObj.lng, 'K');
                // console.log('distance:' + distance);
                // console.log('distance in meter:' + distance * 1000);

                if ((distance * 1000) < Policy.location.radius) {  //checking lcoation radius
                    // callback(false, 'Current Location does not near to the Team Location');
                    checkinTimeBased(Policy, function(d, msg) {  //policy has also timeBased
                        callback(d, msg, Policy.location.title);     //if result true (checkin allow)
                    }); //checking if time based
                } else { // if within radius
                    checkinTimeBased(Policy, function(d, msg) {  //policy has also timeBased
                        callback(d, msg, false);     //if result true (checkin allow)
                    }); //checking if time based
                } //if within radius

            } else if(Policy && Policy.timeBased) { //policy has timeBased
                checkinTimeBased(Policy, function(d, msg) {
                    callback(d, msg, false);      //if result true (checkin allow)
                }); //checking if time based
            } else {    //checking others like if dailyReport
                callback(true, '', false);      //result true (checkin allow) (might be only dailyReport has checked)
            }
        } //checkinLocationBased
        //checkinTimeBased
        function checkinTimeBased(Policy, callback) {
            var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            //if timeBased true
            if(Policy && Policy.timeBased) {
                var today = new Date();
                var Schduleday = days[today.getDay()];

                //(self.subGroupPolicy.schedule[Schduleday] && self.subGroupPolicy.schedule[Schduleday][today.getHours()]) ?  console.log('t') : console.log('f');
                if(Policy.schedule[Schduleday] && Policy.schedule[Schduleday][today.getHours()]) {
                    //if allow then checkin
                    callback(true, '');
                } else {   //checking allow in days with hours
                    callback(false, 'You Don\'t have to permission to checkin at this day/hour');
                }

            } else {//timeBased false
                callback(true, '');    //if not timebased then return true....
            }
        } //checkinTimeBased

        //checkinDailyProgress
        function checkinDailyProgress(groupObj, checkoutFlag, Policy, cb){
               if(Policy && Policy.progressReport) {
                //checking daily progress report is exists or not -- START --
                firebaseService.getRefMain().child('progress-reports-by-users').child(groupObj.userId).child(groupObj.groupId).child(groupObj.subgroupId).orderByChild('date')
                .startAt(new Date().setHours(0,0,0,0)).endAt(new Date().setHours(23,59,59,0)).once('value', function(snapshot){
                    if(snapshot.val() === null) { //if null then create daily report dummy
                        //cerating Dummy Report Object on Checkin....
                        var progressRprtObj = firebaseService.getRefMain().child('progress-reports-by-users').child(groupObj.userId).child(groupObj.groupId).child(groupObj.subgroupId).push({
                            date: Firebase.ServerValue.TIMESTAMP,
                            //date: new Date().setHours(0,0,0,0),
                            questionID: Policy.latestProgressReportQuestionID,
                            policyID: Policy.policyID,
                            answers: ''
                        });

                        //for group activity stream record -- START --
                        var type = 'progressReport';
                        var targetinfo = {id: progressRprtObj.key(), url: groupObj.groupId+'/'+groupObj.subgroupId, title: groupObj.groupId+'/'+groupObj.subgroupId, type: 'progressReport' };
                        var area = {type: 'progressReport-created'};
                        var group_id = groupObj.groupId+'/'+groupObj.subgroupId;
                        var memberuserID = groupObj.userId;
                        var _object = null;
                        //for group activity record
                        activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID, _object);
                        //for group activity stream record -- END --

                        cb(false, 'notSubmitted');
                    } else {
                        for(var obj in snapshot.val()) {
                            //console.log(snapshot.val()[obj])
                            if(snapshot.val()[obj].answers === "" && checkoutFlag === true) {  //now checking if answers has given or not on checkout
                                //if not submited report then show msg
                                cb(false, 'notSubmitted');
                            } else {
                                //if submited report then nuthing
                                cb(true, null);
                            }
                        }
                    }
                });
                //checking daily progress report is exists or not -- END --
            } else {//if(Policy && Policy.dailyReport)
                //if not assign any daily report policy (Daily Report policy has false)
                cb(true, '');
            }

        }//checkinDailyProgress



        function saveFirebaseCheckInOut(groupObj, checkoutFlag, locationObj, Policy, teamLocationTitle, cb){
            // groupObj = {groupId: '', subgroupId: '', userId: ''}
            var multipath = {};
            var dated = fireTimeStamp;
            var ref = firebaseService.getRefMain();         //firebase main reference
            var refGroup = firebaseService.getRefGroups();  //firebase groups reference
            var refSubGroup = firebaseService.getRefSubGroups();  //firebase groups reference

            //generate key
            var newPostRef = firebaseService.getRefsubgroupCheckinRecords().child(groupObj.groupId).child(groupObj.subgroupId).child(groupObj.userId).push();
            var newPostKey = newPostRef.key();

            var checkinMessage = (checkoutFlag) ? "Checked-out" : "Checked-in";
            var checkinResultMsg = (checkoutFlag) ? "Checkout Successfully" : "Checkin Successfully";
            var statusType = (checkoutFlag) ? 2 : 1;
            var _teamLocationTitle = (teamLocationTitle ? teamLocationTitle : 'Other');
            multipath["subgroup-check-in-records/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId+"/"+newPostKey] = {
                "identified-location-id": _teamLocationTitle,
                "location": {
                    "lat": locationObj.lat,
                    "lon": locationObj.lng
                },
                "message": checkinMessage,
                "source-device-type": 1,
                "source-type": 1,
                "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
            };
            multipath["subgroup-check-in-current-by-user/"+groupObj.userId] = {
                "groupID": groupObj.groupId,
                "source-device-type": 1,
                "source-type": 1,
                "subgroupID": groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
            };
            multipath["subgroup-check-in-current/"+groupObj.groupId+"/"+groupObj.subgroupId+"/"+groupObj.userId] = {
                "identified-location-id": "Other",
                "location": {
                    "lat": locationObj.lat,
                    "lon": locationObj.lng
                },
                "message": checkinMessage,
                "record-ref": newPostKey,
                "source-device-type": 1,
                "source-type": 1,
                "subgroup-url": groupObj.groupId+"/"+groupObj.subgroupId,
                "timestamp": dated,
                "type": statusType
            };
            //multipath["groups/"+groupObj.groupId+"/members-checked-in/count"] = 0;
            refGroup.child(groupObj.groupId).child('members-checked-in/count').once('value', function(snapshot){
                multipath["groups/"+groupObj.groupId+"/members-checked-in/count"] = (checkoutFlag) ? (snapshot.val() - 1) : (snapshot.val() + 1);
                refSubGroup.child(groupObj.groupId).child(groupObj.subgroupId).child('members-checked-in/count').once('value', function(snapshot){
                    multipath["subgroups/"+groupObj.groupId+"/"+groupObj.subgroupId+"/members-checked-in/count"] = (checkoutFlag) ? (snapshot.val() - 1) : (snapshot.val() + 1);
                    ref.update(multipath, function(err){
                        if(err) {
                            // console.log('err', err);
                            cb(false, 'Please contact to your administrator', null);
                        }
                        //checking Daily Progress Report
                        checkinDailyProgress(groupObj, checkoutFlag, Policy, function(rst, mes){
                            if(rst) {
                                //calling callbAck....
                                cb(true, checkinResultMsg, null);
                            } else {
                                cb(true, checkinResultMsg, mes);
                            }
                        })
                    }); //ref update
                }); //getting and update members-checked-in count - subgroup
            }); //getting and update members-checked-in count - group
        } //saveFirebaseCheckInOut



        return {

            getRefUsers: firebaseService.getRefUsers,
            getRefGroups: firebaseService.getRefGroups,
            getRefUserGroupMemberships: firebaseService.getRefUserGroupMemberships,
            getRefUserSubGroupMemberships: firebaseService.getRefUserGroupMemberships,
            createCurrentRefs: function(groupID, userID) {
                refs.$currentGroupLocations = Firebase.getAsArray(refs.refGroupLocationsDefined.child(groupID));
                refs.refCurrentGroupCheckinCurrent = refs.refGroupCheckinCurrent.child(groupID);

                var userCheckinRecords = refs.refGroupCheckinRecords.child(groupID + '/' + userID);
                refs.$userCheckinRecords = Firebase.getAsArray(userCheckinRecords);
            },
            hasSubGroupCurrentLocation: function(groupID, subGroupID){
                var defer = $q.defer();
                var hasLocation = false;
                // $firebaseArray(refs.refSubGroupLocationsDefined.child(groupID + "/" + subGroupID))
                //     .$loaded().then(function(data){
                //         // console.log(data[0].location)
                //         if(data[0] && data[0].location){
                //             hasLocation = true;
                //             defer.resolve(hasLocation);
                //         }
                //     });
                //
                // refs.refSubGroupLocationsDefined.child(groupID + "/" + subGroupID).on('child_changed', function(snapshot){
                //     // console.log(snapshot.val().location);
                //     if(snapshot.val() && snapshot.val().location){
                //         hasLocation = true;
                //         defer.resolve(hasLocation);
                // }
                // })
                defer.resolve('');
                return defer.promise;
            },
            createCurrentRefsBySubgroup: function(groupID, subgroupID, userID) {
                var defer = $q.defer();
                // getLocation(groupID, subgroupID).then(function(data) {
                //     //refs.$currentSubGroupLocations = Firebase.getAsArray( refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID ) );
                //     refs.$currentSubGroupLocations = $firebaseArray(refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID));
                //     //refs.refCurrentSubGroupCheckinCurrent = refs.refSubGroupCheckinCurrent.child( groupID).child(subgroupID);
                //     var userCheckinRecords = refs.refSubGroupCheckinRecords.child(groupID + '/' + subgroupID + '/' + userID);
                //     refs.$userCheckinRecords = Firebase.getAsArray(userCheckinRecords);
                //     defer.resolve('test');
                // });
                defer.resolve('');
                return defer.promise;
            },
            getRefSubgroupCheckinCurrentByUser: function() {
                return refs.refSubGroupCheckinCurrentByUser;
            },
            getFireAsObject: function(ref) {
                return $firebaseObject(ref);
            },
            getRefGroupLocationsDefined: function(groupID) {
                return refs.refGroupLocationsDefined.child(groupID);
            },
            getRefCheckinCurrent: function() {
                return refs.refGroupCheckinCurrent;
            },
            getRefCheckinCurrentBySubgroup: function() {
                return refs.refSubGroupCheckinCurrent;
            },
            getRefGroupCheckinCurrent: function(groupID) {
                return refs.refGroupCheckinCurrent.child(groupID);
            },
            getRefSubGroupCheckinCurrent: function(userID, groupID, subgroupId) {
                return refs.refSubGroupCheckinCurrent.child(userID + '/' + groupID + '/' + subgroupId);
            },
            getFireCurrentGroupLocations: function() {
                return refs.$currentGroupLocations;
            },
            getFireCurrentSubGroupLocations: function() {
                return refs.$currentSubGroupLocations;
            },
            getFireCurrentSubGroupLocationsObject: function() {
                return refs.$currentSubGroupLocationsObject;
            },
            getFireGroup: function(groupID) {
                var refGroups = this.getRefGroups();
                return this.getFireAsObject(refGroups.child(groupID));
            },
            geoLocationSupport: function() {
                return typeof window.navigator !== 'undefined' && typeof window.navigator.geolocation !== 'undefined';
            },
            getCurrentLocation: function() {
                return $geolocation.getCurrentPosition({
                    timeout: 60000,
                    maximumAge: 250,
                    enableHighAccuracy: true
                });
            },
            updateUserStatusBySubGroup: function(groupID, subgroupId, userID, statusObj, definedLocations, groupObj) {
                var defer = $q.defer();
                var errorCallback = function(err) {
                    defer.reject('error occurred in connecting to the server', err);
                };

                var self = this;

                var identifiedLocation = statusObj.location ? this.getDefinedLocationByLatLng(statusObj.location, definedLocations).$id : 'Other';

                var checkinObj = {

                    'subgroup-url': groupID + '/' + subgroupId,
                    'timestamp': fireTimeStamp,
                    'type': +statusObj.type, // 1 = in, 2 = out
                    'source-type': 1, //1 = manual in web or mobile, 2 = automatic by geo-fencing in mobile, 3 =  automatic by beacon’s in mobile
                    'source-device-type': 1, // 1 = Web, 2 = iPhone, 3 = Android
                    //'source-device-address': 'ip address or mobile number',
                    'location': statusObj.location, //not present in case of beacon based check in and out or the user does not select or allow data
                    'identified-location-id': identifiedLocation

                };

                // console.log(checkinObj)

                checkinObj.message = statusObj.message || (statusObj.type == 1 ? 'Checked-in' : 'Checked-out');

                var userCheckinCurrent = refs.refSubGroupCheckinCurrent.child(groupID + '/' + subgroupId + '/' + userID);
                var $userCheckinCurrent = $firebaseObject(userCheckinCurrent);

                $userCheckinCurrent
                    .$loaded()
                    .then(function() {
                        var userCheckinRecordsRef = refs.refSubGroupCheckinRecords.child(groupID + '/' + subgroupId + '/' + userID);
                        var _ref = new Firebase(userCheckinRecordsRef.toString());
                        var _userCheckinREcordsRef = $firebaseArray(_ref);
                        // console.log(checkinObj)
                        _userCheckinREcordsRef.$add(checkinObj)
                            .then(function(snapShot) {
                                var temp = $firebaseObject(refs.refSubGroupCheckinCurrentByUser.child(userID))
                                    .$loaded().then(function(snapshot) {
                                        // console.log('before')
                                        // console.log(snapshot)
                                        snapshot.timestamp = fireTimeStamp;
                                        snapshot.type = statusObj.type; // 1 = in, 2 = out
                                        snapshot.groupID = groupID;
                                        snapshot.subgroupID = subgroupId;
                                        snapshot['source-device-type'] = 1; // 1 = Web, 2 = iPhone, 3 = Android
                                        snapshot['source-type'] = 1; //1 = manual in web or mobile, 2 = automatic by geo-fencing in mobile, 3 =  automatic by beacon’s in mobile
                                        // snapshot['record-ref'] = snapShot.key(); //report manjan
                                        // console.log('after')
                                        // console.log(snapshot)
                                        snapshot.$save().then(function(d) {

                                            checkinObj['record-ref'] = snapShot.key();
                                            angular.extend($userCheckinCurrent, checkinObj);
                                            $userCheckinCurrent.$save()
                                                .then(function() {
                                                    self.updateSubGroupCount(groupID, subgroupId, checkinObj.type)
                                                        .then(function() {
                                                            self.updateGroupCount(groupID, checkinObj.type)
                                                                .then(function() {
                                                                    defer.resolve('Status updated successfully.');
                                                            /*self.asyncRecordUserCheckSubGroupActivity(checkinObj, userID, groupID,subgroupId, groupObj, definedLocations)
                                                             .then(function () {
                                                             defer.resolve('Status updated successfully.');
                                                             }, errorCallback);*/
                                                            }, errorCallback);
                                                        }, errorCallback);

                                                }, errorCallback);

                                        }, errorCallback);

                                    }, errorCallback);

                            }, errorCallback);

                    }, errorCallback);

                return defer.promise;
            },
            updateUserStatus: function(groupID, userID, statusObj, definedLocations, groupObj) {
                var defer = $q.defer();
                var errorCallback = function(err) {
                    defer.reject('error occurred in connecting to the server', err);
                };

                var self = this;

                var identifiedLocation = statusObj.location ? this.getDefinedLocationByLatLng(statusObj.location, definedLocations).$id : 'Other';

                var checkinObj = {
                    //id: 'autoGeneratedTimestampBasedRecordID', // from record
                    'group-url': groupID,
                    'timestamp': fireTimeStamp,
                    'type': +statusObj.type, // 1 = in, 2 = out
                    'source-type': 1, //1 = manual in web or mobile, 2 = automatic by geo-fencing in mobile, 3 =  automatic by beacon’s in mobile
                    'source-device-type': 1, // 1 = Web, 2 = iPhone, 3 = Android
                    //'source-device-address': 'ip address or mobile number',
                    'location': statusObj.location, //not present in case of beacon based check in and out or the user does not select or allow data
                    'identified-location-id': identifiedLocation
                };

                checkinObj.message = statusObj.message || (statusObj.type == 1 ? 'Checked-in' : 'Checked-out');

                var userCheckinCurrent = refs.refGroupCheckinCurrent.child(groupID + '/' + userID);
                var $userCheckinCurrent = $firebaseObject(userCheckinCurrent);

                $userCheckinCurrent
                    .$loaded()
                    .then(function() {

                        var userCheckinRecordsRef = refs.refGroupCheckinRecords.child(groupID + '/' + userID);
                        var $userCheckinRecords = Firebase.getAsArray(userCheckinRecordsRef);

                        var recRef = $userCheckinRecords.$add(checkinObj);
                        checkinObj.id = recRef.key();

                        angular.extend($userCheckinCurrent, checkinObj);
                        $userCheckinCurrent.$save()
                            .then(function() {
                                self.updateGroupCount(groupID, checkinObj.type)
                                    .then(function() {
                                        self.asyncRecordUserCheckGroupActivity(checkinObj, userID, groupID, groupObj, definedLocations)
                                            .then(function() {
                                                defer.resolve('Status updated successfully.');

                                            }, errorCallback);

                                    }, errorCallback);

                            }, errorCallback);

                    }, errorCallback);

                return defer.promise;
            },
            updateGroupCount: function(groupID, checkinType) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefGroups().child(groupID + '/members-checked-in');
                var $checkin = $firebaseObject(groupCheckedIn);

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ($checkin.count || 0) + (checkinType == 1 ? 1 : -1);
                        $checkin.$save().then(function() {
                            defer.resolve();
                        }, function() {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });

                return defer.promise;
            },
            updateAllSubGroupCount: function(groupID, subgroupID, numberofuser) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefSubGroups().child(groupID + '/' + subgroupID + '/members-checked-in');
                var $checkin = $firebaseObject(groupCheckedIn);

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ($checkin.count || 0) - numberofuser;
                        $checkin.$save().then(function() {
                            defer.resolve();
                        }, function() {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });
                return defer.promise;
            },
            updateSubGroupCount: function(groupID, subgroupID, checkinType) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefSubGroups().child(groupID + '/' + subgroupID + '/members-checked-in');
                var $checkin = $firebaseObject(groupCheckedIn);

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ($checkin.count || 0) + (checkinType == 1 ? 1 : -1);
                        $checkin.$save().then(function() {
                            defer.resolve();
                        }, function() {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });

                return defer.promise;
            },
            asyncRecordUserCheckGroupActivity: function(checkinObj, userID, groupID, groupObj, definedLocations) {
                var deferred = $q.defer();

                var currentUser = userService.getCurrentUser();
                var locationName = this.getLocationName(checkinObj, definedLocations);
                var groupActivityRef = firebaseService.getRefGroupsActivityStreams().child(groupID);

                var actor = {
                    type: 'user',
                    id: userID, //this is the userID, and an index should be set on this
                    email: currentUser.email,
                    displayName: currentUser.firstName + ' ' + currentUser.lastName,
                    image: null
                };

                var object = {
                    type: 'location',
                    id: null,
                    url: null,
                    displayName: locationName,
                    image: null
                };

                var target = {
                    type: 'group',
                    id: groupID, //an index should be set on this
                    url: groupID,
                    displayName: groupObj.title
                };

                var displayName = actor.displayName +
                    (checkinObj.type == 1 ? ' checked-in' : ' checked-out') +
                    ' at "' + locationName +
                    '" location of ' + groupObj.title + '.';

                var activity = {
                    language: 'en',
                    verb: checkinObj.type == 1 ? 'check-in' : 'check-out',
                    published: fireTimeStamp,
                    displayName: displayName,
                    actor: actor,
                    object: object,
                    target: target
                };

                var newActivityRef = groupActivityRef.push();
                newActivityRef.set(activity, function(err) {
                    if (err) {
                        deferred.reject();
                        console.log('error occurred in check-in activity', err);
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = groupActivityRef.child(activityID);
                        activityEntryRef.once('value', function(snapshot) {
                            var timestamp = snapshot.val();
                            newActivityRef.setPriority(0 - timestamp.published, function(error) {
                                if (error) {
                                    deferred.reject();
                                    console.log('error occurred in check-in activity', error);
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });

                return deferred.promise;
            },
            asyncRecordUserCheckSubGroupActivity: function(checkinObj, userID, groupID, subgroupID, groupObj, definedLocations) {
                var deferred = $q.defer();

                var currentUser = userService.getCurrentUser();
                var locationName = this.getLocationName(checkinObj, definedLocations);
                var subGroupActivityRef = firebaseService.getRefSubGroupsActivityStreams().child(groupID + "/" + subgroupID); //"subgroup-activity-streams"

                var actor = {
                    type: 'user',
                    id: currentUser.userID, //this is the userID, and an index should be set on this
                    email: currentUser.email,
                    displayName: currentUser.firstName + ' ' + currentUser.lastName,
                    image: null
                };

                var object = {
                    type: 'location',
                    id: null,
                    url: null,
                    displayName: locationName,
                    image: null
                };

                var target = {
                    type: 'group',
                    id: subgroupID, //an index should be set on this
                    url: subgroupID,
                    displayName: groupObj.title
                };

                var displayName = actor.displayName +
                    (checkinObj.type == 1 ? ' checked-in' : ' checked-out') +
                    ' at "' + locationName +
                    '" location of ' + groupObj.title + '.';

                var activity = {
                    language: 'en',
                    verb: checkinObj.type == 1 ? 'check-in' : 'check-out',
                    published: fireTimeStamp,
                    displayName: displayName,
                    actor: actor,
                    object: object,
                    target: target
                };

                var newActivityRef = subGroupActivityRef.push();
                newActivityRef.set(activity, function(err) {
                    if (err) {
                        deferred.reject();
                        console.log('error occurred in check-in activity', err);
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = subGroupActivityRef.child(activityID);
                        activityEntryRef.once('value', function(snapshot) {
                            var timestamp = snapshot.val();
                            newActivityRef.setPriority(0 - timestamp.published, function(error) {
                                if (error) {
                                    deferred.reject();
                                    console.log('error occurred in check-in activity', error);
                                } else {
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });

                return deferred.promise;
            },
            addLocation: function(groupID, userID, locationObj) {
                var defer = $q.defer();

                var newLocation = {
                    'group-url': groupID,
                    'title': locationObj.title,
                    'type': 1, // 1 = Geo location, 2 = Beacon
                    'location': {
                        'lat': locationObj.lat,
                        'lon': locationObj.lng,
                        'radius': locationObj.radius
                    },
                    'defined-by': userID, //only admins or owners can define a office location
                    'timestamp': fireTimeStamp
                };

                var ref = refs.$currentGroupLocations.$add(newLocation);
                if (ref.key()) {
                    defer.resolve('Location has been added to "' + groupID + '".');
                } else {
                    defer.reject('Error occurred in saving on server.');
                }

                return defer.promise;
            },
            addLocationBySubgroup: function(groupID, subgroupID, userID, locationObj, multiple, recordId) {

                var defer = $q.defer();

                var newLocation = {
                    'subgroup-url': groupID + '/' + subgroupID,
                    'title': locationObj.title,
                    'type': 1, // 1 = Geo location, 2 = Beacon
                    'location': {
                        'lat': locationObj.locationObj.lat,
                        'lon': locationObj.locationObj.lng,
                        'radius': locationObj.locationObj.radius
                    },
                    'defined-by': userID, //only admins or owners can define a office location
                    'timestamp': fireTimeStamp
                };

                var syncRef;
                if (!multiple && refs.$currentSubGroupLocations.length) {
                    //syncRef = refs.$currentSubGroupLocations.$set( refs.$currentSubGroupLocations[0].$id , newLocation)
                    angular.extend(refs.$currentSubGroupLocations[0], newLocation);
                    refs.$currentSubGroupLocations.$save(0)
                        .then(function() {
                            defer.resolve('Location has been added.');
                        }, function() {
                            defer.reject('Error occurred in saving on server.');
                        });

                } else {

                    refs.$currentSubGroupLocations.$add(newLocation)
                        .then(function() {
                            defer.resolve('Location has been added.');
                        }, function() {
                            defer.reject('Error occurred in saving on server.');

                        });
                    /*if( syncRef.key() ){
                        defer.resolve('Location has been added to "' + subgroupID + '".');
                    } else {
                        defer.reject('Error occurred in saving on server.');
                    }*/
                }



                return defer.promise;
            },
            //for Admins: get the predefined location timestampID, from which user checked-in or checked-out.
            getDefinedLocationByLatLng: function(userLoc, definedLocations, radius) {
                var distance, currentLatLon,
                    location, newLocLatLng;

                //setting default in case no location matches.
                location = {
                    title: 'Other',
                    $id: 'Other'
                };

                //if no radius provided to calculate distance. e.g user check-in/out from any location.
                radius = radius || 0;

                newLocLatLng = new L.LatLng(userLoc.lat, userLoc.lon || userLoc.lng);

                angular.forEach(definedLocations, function(definedLoc) {
                    currentLatLon = new L.LatLng(definedLoc.location.lat, definedLoc.location.lon);
                    distance = newLocLatLng.distanceTo(currentLatLon);

                    if (distance <= definedLoc.location.radius + radius) {
                        location = definedLoc;
                    }
                });

                return location;
            },

            //for Admins: get the predefined location name, from which user checked-in or checked-out.
            getLocationName: function(userStatusObj, definedLocations) {

                //handle if no previous check-in found and got null.
                if (!userStatusObj) {
                    return;
                }

                var locationID = 'Other';
                var locID = userStatusObj['identified-location-id'];

                angular.forEach(definedLocations, function(definedLoc) {
                    if (locID === definedLoc.$id) {
                        locationID = definedLoc.title;
                    }
                });

                return locationID;
            },
            getGroupTitle: function(GroupID){
                var title;
                refs.main.child('groups').child(GroupID).once('value', function(snapshot){
                    // console.log(snapshot.val().title)
                    if (snapshot.val()) {
                        title = snapshot.val().title ? snapshot.val().title : '';
                    }
                });
                return title;
            },
            getSubGroupTitle: function(GroupID, subGroupID){
                var title;
                refs.main.child('subgroups').child(GroupID).child(subGroupID).once('value', function(snapshot){
                    // console.log(snapshot.val().title)
                    if (snapshot.val()) {
                        title = snapshot.val().title ? snapshot.val().title : '';
                    }
                });
                return title;
            }, //getSubGroupTitle
            ChekinUpdateSatatus: ChekinUpdateSatatus

        }; //return
    } //checkin service function
})();
