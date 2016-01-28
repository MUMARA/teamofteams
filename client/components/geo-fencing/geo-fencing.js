(function() {
    'use strict';

    angular.module('app.geoFencing', ['core'])

    .controller('GeoFencingController', [

        '$interval',
        '$state',
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
        '$scope',


        function($interval, $state, $location, messageService, $mdDialog, checkinService, utilService, userService, $stateParams, groupFirebaseService, $timeout, $firebaseObject, firebaseService, $firebaseArray, dateFilter, $rootScope, leafletData, $scope) {


            $rootScope.address = '';
            this.showPanel = false;
            var that = this;

            this.isProcessing = false;
            that.fencing = true;
            this.center = {};
            this.markers = {
                mark : {}
            };
            this.paths = { 
                c1: {}
            };

            this.defaults = {
                scrollWheelZoom: false
            }
            this.center.lat = 24.8131137;
            this.center.lng = 67.04971699999999;
            this.center.zoom = 20
        
            this.markers.mark.lat = this.center.lat;
            this.markers.mark.lng = this.center.lng;
            this.markers.mark.draggable = true;
            this.markers.mark.focus = true;
            this.markers.mark.message = '34C Stadium Lane 3, Karachi, Pakistan';

            this.paths.c1.type = 'circle';
            this.paths.c1.weight = 2;
            this.paths.c1.color = 'green';
            this.paths.c1.latlngs = this.center;
            this.paths.c1.radius = 20;

            function updatepostion (lat, lng, msg) {
                that.paths.c1.latlngs = { lat: lat, lng: lng };
                that.markers.mark.lat = lat;
                that.markers.mark.lng = lng;
                that.markers.mark.focus = true;
                that.markers.mark.message = msg;
                that.center.lat = lat;
                that.center.lng = lng;
                
                
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

            // var that = this;
            that.getLatLngByAddress = getLatLngByAddress;
            // $rootScope.mapData = new CreateMapData(map, $rootScope);
            //window.mapdata = $rootScope.mapData //for debugging purpose

            var groupId = that.groupId = $stateParams.groupID;
            var SubgroupObj, userId = that.userId = userService.getCurrentUser().userID;
            var subgroupId = that.subgroupId = undefined;
            // that.getLatLng = getLatLngByAddress;

            this.openCreateSubGroupPage = function() {
                // $location.path('/user/group/' + groupId + '/create-subgroup');
                $state.go('user.create-subgroup', {groupID: groupId})
            }
            this.openUserSettingPage = function() {
                // $location.path('/user/group/' + groupId + '/user-setting');
                $state.go('user.user-setting', {groupID: groupId})
            };
            this.openEditGroup = function() {
                // $location.path('user/group/' + groupId + '/edit-group');
                $state.go('user.edit-group', {groupID: groupId})
            };
            // this.hide = function() {

            //     $location.path('/user/group/' + groupId);

            // }
            that.groupAdmin = false
            firebaseService.getRefUserGroupMemberships().child(userId).child(groupId).once('value', function(group){
                if (group.val()['membership-type'] == 1) {
                    that.groupAdmin = true;
                } else if (group.val()['membership-type'] == 2) {
                    that.groupAdmin = true;
                }
            })

            this.showLocationBySubGroup = function(subgroupId, index, b) {

                $timeout(function(){
                    angular.element('#leafletmap').attr('height', '');
                    angular.element('#leafletmap').attr('width', '');
                },0)
                wrapperGeoLoacation(subgroupId)
            };

            groupFirebaseService.getGroupSyncObjAsync(groupId, userId)
                .then(function(syncObj) {
                    that.subgroups = syncObj.subgroupsSyncArray;
                    // console.log(that.subgroups)
                    // $firebaseArray(syncObj.subgroupRef).$loaded().then(function(data) {
                    //     if (data.length > 0) {
                    //         subgroupId = that.subgroups[0].$id;
                    //         wrapperGeoLoacation(that.subgroups[0].$id)
                    //     } else {
                    //         $rootScope.mapData.reset()
                    //     }
                    // })
                });

            function wrapperGeoLoacation(sub) {
                if (sub) {
                    that.subgroupId = sub
                }
                var _subgroupId = sub || subgroupId;

                checkinService.createCurrentRefsBySubgroup(groupId, _subgroupId, userId).then(function() {
                    that.definedSubGroupLocations = checkinService.getFireCurrentSubGroupLocations()
                        .$loaded().then(function(data) {
                            if (data.length > 0) {
                                updatepostion(data[0].location.lat, data[0].location.lon, data[0].title);
                                $timeout(function(){
                                    updatepostion(data[0].location.lat, data[0].location.lon, data[0].title);
                                }, 500)
                                   
                            
                                // $rootScope.mapData.setLatLng(data[0].location.lat, data[0].location.lon, true);
                                // $rootScope.mapData.makeCircle(data[0].location.radius)
                                // $rootScope.mapData.setPopupMessage(data[0].title)
                            } else {
                                updatepostion(24.8131137, 67.04971699999999, '34C Stadium Lane 3, Karachi, Pakistan');
                                $timeout(function(){
                                    updatepostion(24.8131137, 67.04971699999999, '34C Stadium Lane 3, Karachi, Pakistan');
                                }, 500)

                                
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
                        var i = 0;
                        if (status == google.maps.GeocoderStatus.OK) {
                            //debugger
                            // console.log(results[0].formatted_address)
                            var lat = results[0].geometry.location.lat() ? results[0].geometry.location.lat() : 0;
                            var lng = results[0].geometry.location.lng() ? results[0].geometry.location.lng() : 0;
                            updatepostion(lat, lng, results[0].formatted_address);
                            $timeout(function(){
                                updatepostion(lat, lng, results[0].formatted_address); 
                            }, 500)
                            
                            
                            // $rootScope.mapData.setPopupMessage(results[0].formatted_address)
                            // $rootScope.mapData.setLatLng(lat, lng, true);
                        }
                        
                    });
                }

            }
            that.setSubgroupLocation = setSubgroupLocation;

            function setSubgroupLocation() {
                that.isProcessing = true;
                //return
                var infoObj = {
                    groupID: that.groupId,
                    subgroupID: that.subgroupId,
                    userID: that.userId,
                    title: that.markers.mark.message,
                    locationObj: {lat: that.center.lat, lng: that.center.lng, radius: that.paths.c1.radius}

                };

                checkinService['addLocationBySubgroup'](that.groupId, that.subgroupId, that.userId, infoObj, false)
                    .then(function(res) {
                        that.isProcessing = false;
                        that.submitting = false;
                        that.fencing = true;
                        messageService.showSuccess(res);
                        $mdDialog.hide();
                    }, function(err) {
                        that.isProcessing = false;
                        that.submitting = false;
                        that.fencing = true;
                        messageService.showFailure(err);
                    });
            }
            // var temp = $rootScope.mapData.makeCircle();


            function UserMemberShipFunc() {
                var userMemberships = checkinService.getFireAsObject(refUserMemberShip.child(userID));
                userMemberships.$loaded().then(function(data) {
                    var memberShipGroup = userMemberships[groupID][subgroupID];
                    //if( ( memberShipGroup['membership-type'] == 1 ) || ( memberShipGroup['membership-type'] == 2 ) ){
                    //    that.isAdmin = true;
                    //}else{
                    //    that.isAdmin = false;
                    //}

                    that.isAdmin = memberShipGroup && (memberShipGroup['membership-type'] == 1 || memberShipGroup['membership-type'] == 2);
                });
            }

        }
    ]);
})();
//http://stackoverflow.com/questions/5984179/javascript-geocoding-from-address-to-latitude-and-longitude-numbers-not-working