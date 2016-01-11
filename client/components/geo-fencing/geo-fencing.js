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
            '$scope',
            function($interval, $localStorage, $location, messageService, $mdDialog, checkinService, utilService, userService, $stateParams, groupFirebaseService, $timeout, $firebaseObject, firebaseService, $firebaseArray, dateFilter, $rootScope, leafletData, $scope) {


                $rootScope.address = '';
                this.showPanel = false;
                var that = this;

                this.isProcessing = false;

                this.center = {};
                this.markers = {
                    mark: {}
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

                function updatepostion(lat, lng, msg){
                    that.paths.c1.latlngs = {lat: lat, lng: lng};
                    that.markers.mark.lat = lat;
                    that.markers.mark.lng = lng;
                    that.markers.mark.focus = true;
                    that.markers.mark.message = msg;
                    that.center.lat = lat;
                    that.center.lng = lng;
                }

                that.getLatLngByAddress = getLatLngByAddress;

                var groupId = that.groupId = $stateParams.groupID;
                var SubgroupObj, userId = that.userId = userService.getCurrentUser().userID;
                var subgroupId = that.subgroupId = undefined;

                this.openCreateSubGroupPage = function() {
                    $location.path('/user/group/' + groupId + '/create-subgroup');
                }
                this.openUserSettingPage = function() {
                    $location.path('/user/group/' + groupId + '/user-setting');
                };
                this.openEditGroup = function() {
                    $location.path('user/group/' + groupId + '/edit-group');
                };

                this.showLocationBySubGroup = function(subgroupId, index, b) {

                    $timeout(function() {
                        angular.element('#leafletmap').attr('height', '');
                        angular.element('#leafletmap').attr('width', '');
                    }, 0)
                    wrapperGeoLoacation(subgroupId)
                };

                groupFirebaseService.getGroupSyncObjAsync(groupId, userId)
                    .then(function(syncObj) {
                        that.subgroups = syncObj.subgroupsSyncArray;
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
                                    $timeout(function() {
                                        updatepostion(data[0].location.lat, data[0].location.lon, data[0].title);
                                    }, 500)
                                } else {
                                    updatepostion(24.8131137, 67.04971699999999, '34C Stadium Lane 3, Karachi, Pakistan');
                                    $timeout(function() {
                                        updatepostion(24.8131137, 67.04971699999999, '34C Stadium Lane 3, Karachi, Pakistan');
                                    }, 500)
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
                                var lat = results[0].geometry.location.lat() ? results[0].geometry.location.lat() : 0;
                                var lng = results[0].geometry.location.lng() ? results[0].geometry.location.lng() : 0;
                                updatepostion(lat, lng, results[0].formatted_address);
                                $timeout(function() {
                                    updatepostion(lat, lng, results[0].formatted_address);
                                }, 500)
                            }

                        });
                    }

                }
                that.setSubgroupLocation = setSubgroupLocation;

                function setSubgroupLocation() {
                    that.isProcessing = true;
                    var infoObj = {
                        groupID: that.groupId,
                        subgroupID: that.subgroupId,
                        userID: that.userId,
                        title: that.markers.mark.message,
                        locationObj: {
                            lat: that.center.lat,
                            lng: that.center.lng,
                            radius: that.paths.c1.radius
                        }

                    };

                    checkinService['addLocationBySubgroup'](that.groupId, that.subgroupId, that.userId, infoObj, false)
                        .then(function(res) {
                            that.isProcessing = false;
                            that.submitting = false;
                            messageService.showSuccess(res);
                            $mdDialog.hide();
                        }, function(err) {
                            that.isProcessing = false;
                            that.submitting = false;
                            messageService.showFailure(err);
                        });
                }

                function UserMemberShipFunc() {
                    var userMemberships = checkinService.getFireAsObject(refUserMemberShip.child(userID));
                    userMemberships.$loaded().then(function(data) {
                        var memberShipGroup = userMemberships[groupID][subgroupID];
                        that.isAdmin = memberShipGroup && (memberShipGroup['membership-type'] == 1 || memberShipGroup['membership-type'] == 2);
                    });
                }

            } // controller function
        ]);
})();
//http://stackoverflow.com/questions/5984179/javascript-geocoding-from-address-to-latitude-and-longitude-numbers-not-working
