/**
 * Created by Shahzad on 2/3/2015.
 */

(function () {
    'use strict';

    angular
        .module('checkin')
        .controller( 'UserHomeCheckinCtrl', UserHomeCheckinCtrl );

    UserHomeCheckinCtrl.$inject = [
        '$scope',
        'checkinService',
        'messageService'
    ];

    function UserHomeCheckinCtrl( $scope, checkinService, messageService ) {

        /*VM functions*/
        $scope.updateStatus = updateStatus;
        $scope.filterCheckin = filterCheckin;
        $scope.setSelectedGroup = setSelectedGroup;

        /*VM properties*/
        $scope.geoLocationSupport = checkinService.geoLocationSupport(); // returns true if internet is available and support is present
        $scope.subscribedGroups = {};
        $scope.currentCheckins = {};
        $scope.newStatus = {};
        $scope.userCurrentStatusTypeInGroup = null;
        $scope.selectLocation = true;
        $scope.selectedGroup = null;

        /*private variables*/
        var refGroups, checkinCurrent, membershipsLoc,
            userMemberShipsLoc, selectedGroupID, cachedGroupCheckin;

        cachedGroupCheckin = {};
        refGroups = checkinService.getRefGroups();
        checkinCurrent = checkinService.getRefCheckinCurrent();
        membershipsLoc = checkinService.getRefUserGroupMemberships();
        userMemberShipsLoc = membershipsLoc.child( $scope.userID ); //userID is inherited from parent scope.

        /*Initializing stuff*/
        //....

        /*listeners*/
        userMemberShipsLoc.on('child_added', updateUserMemberShipList );
        userMemberShipsLoc.on('child_changed', updateUserMemberShipList );
        userMemberShipsLoc.on('child_removed', userMemberShipRemoved );


        //Fixes: ng-model of select
        function setSelectedGroup( groupID ) {
            selectedGroupID = groupID;

            if ( groupID ) {
                $scope.newStatus.type = $scope.subscribedGroups[ groupID ].checkin.type == 1 ? 2 : 1;
            } else {
                $scope.newStatus.type = '';
            }
        }

        //to filter only checked-in statuses
        function filterCheckin( groupObj ) {
            return groupObj.checkin && groupObj.checkin.type == 1;
        }

        //to set group checkin in current checkin list of user
        function setCurrentCheckin( groupID ) {
            var userCurrentCheckinLoc = checkinCurrent.child( groupID + '/' +  $scope.userID);
            $scope.subscribedGroups[ groupID ].checkin = checkinService.getFireAsObject( userCurrentCheckinLoc );
        }

        //to remove userMembership from the list
        function userMemberShipRemoved( snap ) {
            var groupID = snap.key();
            delete $scope.subscribedGroups[ groupID ];
        }

        //to update user membershipList
        function updateUserMemberShipList( snap ) {
            var groupObj, groupID,
                groupInfo;

            groupID = snap.key();
            groupObj = snap.val();
            groupInfo = checkinService.getFireAsObject( refGroups.child( groupID ) );

            groupInfo
                .$loaded()
                .then(function () {
                    //If user has a status as suspended or pending-for-approval.
                    if( groupObj['membership-type'] <= 0 ) {
                        //if group is previously listed in subscribed groups list.
                        delete $scope.subscribedGroups[groupID];
                        return;
                    }

                    $scope.subscribedGroups[groupID] = {
                        groupInfo : groupInfo,
                        locations : Firebase.getAsArray( checkinService.getRefGroupLocationsDefined( groupID ) )
                    };

                    setCurrentCheckin( groupID );
                }, function () {
                    console.log('error occurred in fetching data from server.');
                });
        }

        //to update user check-in status
        function updateStatus() {
            if ( !selectedGroupID || !$scope.newStatus.type ) {
                console.log('group or status type is missing');
                return;
            }

            var selectedGroupObj = $scope.subscribedGroups[ selectedGroupID ];
            var requestUpdate = function() {

                //prevents for getting duplicate check-in/out processes.
                $scope.checkinSending = true;

                checkinService.updateUserStatus( selectedGroupID, $scope.userID, $scope.newStatus, selectedGroupObj.locations, selectedGroupObj.groupInfo )
                    .then(function( res ) {
                        //  updateLastStatus();
                        messageService.showSuccess( res );
                        setCheckinListener();
                        $scope.newStatus.message = '';
                        $scope.checkinSending = false;
                    }, function( reason ) {
                        messageService.showFailure( reason );
                        $scope.checkinSending = false;
                    });
            };

            if ( $scope.selectLocation ) {
                checkinService.getCurrentLocation()
                    .then(function( location ) {
                        //console.log("Retrieved user's location: [" + location.coords.latitude + ", " + location.coords.longitude + "]");

                        $scope.newStatus.location = {
                            lat : location.coords.latitude,
                            lon : location.coords.longitude
                        };

                        requestUpdate();
                    }, function( err ) {
                        messageService.showFailure( err.error.message );
                    });
            } else {
                $scope.newStatus.location = null;
                requestUpdate();
            }
        }

        //listening for current status change from any other location in app, to set check-in type inversely.
        function setCheckinListener() {
            //removing previously bind event
            cachedGroupCheckin.ref && cachedGroupCheckin.ref.off('value', cachedGroupCheckin.handler);

            cachedGroupCheckin.ref = checkinCurrent.child( selectedGroupID + '/' + $scope.userID );
            cachedGroupCheckin.groupID = selectedGroupID;
            cachedGroupCheckin.handler = cachedGroupCheckin.ref.on('value', function( snapshot ) {
                if ( cachedGroupCheckin.groupID !== selectedGroupID ) {
                    return;
                }

                var checkinObj = snapshot.val();
                $scope.newStatus.type = checkinObj.type === 1 ? 2 : 1;
            });
        }
    }
})();
