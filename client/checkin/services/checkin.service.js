/**
 * Created by Shahzad on 1/21/2015.
 */

(function() {
    'use strict';

    angular
        .module('checkin')
        .factory('checkinService', checkinService);

    checkinService.$inject = ['$q', '$geolocation', 'firebaseService', "$firebaseObject",'$firebaseArray'];

    function checkinService( $q, $geolocation, firebaseService, $firebaseObject,$firebaseArray ) {

        /*private variables*/
        var refs, fireTimeStamp;

        //firebase unix-epoch time
        fireTimeStamp = Firebase.ServerValue.TIMESTAMP;

        refs = {
            main : firebaseService.getRefMain()
        };

        refs.refGroupCheckinCurrent = refs.main.child('group-check-in-current');
        refs.refGroupCheckinRecords = refs.main.child('group-check-in-records');
        refs.refGroupLocationsDefined = refs.main.child('group-locations-defined');

        refs.refSubGroupCheckinCurrent = refs.main.child('subgroup-check-in-current');
        refs.refSubGroupCheckinRecords = refs.main.child('subgroup-check-in-records');
        refs.refSubGroupLocationsDefined = refs.main.child('subgroup-locations-defined');
        refs.refSubGroupCheckinCurrentByUser = refs.main.child('subgroup-check-in-current-by-user');


        return {

            getRefUsers: firebaseService.getRefUsers,
            getRefGroups: firebaseService.getRefGroups,
            getRefUserGroupMemberships: firebaseService.getRefUserGroupMemberships,
            getRefUserSubGroupMemberships: firebaseService.getRefUserGroupMemberships,
            createCurrentRefs: function ( groupID, userID ) {
                refs.$currentGroupLocations = Firebase.getAsArray( refs.refGroupLocationsDefined.child(groupID) );
                refs.refCurrentGroupCheckinCurrent = refs.refGroupCheckinCurrent.child( groupID );

                var userCheckinRecords = refs.refGroupCheckinRecords.child( groupID + '/' + userID  );
                refs.$userCheckinRecords = Firebase.getAsArray( userCheckinRecords );
            },
            createCurrentRefsBySubgroup: function ( groupID,subgroupID, userID ) {
                //refs.$currentSubGroupLocations = Firebase.getAsArray( refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID ) );
                refs.$currentSubGroupLocations = $firebaseArray( refs.refSubGroupLocationsDefined.child(groupID + "/" + subgroupID ) );
                //refs.refCurrentSubGroupCheckinCurrent = refs.refSubGroupCheckinCurrent.child( groupID).child(subgroupID);
                var userCheckinRecords = refs.refSubGroupCheckinRecords.child( groupID + '/' +subgroupID + '/' + userID  );
                refs.$userCheckinRecords = Firebase.getAsArray( userCheckinRecords );
            },
            getRefSubgroupCheckinCurrentByUser:function(){
                return refs.refSubGroupCheckinCurrentByUser;
            },
            getFireAsObject: function ( ref ) {
                return $firebaseObject( ref );
            },
            getRefGroupLocationsDefined: function( groupID ) {
                return refs.refGroupLocationsDefined.child( groupID );
            },
            getRefCheckinCurrent: function() {
                return refs.refGroupCheckinCurrent;
            },
            getRefCheckinCurrentBySubgroup: function() {
                return refs.refSubGroupCheckinCurrent;
            },
            getRefGroupCheckinCurrent: function( groupID ) {
                return refs.refGroupCheckinCurrent.child(groupID);
            },
            getRefSubGroupCheckinCurrent: function( userID ,groupID , subgroupId ) {
                return refs.refSubGroupCheckinCurrent.child( userID+ '/' + groupID + '/' + subgroupId);
            },
            getFireCurrentGroupLocations: function() {
                return refs.$currentGroupLocations;
            },
            getFireCurrentSubGroupLocations: function() {
                return refs.$currentSubGroupLocations;
            },
            getFireGroup: function( groupID ) {
                var refGroups = this.getRefGroups();
                return this.getFireAsObject( refGroups.child( groupID ) );
            },
            geoLocationSupport: function() {
                return typeof window.navigator !== 'undefined' && typeof window.navigator.geolocation !== 'undefined';
            },
            getCurrentLocation: function () {
                return $geolocation.getCurrentPosition({
                    timeout: 60000,
                    maximumAge: 250,
                    enableHighAccuracy: true
                });
            },
            updateUserStatusBySubGroup: function( groupID, subgroupId, userID, statusObj, definedLocations, groupObj ) {
                var defer = $q.defer();
                var errorCallback = function (err) {
                    defer.reject('error occurred in connecting to the server', err);
                };

                var self = this;

                var identifiedLocation = statusObj.location ? this.getDefinedLocationByLatLng( statusObj.location, definedLocations).$id : 'Other';

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

                checkinObj.message = statusObj.message || ( statusObj.type == 1 ? 'Checked-in' : 'Checked-out' );

                var userCheckinCurrent = refs.refSubGroupCheckinCurrent.child( groupID +  '/' + subgroupId + '/' +  userID  );
                var $userCheckinCurrent = $firebaseObject( userCheckinCurrent );

                $userCheckinCurrent
                    .$loaded()
                    .then(function() {
                        var userCheckinRecordsRef = refs.refSubGroupCheckinRecords.child(groupID +  '/' + subgroupId+ '/' +  userID );
                        var _ref = new Firebase(userCheckinRecordsRef.toString());
                        var _userCheckinREcordsRef = $firebaseArray(_ref);
                        _userCheckinREcordsRef.$add(checkinObj)
                            .then(function(snapShot){
                                var temp = $firebaseObject( refs.refSubGroupCheckinCurrentByUser.child(userID))
                                    .$loaded().then(function(snapshot){
                                        snapshot.timestamp = fireTimeStamp;
                                        snapshot.type = statusObj.type; // 1 = in, 2 = out
                                        snapshot.groupID = groupID;
                                        snapshot.subgroupID = subgroupId;
                                        snapshot['source-device-type'] = 1; // 1 = Web, 2 = iPhone, 3 = Android
                                        snapshot['source-type']= 1;  //1 = manual in web or mobile, 2 = automatic by geo-fencing in mobile, 3 =  automatic by beacon’s in mobile
                                        snapshot.$save().then(function(d){

                                            checkinObj['record-ref'] = snapShot.key();
                                            angular.extend( $userCheckinCurrent, checkinObj );
                                            $userCheckinCurrent.$save()
                                                .then(function() {
                                                    self.updateSubGroupCount( groupID, subgroupId, checkinObj.type )
                                                        .then(function () {
                                                            /*self.asyncRecordUserCheckSubGroupActivity(checkinObj, userID, groupID,subgroupId, groupObj, definedLocations)
                                                             .then(function () {
                                                             defer.resolve('Status updated successfully.');
                                                             }, errorCallback);*/
                                                            defer.resolve('Status updated successfully.');
                                                        }, errorCallback);

                                                }, errorCallback);

                                        },errorCallback)

                                    },errorCallback)

                            },errorCallback)

                    }, errorCallback);

                return defer.promise;
            },
            updateUserStatus: function( groupID, userID, statusObj, definedLocations, groupObj ) {
                var defer = $q.defer();
                var errorCallback = function (err) {
                    defer.reject('error occurred in connecting to the server', err);
                };

                var self = this;

                var identifiedLocation = statusObj.location ? this.getDefinedLocationByLatLng( statusObj.location, definedLocations).$id : 'Other';

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

                checkinObj.message = statusObj.message || ( statusObj.type == 1 ? 'Checked-in' : 'Checked-out' );

                var userCheckinCurrent = refs.refGroupCheckinCurrent.child( groupID + '/' +  userID  );
                var $userCheckinCurrent = $firebaseObject( userCheckinCurrent );

                $userCheckinCurrent
                    .$loaded()
                    .then(function() {

                        var userCheckinRecordsRef = refs.refGroupCheckinRecords.child( groupID + '/' +  userID  );
                        var $userCheckinRecords = Firebase.getAsArray( userCheckinRecordsRef );

                        var recRef = $userCheckinRecords.$add( checkinObj );
                        checkinObj.id = recRef.key();

                        angular.extend( $userCheckinCurrent, checkinObj );
                        $userCheckinCurrent.$save()
                            .then(function() {
                                self.updateGroupCount( groupID, checkinObj.type )
                                    .then(function () {
                                        self.asyncRecordUserCheckGroupActivity(checkinObj, userID, groupID, groupObj, definedLocations)
                                            .then(function () {
                                                defer.resolve('Status updated successfully.');

                                            }, errorCallback);

                                    }, errorCallback);

                            }, errorCallback);

                    }, errorCallback);

                return defer.promise;
            },
            updateGroupCount: function ( groupID, checkinType ) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefGroups().child( groupID + '/members-checked-in');
                var $checkin = $firebaseObject( groupCheckedIn );

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ( $checkin.count || 0 ) + ( checkinType == 1 ? 1 : -1 );
                        $checkin.$save().then(function () {
                            defer.resolve();
                        }, function () {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });

                return defer.promise;
            },
            updateSubGroupCount: function ( groupID, subgroupID , checkinType ) {
                var defer = $q.defer();

                var groupCheckedIn = firebaseService.getRefGroups().child( groupID + '/' + subgroupID + '/members-checked-in');
                var $checkin = $firebaseObject( groupCheckedIn );

                $checkin.$loaded()
                    .then(function() {
                        $checkin.count = ( $checkin.count || 0 ) + ( checkinType == 1 ? 1 : -1 );
                        $checkin.$save().then(function () {
                            defer.resolve();
                        }, function () {
                            defer.reject();
                        });
                    }, function() {
                        defer.reject();
                    });

                return defer.promise;
            },
            asyncRecordUserCheckGroupActivity: function( checkinObj, userID, groupID, groupObj, definedLocations ){
                var deferred = $q.defer();

                var currentUser = firebaseService.getSignedinUserObj();
                var locationName = this.getLocationName( checkinObj, definedLocations );
                var groupActivityRef = firebaseService.getRefGroupsActivityStreams().child( groupID );

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
                    image : null
                };

                var target = {
                    type: 'group',
                    id: groupID, //an index should be set on this
                    url: groupID,
                    displayName: groupObj.title
                };

                var displayName = actor.displayName +
                    ( checkinObj.type == 1 ? ' checked-in' : ' checked-out' ) +
                    ' at "' + locationName +
                    '" location of ' + groupObj.title + '.';

                var activity = {
                    language: 'en',
                    verb: checkinObj.type == 1 ? 'check-in' : 'check-out',
                    published: fireTimeStamp,
                    displayName: displayName,
                    actor : actor,
                    object : object,
                    target : target
                };

                var newActivityRef = groupActivityRef.push();
                newActivityRef.set(activity, function( err ){
                    if ( err ) {
                        deferred.reject();
                        console.log('error occurred in check-in activity', err);
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = groupActivityRef.child(activityID);
                        activityEntryRef.once('value', function( snapshot ) {
                            var timestamp = snapshot.val();
                            newActivityRef.setPriority(0 - timestamp.published, function( error ) {
                                if ( error ) {
                                    deferred.reject();
                                    console.log('error occurred in check-in activity', error);
                                }
                                else {
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });

                return deferred.promise;
            },
            asyncRecordUserCheckSubGroupActivity: function( checkinObj, userID, groupID,subgroupID, groupObj, definedLocations ){
                var deferred = $q.defer();

                var currentUser = firebaseService.getSignedinUserObj();
                var locationName = this.getLocationName( checkinObj, definedLocations );
                var subGroupActivityRef = firebaseService.getRefSubGroupsActivityStreams().child( groupID + "/" + subgroupID ); //"subgroup-activity-streams"

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
                    image : null
                };

                var target = {
                    type: 'group',
                    id: subgroupID, //an index should be set on this
                    url: subgroupID,
                    displayName: groupObj.title
                };

                var displayName = actor.displayName +
                    ( checkinObj.type == 1 ? ' checked-in' : ' checked-out' ) +
                    ' at "' + locationName +
                    '" location of ' + groupObj.title + '.';

                var activity = {
                    language: 'en',
                    verb: checkinObj.type == 1 ? 'check-in' : 'check-out',
                    published: fireTimeStamp,
                    displayName: displayName,
                    actor : actor,
                    object : object,
                    target : target
                };

                var newActivityRef = subGroupActivityRef.push();
                newActivityRef.set(activity, function( err ){
                    if ( err ) {
                        deferred.reject();
                        console.log('error occurred in check-in activity', err);
                    } else {
                        var activityID = newActivityRef.key();
                        var activityEntryRef = subGroupActivityRef.child(activityID);
                        activityEntryRef.once('value', function( snapshot ) {
                            var timestamp = snapshot.val();
                            newActivityRef.setPriority(0 - timestamp.published, function( error ) {
                                if ( error ) {
                                    deferred.reject();
                                    console.log('error occurred in check-in activity', error);
                                }
                                else {
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });

                return deferred.promise;
            },
            addLocation: function( groupID, userID, locationObj ) {
                var defer = $q.defer();

                var newLocation = {
                    'group-url': groupID,
                    'title' : locationObj.title,
                    'type': 1,// 1 = Geo location, 2 = Beacon
                    'location': {
                        'lat' : locationObj.lat,
                        'lon': locationObj.lng,
                        'radius': locationObj.radius
                    },
                    'defined-by': userID, //only admins or owners can define a office location
                    'timestamp': fireTimeStamp
                };

                var ref = refs.$currentGroupLocations.$add( newLocation );
                if( ref.key() ){
                    defer.resolve('Location has been added to "' + groupID + '".');
                } else {
                    defer.reject('Error occurred in saving on server.');
                }

                return defer.promise;
            },
            addLocationBySubgroup: function( groupID,subgroupID, userID, locationObj ,multiple,recordId ) {
                var defer = $q.defer();

                var newLocation = {
                    'subgroup-url': groupID + '/' + subgroupID,
                    'title' : locationObj.title,
                    'type': 1,// 1 = Geo location, 2 = Beacon
                    'location': {
                        'lat' : locationObj.locationObj.lat,
                        'lon': locationObj.locationObj.lng,
                        'radius': locationObj.locationObj.radius
                    },
                    'defined-by': userID, //only admins or owners can define a office location
                    'timestamp': fireTimeStamp
                };
                var syncRef;
                if(!multiple && refs.$currentSubGroupLocations.length){
                    //syncRef = refs.$currentSubGroupLocations.$set( refs.$currentSubGroupLocations[0].$id , newLocation)
                    angular.extend(refs.$currentSubGroupLocations[0],newLocation)
                    refs.$currentSubGroupLocations.$save(0)
                        .then(function(){
                            defer.resolve('Location has been added to "' + subgroupID + '".');
                        },function(){
                            defer.reject('Error occurred in saving on server.');
                        })

                }else{

                    refs.$currentSubGroupLocations.$add( newLocation )
                        .then(function(){
                            defer.resolve('Location has been added to "' + subgroupID + '".');
                        },function(){
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
            getDefinedLocationByLatLng: function ( userLoc, definedLocations, radius ) {
                var distance, currentLatLon,
                    location, newLocLatLng;

                //setting default in case no location matches.
                location = {
                    title: 'Other',
                    $id: 'Other'
                };

                //if no radius provided to calculate distance. e.g user check-in/out from any location.
                radius = radius || 0;

                newLocLatLng = new L.LatLng( userLoc.lat, userLoc.lon || userLoc.lng );

                angular.forEach( definedLocations, function ( definedLoc ) {
                    currentLatLon = new L.LatLng( definedLoc.location.lat, definedLoc.location.lon);
                    distance = newLocLatLng.distanceTo( currentLatLon );

                    if ( distance <= definedLoc.location.radius + radius ) {
                        location = definedLoc;
                    }
                });

                return location;
            },

            //for Admins: get the predefined location name, from which user checked-in or checked-out.
            getLocationName: function( userStatusObj, definedLocations ) {

                //handle if no previous check-in found and got null.
                if ( !userStatusObj ) {
                    return;
                }

                var locationID = 'Other';
                var locID = userStatusObj['identified-location-id'];

                angular.forEach( definedLocations, function ( definedLoc ) {
                    if ( locID === definedLoc.$id ) {
                        locationID = definedLoc.title;
                    }
                });

                return locationID;
            }
        }
    }
})();
