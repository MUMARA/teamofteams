(function() {
    'use strict';

    angular.module('app.geoFencing', ['core'])

    .controller('GeoFencingController', [

        '$interval',
        '$localStorage',
        '$location',
        'messageService',
        '$mdDialog',
        'checkinService',
        'utilService',
        'userService',
        '$stateParams',
        'groupFirebaseService',
        '$timeout',
        '$firebaseObject',
        'firebaseService',
        '$firebaseArray',
        'dateFilter',
        '$rootScope',
        'leafletData',

        function($interval, $localStorage, $location, messageService, $mdDialog, checkinService, utilService, userService, $stateParams, groupFirebaseService, $timeout, $firebaseObject, firebaseService, $firebaseArray, dateFilter, $rootScope, leafletData) {


            $rootScope.address = '';
            this.showPanel = false;
            var $scope = this;

            $scope.center = {};
            $scope.markers = {
                mark : {}
            };
            $scope.center.lat = 24.8131137;
            $scope.center.lng = 67.04971699999999;
            $scope.center.zoom = 20
        
            $scope.markers.mark.lat = 24.8131137;
            $scope.markers.mark.lng = 67.04971699999999;
            $scope.markers.mark.radius = 10;
            $scope.markers.mark.draggable = true;
            $scope.markers.mark.focus = true;
            $scope.markers.mark.message = '34C Stadium Lane 3, Karachi, Pakistan';

            function updatepostion (lat, lng, msg) {
                $scope.center.lat = lat;
                $scope.center.lng = lng;
            
                $scope.markers.mark.lat = lat;
                $scope.markers.mark.lng = lng;
                $scope.markers.mark.focus = true;
                $scope.markers.mark.message = msg;
            }


            // var map = leafletData.getMap().then(function(map) {
            //     return map
            // });



            // var CreateMapData = (function() {
            //     var _lat = 24.8131137,
            //         _lng = 67.04971699999999,
            //         _radius = 0;
            //     var self;
            //     var _circle;
            //     var circleInfo = {
            //         color: 'green',
            //         fillColor: 'green',
            //         fillOpacity: 0.5
            //     };
            //     var _dragable = false;

            //     function CreateMapData(map, scope, newLocation) { /*,setLocation*/


            //         self = this;
            //         this.refresh = false;

            //         Object.defineProperty(self, "lng", {
            //             get: function() {
            //                 return _lng
            //             },
            //             set: function(val) {
            //                 if (val === _lng) return;
            //                 _lng = val;

            //                 if (self.dragable || self.refresh) {
            //                     //self.center.lng = val;
            //                     self.markers.current.lng = val;
            //                     CreateMapData.prototype.updateCircleLatLng(_lat, val);
            //                     self.markers.current.focus = true
            //                 }
            //             },
            //             enumerable: true,
            //             configurable: false
            //         });
            //         Object.defineProperty(self, "lat", {
            //             get: function() {
            //                 return _lat
            //             },
            //             set: function(val) {
            //                 //debugger
            //                 if (val === _lat) return;
            //                 _lat = val;

            //                 if (self.dragable || self.refresh) {
            //                     //self.center.lat = val;
            //                     self.markers.current.lat = val;
            //                     CreateMapData.prototype.updateCircleLatLng(val, _lng);
            //                     self.markers.current.focus = true
            //                 } else {

            //                 }
            //             },
            //             enumerable: true,
            //             configurable: false

            //         });

            //         checkinService.getCurrentLocation()
            //             .then(function(data) {
            //                 self.lat = data.coords.latitude || 24.8131137;
            //                 self.lng = data.coords.longitude || 67.04971699999999
            //             });
            //         this.markers = {
            //             current: {
            //                 lat: self.lat,
            //                 lng: self.lng,
            //                 message: '<strong> 34C Stadium Lane 3, Karachi, Pakistan </span>',
            //                 focus: true,
            //                 draggable: self.dragable
            //             }

            //         };
            //         Object.defineProperty(self, 'dragable', {

            //             get: function() {
            //                 return _dragable;
            //             },
            //             set: function(val) {
            //                 if (val === _dragable) return;
            //                 self.markers.current.draggable = val;
            //                 _dragable = val;
            //             }
            //         });
            //         Object.defineProperty(self, 'radius', {
            //             get: function() {
            //                 return _radius
            //             },
            //             set: function(val) {
            //                 if (val == _radius) return;
            //                 _radius = val;
            //                 CreateMapData.prototype.updateCircleRadius(val);
            //                 //CreateMapData.prototype.updateCircleLatLng(self.lat, self.lng)
            //             }

            //         });
            //         this.center = {
            //             lat: self.lat,
            //             lng: self.lng,
            //             zoom: 16
            //         };


            //         //this.map = map;
            //         this.circle = new L.circle([self.lat, self.lng], self.radius, circleInfo);
            //         this.events = {
            //             markers: {
            //                 enable: ["dragstart", "drag", "dragend"]
            //             }

            //         };

            //         if (scope) {
            //             for (var k in self.events.markers.enable) {
            //                 var eventName = 'leafletDirectiveMarker.' + self.events.markers.enable[k];
            //                 scope.$on(eventName, function(event, args) {
            //                     CreateMapData.prototype.setLatLng(args.leafletEvent.target._latlng.lat, args.leafletEvent.target._latlng.lng);
            //                     //console.log('he')
            //                 });
            //             }
            //         }

            //     }

            //     CreateMapData.prototype = {

            //         'newLatLngObj': function(lat, lng) {
            //             //debugger
            //             return new L.LatLng(lat, lng)
            //         },
            //         'setPopupMessage': function(message) { //set message
            //             self.markers.current.message = '<strong>' + message + '</strong><br/>'
            //         },
            //         'updateCircleRadius': function(radius) {

            //             self.circle.setRadius(radius || self.radius);
            //             //setLocation();

            //         },
            //         'updateCircleLatLng': function(lat, lng) {
            //             if (!_circle) {
            //                 leafletData.getMap().then(function(map) {
            //                     _circle = self.circle.addTo(map)
            //                     _circle.setLatLng(self.newLatLngObj(lat, lng))
            //                 })
            //             } else {
            //                 _circle.setLatLng(self.newLatLngObj(lat, lng))
            //             }
            //             //_circle.setLatLng(this.newLatLngObj(lat, lng))
            //         },
            //         'makeCircle': function(radius) {
            //             if (!_circle) {
            //                 leafletData.getMap().then(function(map) {
            //                     _circle = self.circle.addTo(map)
            //                 })
            //             } else {
            //                 this.updateCircleLatLng(self.lat, self.lng)
            //             }
            //             if (radius) {
            //                 self.radius = radius
            //             }


            //         },
            //         'toggleDrag': function(bool) {
            //             self.dragable = !self.dragable;
            //         },
            //         'setLatLng': function(lat, lng, flag) {
            //             if (flag) {
            //                 self.refresh = true
            //             }
            //             self.lat = lat;
            //             self.lng = lng;
            //             // if (flag) {
            //             //     self.refresh = false
            //             // }
            //             //setLocation()
            //         },
            //         'reset': function() {
            //             this.setLatLng(24.8131137, 67.04971699999999, true);
            //             self.radius = 0;
            //             self.setPopupMessage('<strong> 34C Stadium Lane 3, Karachi, Pakistan </span>');

            //             //setLocation()
            //         }

            //     }
            //     return CreateMapData

            // })()

            // var $scope = this;
            $scope.getLatLngByAddress = getLatLngByAddress;
            // $rootScope.mapData = new CreateMapData(map, $rootScope);
            //window.mapdata = $rootScope.mapData //for debugging purpose

            var groupId = $scope.groupId = $stateParams.groupID;
            var SubgroupObj, userId = $scope.userId = userService.getCurrentUser().userID;
            var subgroupId = $scope.subgroupId = undefined;
            // $scope.getLatLng = getLatLngByAddress;

            this.openCreateSubGroupPage = function() {
                $location.path('/user/group/' + groupId + '/create-subgroup');
            }
            this.openUserSettingPage = function() {
                $location.path('/user/group/' + groupId + '/user-setting');
            };
            this.openEditGroup = function() {
                $location.path('user/group/' + groupId + '/edit-group');
            };
            // this.hide = function() {

            //     $location.path('/user/group/' + groupId);

            // }

            this.showLocationBySubGroup = function(subgroupId, index, b) {
                $timeout(function(){
                    angular.element('#leafletmap').attr('height', '');
                    angular.element('#leafletmap').attr('width', '');
                },0)
                wrapperGeoLoacation(subgroupId)
            };

            groupFirebaseService.getGroupSyncObjAsync(groupId, userId)
                .then(function(syncObj) {
                    $scope.subgroups = syncObj.subgroupsSyncArray;
                    // $firebaseArray(syncObj.subgroupRef).$loaded().then(function(data) {
                    //     if (data.length > 0) {
                    //         subgroupId = $scope.subgroups[0].$id;
                    //         wrapperGeoLoacation($scope.subgroups[0].$id)
                    //     } else {
                    //         $rootScope.mapData.reset()
                    //     }
                    // })
                });

            function wrapperGeoLoacation(sub) {
                if (sub) {
                    $scope.subgroupId = sub
                }
                var _subgroupId = sub || subgroupId;

                checkinService.createCurrentRefsBySubgroup(groupId, _subgroupId, userId).then(function() {
                    $scope.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations()
                        .$loaded().then(function(data) {
                            if (data.length > 0) {
                                updatepostion(data[0].location.lat, data[0].location.lon, data[0].title);
                                // $rootScope.mapData.setLatLng(data[0].location.lat, data[0].location.lon, true);
                                // $rootScope.mapData.makeCircle(data[0].location.radius)
                                // $rootScope.mapData.setPopupMessage(data[0].title)
                            } else {
                                updatepostion(24.8131137, 67.04971699999999, '');
                                // $rootScope.mapData.reset()
                            }
                        })
                });

            }

            function getLatLngByAddress(newVal) { 
                if (newVal) {
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({
                        'address': newVal
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            //debugger
                            // console.log(results[0].formatted_address)
                            var lat = results[0].geometry.location.lat() ? results[0].geometry.location.lat() : 0;
                            var lng = results[0].geometry.location.lng() ? results[0].geometry.location.lng() : 0;
                            updatepostion(lat, lng, results[0].formatted_address);
                            // $rootScope.mapData.setPopupMessage(results[0].formatted_address)
                            // $rootScope.mapData.setLatLng(lat, lng, true);
                        }
                    });
                }

            }
            $scope.setSubgroupLocation = setSubgroupLocation;

            function setSubgroupLocation() {
                //return
                var infoObj = {
                    groupID: $scope.groupId,
                    subgroupID: $scope.subgroupId,
                    userID: $scope.userId,
                    // title: 'location title',
                    title: $rootScope.mapData.markers.current.message,
                    locationObj: $rootScope.mapData.markers.current

                };
                infoObj.locationObj.radius = $rootScope.mapData.radius;

                checkinService['addLocationBySubgroup'](groupId, subgroupId, userId, infoObj, false)
                    .then(function(res) {
                        $scope.submitting = false;
                        messageService.showSuccess(res);
                        $mdDialog.hide();
                    }, function(err) {
                        $scope.submitting = false;
                        messageService.showFailure(err);
                    });
            }
            // var temp = $rootScope.mapData.makeCircle();


            function UserMemberShipFunc() {
                var userMemberships = checkinService.getFireAsObject(refUserMemberShip.child(userID));
                userMemberships.$loaded().then(function(data) {
                    var memberShipGroup = userMemberships[groupID][subgroupID];
                    //if( ( memberShipGroup['membership-type'] == 1 ) || ( memberShipGroup['membership-type'] == 2 ) ){
                    //    $scope.isAdmin = true;
                    //}else{
                    //    $scope.isAdmin = false;
                    //}

                    $scope.isAdmin = memberShipGroup && (memberShipGroup['membership-type'] == 1 || memberShipGroup['membership-type'] == 2);
                });
            }

        }
    ]);
})();
//http://stackoverflow.com/questions/5984179/javascript-geocoding-from-address-to-latitude-and-longitude-numbers-not-working
