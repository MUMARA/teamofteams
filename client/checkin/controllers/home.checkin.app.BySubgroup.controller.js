/**
 * Created by ZiaKhan on 20/01/15.
 * following angularJS code-style guide https://github.com/johnpapa/angularjs-styleguide
 */
(function(){
    // Invoke 'strict' JavaScript mode
    'use strict';

    angular
        .module('checkin')
        .controller('CheckinBySubgroupHomeCtrl', CheckinBySubgroupHomeCtrl);

    CheckinBySubgroupHomeCtrl.$inject = [
        '$scope',
        '$sessionStorage',
        '$location',
        'messageService',
        '$mdDialog',
        'checkinService',
        'utilService',
        '$localStorage'
    ];

    function CheckinBySubgroupHomeCtrl( $scope, $sessionStorage, $location, messageService, $mdDialog, checkinService, utilService,$localStorage){

        /*VM binding functions*/
        $scope.showLocation = showLocation;
        $scope.showAddLocation = showAddLocation;
        $scope.getLocationName = checkinService.getLocationName;
        $scope.getLocationStatus = getLocationStatus;

        /*VM binding variables*/
        $scope.members = {};
        //$scope.user = $sessionStorage.loggedInUser;
        $scope.user = $localStorage.loggedInUser;

        var userID, groupID,subgroupID,
            refSubGroupCheckinStatus, refUsers, refUserMemberShip;

        userID = $scope.user.userID;
        groupID = $location.path().split('/')[1];
        subgroupID = $location.path().split('/')[2];
        //groupID = utilService.trimID( groupID );

        /*Initialization stuff*/

        // create required refs
        checkinService.createCurrentRefsBySubgroup( groupID,subgroupID, userID );
        $scope.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations();
        refSubGroupCheckinStatus = checkinService.getRefSubGroupCheckinCurrent( groupID,subgroupID );
        refUsers = checkinService.getRefUsers();
        refUserMemberShip = checkinService.getRefUserSubGroupMemberships();

        $scope.filterIn = function(item){
            return item.currentStatus.type === 1;
        };

        $scope.filterOut = function(item){
            return item.currentStatus.type === 2;
        };

        //to check members is admin of group or not
        function UserMemberShipFunc (){
            var userMemberships = checkinService.getFireAsObject( refUserMemberShip.child(userID) );
            userMemberships.$loaded().then(function(data){
                var memberShipGroup = userMemberships[groupID][subgroupID];
                //if( ( memberShipGroup['membership-type'] == 1 ) || ( memberShipGroup['membership-type'] == 2 ) ){
                //    $scope.isAdmin = true;
                //}else{
                //    $scope.isAdmin = false;
                //}

                $scope.isAdmin = memberShipGroup && ( memberShipGroup['membership-type'] == 1 || memberShipGroup['membership-type'] == 2 );
            });
        }

        //to check members is admin of group or not
        UserMemberShipFunc();

        refSubGroupCheckinStatus.on('child_added', function( snap ){
            var userID = snap.key();
            $scope.members[ userID ] = {
                profile: checkinService.getFireAsObject( refUsers.child( userID ) ),
                currentStatus: checkinService.getFireAsObject( refSubGroupCheckinStatus.child( userID ) )
            }
        });

        refSubGroupCheckinStatus.on('child_removed', function( snap ){
            var userID = snap.key();
            delete $scope.members[userID];
        });

        //show user's location via map dialog
        function showLocation (evt, detailsObj, isMember){

            var objectForMap;

            if ( isMember ) {
                objectForMap = {
                    location: detailsObj.currentStatus.location,
                    timestamp: detailsObj.currentStatus.timestamp,
                    message: detailsObj.profile.firstName + ' ' +  detailsObj.profile.lastName
                };
            } else {
                objectForMap = {
                    location: detailsObj.location,
                    timestamp: detailsObj.timestamp,
                    message: detailsObj.title
                };
            }

            $mdDialog.show({
                controller: MapDialogController,
                templateUrl: 'core/views/dialogMap.tmpl.html',
                targetEvent: evt,
                locals: {
                 detailsObj: objectForMap
                }
            });
        }

        //map dialog controller
        function MapDialogController( $scope, $mdDialog, dateFilter, detailsObj ) {
            debugger;
            var filteredDate = dateFilter( detailsObj.timestamp, 'medium' );

            $scope.hide = function() {
                $mdDialog.cancel();
            };

            $scope.mapDefault = {
                center : {
                    lat: detailsObj.location.lat,
                    lng: detailsObj.location.lon,
                    zoom: 16
                }
            };

            $scope.markers = {
                userMarker: {
                    lat: detailsObj.location.lat,
                    lng: detailsObj.location.lon,
                    message: '<strong>' + detailsObj.message + '</strong><br/><span>'+ filteredDate +'</span>',
                    focus: true,
                    draggable: false
                }
            };
        }

        //for Admins: to create a new location for current group
        function showAddLocation( evt ) {

            $mdDialog.show({
                controller: 'DefineLocationCtrl',
                templateUrl: './checkin/views/defineLocation.tmpl.html',
                targetEvent: evt,
                locals: {
                    infoObj:{
                        groupID : groupID,
                        subgroupID:subgroupID,
                        userID : userID,
                        //definedLocations : $scope.definedGroupLocations
                        definedLocations : $scope.definedSubGroupLocations,
                        bySubgroup:true

                    }


                },
                resolve: {
                    currentLocation: function() {
                        return checkinService.getCurrentLocation();
                    }
                }
            });
        }
        function getLocationStatus(){
            return $scope.definedSubGroupLocations.length?'Edit defined Location':'Add a new location'
        }
    }
})();
