/**
 * Created by Shahzad on 1/28/2015.
 */

(function(){
    'use strict';

    angular
        .module('checkin')
        .controller('DefineLocationCtrl', DefineLocationCtrl);

    DefineLocationCtrl.$inject = [
        '$scope',
        '$mdDialog',
        'infoObj',
        'currentLocation',
        'checkinService',
        'leafletData',
        'messageService'


    ];

    function DefineLocationCtrl( $scope, $mdDialog, infoObj, currentLocation, checkinService, leafletData, messageService) {

        //watchers for marker and radius values
        $scope.$watch('location.radius', updateCircleRadius );
        $scope.$watch('markers.current.lat', updateCircleLangLng);
        $scope.$watch('markers.current.lng', updateCircleLangLng);

        /*VM properties*/
        angular.extend( $scope, {
            center : {
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude,
                zoom: 16
            },
            location : {
                radius :infoObj.definedLocations.length ?infoObj.definedLocations[0].location.radius : 22
            },
            markers :{},
            groupLocations: [],
            /*VM functions*/
            addLocation : addLocation,
            hide : hide,
            getBtnStatus:getBtnStatus
        });

        /*private variables*/
        var circle;

        //gets rendered leaflet map and draw circles
        leafletData.getMap()
            .then(function( map ) {
                var circleOptions, location;

                //bind a circle to the new location's marker.
                circleOptions = {
                    color: 'green',
                    fillColor: 'green',
                    fillOpacity: 0.5
                };

               /* circle = L.circle([$scope.markers.current.lat, $scope.markers.current.lng], $scope.location.radius, circleOptions )
                    .addTo(map);*/

                //map each defined location and add that to leaflet markers. below commented code is for multiple locations definition
              /*  angular.forEach(infoObj.definedLocations, function( loc, index ) {
                    location = {
                        lat: loc.location.lat,
                        lng: loc.location.lon,
                        draggable : false,
                        focus: false,
                        message : loc.title
                    };

                    $scope.markers[index] = location;

                    //bind a circle with respect to defined radius.
                    L.circle([location.lat, location.lng], loc.location.radius)
                        .addTo(map);
                })*/
                if (infoObj.definedLocations.length){
                    $scope.markers.current = {
                        lat:  infoObj.definedLocations[0].location.lat,
                        lng:  infoObj.definedLocations[0].location.lon,
                        draggable: true,
                        focus: true,
                        message: "location title"
                    };

                }else{
                    $scope.markers.current = {
                        lat:  currentLocation.coords.latitude,
                        lng:  currentLocation.coords.longitude,
                        draggable: true,
                        focus: true,
                        message: "location title"
                    };
                }


                circle = L.circle([$scope.markers.current.lat, $scope.markers.current.lng], $scope.location.radius, circleOptions )
                    .addTo(map);
            });

        //to hide or close modal.
        function hide () {
            $mdDialog.cancel();
        }

        //updates LatLng values of circle.
        function updateCircleLangLng() {
            if ( circle && $scope.markers.current.lat && $scope.markers.current.lng ) {
                var newLatLng = new L.LatLng( $scope.markers.current.lat, $scope.markers.current.lng );
                circle.setLatLng( newLatLng );
            }
        }

        //updates radius of a circle.
        function updateCircleRadius(radius) {
            if ( circle && radius && $scope.markers.current.lat && $scope.markers.current.lng ) {
                circle.setRadius( radius );
            }
        }

        //on submit, adds locations to group.
        function addLocation() {
            $scope.location.title = $scope.markers.current.message;
            var matchedLocation = checkinService.getDefinedLocationByLatLng( $scope.markers.current, infoObj.definedLocations, $scope.location.radius );

            if ( matchedLocation.$id ) {
                messageService.showFailure('location already acquired by "' + matchedLocation.title + '"! please adjust the marker for new location.');
                return;
            }

            //flag to prevent duplicate requests
            $scope.submitting = true;

            angular.extend( $scope.location, $scope.markers.current );
            if($scope.$parent.subgroupID){

            }

            //checkinService.addLocation( infoObj.groupID, infoObj.userID, $scope.location )
            checkinService[(infoObj.bySubgroup?'addLocationBySubgroup':'addLocation')]( infoObj.groupID,infoObj.subgroupID,infoObj.userID, $scope.location )
                .then(function( res ) {
                    $scope.submitting = false;
                    messageService.showSuccess( res );
                    $mdDialog.hide();
                }, function( err ) {
                    $scope.submitting = false;
                    messageService.showFailure( err );
                });

        }
        function getBtnStatus(){
            return infoObj.definedLocations.length ? 'Update Location':'Create Location'
        }
    }
})();
