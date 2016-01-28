(function() {
    'use strict';

    angular.module('app.policy').controller('PolicyController', [
        '$state',
        '$location',
        'messageService',
        '$mdDialog',
        'checkinService',
        'userService',
        '$stateParams',
        'groupFirebaseService',
        '$timeout',
        '$firebaseObject',
        'firebaseService',
        '$firebaseArray',
        "policyService",
        function($state, $location, messageService, $mdDialog, checkinService, userService, $stateParams, groupFirebaseService, $timeout, $firebaseObject, firebaseService, $firebaseArray, policyService) {

            this.showPanel = false;
            var that = this;

            this.isLocationbased = false;
            this.isTimebased = false;
            this.isProcessing = false;
            that.fencing = true;
            this.center = {};
            this.markers = {
                mark: {}
            };
            this.paths = {
                c1: {}
            };
            this.defaults = {
                scrollWheelZoom: false
            };
            this.policyTitle = '';
            this.activePolicyId = '';

            function defaultGeoLocation() {
                that.center.lat = 24.8131137;
                that.center.lng = 67.04971699999999;
                that.center.zoom = 20

                that.markers.mark.lat = that.center.lat;
                that.markers.mark.lng = that.center.lng;
                that.markers.mark.draggable = true;
                that.markers.mark.focus = true;
                that.markers.mark.message = '34C Stadium Lane 3, Karachi, Pakistan';

                that.paths.c1.type = 'circle';
                that.paths.c1.weight = 2;
                that.paths.c1.color = 'green';
                that.paths.c1.latlngs = that.center;
                that.paths.c1.radius = 20;
            }

            function updatepostion(lat, lng, msg) {
                that.paths.c1.latlngs = {
                    lat: lat,
                    lng: lng
                };
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


            //Load Group Policies from given GroupID
            this.groupPolicies = policyService.getGroupPolicies(that.groupId);

            //Load SubgroupNames from Given GroupID
            this.subGroupNames = policyService.getSubGroupNames(that.groupId)


            this.openCreateSubGroupPage = function() {
                $state.go('user.create-subgroup', {
                    groupID: groupId
                })
            }
            this.openUserSettingPage = function() {
                $state.go('user.user-setting', {
                    groupID: groupId
                })
            };
            this.openEditGroup = function() {
                $state.go('user.edit-group', {
                    groupID: groupId
                })
            };

            that.groupAdmin = false
            firebaseService.getRefUserGroupMemberships().child(userId).child(groupId).once('value', function(group) {
                if (group.val()['membership-type'] == 1) {
                    that.groupAdmin = true;
                } else if (group.val()['membership-type'] == 2) {
                    that.groupAdmin = true;
                }
            })

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

            //Save on Firebase.....
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


            function UserMemberShipFunc() {
                var userMemberships = checkinService.getFireAsObject(refUserMemberShip.child(userID));
                userMemberships.$loaded().then(function(data) {
                    var memberShipGroup = userMemberships[groupID][subgroupID];
                    that.isAdmin = memberShipGroup && (memberShipGroup['membership-type'] == 1 || memberShipGroup['membership-type'] == 2);
                });
            }


            //New Work POLICY 

            this.subgroupSideNavBar = true;
            this.closeSideNavBar = function() {
                that.subgroupSideNavBar = false;
            }

            //scheduler for time base -- START --
            this.selectedTimesForAllow = {};
            this.day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            this.times = ['12AM', "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"];
            //this.item = false;
            this.schCalender = [];
            //this.background = "red";
            function loadSchaduler() {
                that.schCalender = [];
                var row = [];
                for (var i = 0; i < 7; i++) {
                    row = [];
                    for (var j = 0; j < 24; j++) {
                        row.push(false);
                    }
                    that.schCalender.push(row);
                }
            } //loadSchaduler

            //on time (checkbox) click create object
            this.ontimeClick = function(index, parentIndex) {
                    that.schCalender[parentIndex][index] = !that.schCalender[parentIndex][index];
                    // console.log(that.day[parentIndex], that.times[index], that.schCalender[parentIndex][index]);

                    if (that.selectedTimesForAllow.hasOwnProperty(that.day[parentIndex])) {
                        that.selectedTimesForAllow[that.day[parentIndex]][index] = that.schCalender[parentIndex][index]
                            // that.selectedTimesForAllow[that.day[parentIndex]][(that.times[index].replace( /\D+/g, ''))] = that.schCalender[parentIndex][index]
                    } else {
                        that.selectedTimesForAllow[that.day[parentIndex]] = {};
                        that.selectedTimesForAllow[that.day[parentIndex]][index] = that.schCalender[parentIndex][index]
                            // that.selectedTimesForAllow[that.day[parentIndex]][(that.times[index].replace( /\D+/g, ''))] = that.schCalender[parentIndex][index]
                    }
                    // console.log(that.selectedTimesForAllow);
                }
                //scheduler for time base -- END --


            //Selected SubGroup Members for Assigning Policies
            this.selectedTeamMembers = {};
            this.LoadSubGroupUsers = function(groupID, subgroupID) {
                    that.selectedTeamMembers[subgroupID] = policyService.getSubGroupMembers(groupID, subgroupID);
                    //that.selectedTeamMembers = policyService.getSubGroupMembers(that.groupId, 'hotemail');
                }
                //Selected SubGroup Members for Assigning Policies

            //Selected SubGroup for Assign Policies
            this.selectedTeams = [];
            this.selectedTeam = function(subgroup, onEditPolicy) {
                    var _flag = true;
                    that.selectedTeams.forEach(function(val, indx) {
                        if (val.subgroupID == subgroup.subgroupID) {
                            _flag = false;
                        }
                    });
                    if (_flag) {

                        //Add SubGroups    //-K91WU-ZDR8kujgvU9gZ
                        that.selectedTeams.push(subgroup);

                        if (onEditPolicy) { //on click policy (edit mode)
                            //after add in local selected team array chnage hasPolicy true in firebase team array
                            that.subGroupNames.forEach(function(val, indx) {
                                // console.log(val)
                                if (val.subgroupID == subgroup.subgroupID && val.policyID == that.activePolicyId) {
                                    that.subGroupNames[indx].hasPolicy = true;
                                } 
                            });
                        } else {
                            //after add in local selected team array chnage hasPolicy true in firebase team array
                            that.subGroupNames.forEach(function(val, indx) {
                                if (val.subgroupID == subgroup.subgroupID) {
                                    that.subGroupNames[indx].hasPolicy = true;
                                } //else {
                                //     that.subGroupNames[indx].hasPolicy = false;
                                // }
                            });
                        }

                        //Load SubGropMemebrs
                        that.LoadSubGroupUsers(that.groupId, subgroup.subgroupID);
                    } //_flag
                } //selectedTeam
                //Selected SubGroup for Assign Policies

            //onclick save button
            this.onSave = function() {

                    if (that.policyTitle) {

                        var obj = {};

                        if (that.isLocationbased && that.isTimebased) {
                            obj = {
                                locationBased: true,
                                timeBased: true,
                                locationObj: {
                                    lat: that.center.lat,
                                    lng: that.center.lng,
                                    radius: that.paths.c1.radius
                                },
                                timeObj: that.selectedTimesForAllow
                            };
                            console.log('that.isLocationbased && that.isTimebased', obj)

                        } else if (that.isLocationbased) {
                            //isLocationbased
                            obj = {
                                locationBased: true,
                                timeBased: false,
                                locationObj: {
                                    lat: that.center.lat,
                                    lng: that.center.lng,
                                    radius: that.paths.c1.radius
                                },
                                timeObj: ""
                            };
                            console.log('that.isLocationbased', obj)
                        } else if (that.isTimebased) {
                            //isTimebased
                            obj = {
                                locationBased: false,
                                timeBased: true,
                                locationObj: "",
                                timeObj: that.selectedTimesForAllow
                            };
                            console.log('that.isTimebased', obj)
                        } else {
                            //nothing have to do....
                            alert("nothing have to do....");
                            return false;
                        }

                        //setting obj title name
                        obj.title = that.policyTitle;

                        // console.log('team', that.selectedTeams);
                        // console.log('members', that.selectedTeamMembers);


                        //calling policy service function to add in firebase
                        policyService.answer(obj, that.groupId, that.selectedTeams, that.selectedTeamMembers, function(){
                           //Load Group Policies from given GroupID
                           //that.groupPolicies = policyService.getGroupPolicies(that.groupId); 
                           if(that.activePolicyId) {  //if edit
                                that.groupPolicies.forEach(function(val,index){
                                    if(val.policyID == that.activePolicyId) {
                                        that.groupPolicies[index] = obj;
                                    }
                                }); 
                           }
                           
                        }, that.activePolicyId);

                    } //if that.title exists
                } //onSave


            this.selectedPolicy = function(policy) {
                    console.log(policy);
                    that.activePolicyId = policy.policyID;          //set active PolicyID
                    that.policyTitle = policy.title;                //show title
                    that.isLocationbased = policy.locationBased;    //show if locationBased is True
                    that.isTimebased = policy.timeBased;            //show if timebased is true

                    //Clear calender .. (run scheduler)
                    loadSchaduler();

                    if (policy.locationBased) {
                        that.center.lat = policy.locationObj.lat;
                        that.center.lng = policy.locationObj.lng;
                        that.paths.c1.radius = policy.locationObj.radius;
                    } //policy.locationBased true

                    if (policy.timeBased) {
                        that.selectedTimesForAllow = {};
                        // console.log("Sunday", that.day.indexOf("Sunday"));
                        for (var day in policy.timeObj) {
                            // console.log(day);
                            // console.log(policy.timeObj[day]);
                            for (var hour in policy.timeObj[day]) {
                                // console.log(hour);
                                // console.log(policy.timeObj[day][hour]);
                                that.schCalender[that.day.indexOf(day)][hour] = policy.timeObj[day][hour];

                                if (that.selectedTimesForAllow.hasOwnProperty(day)) {
                                    that.selectedTimesForAllow[day][hour] = policy.timeObj[day][hour];
                                } else {
                                    that.selectedTimesForAllow[day] = {};
                                    that.selectedTimesForAllow[day][hour] = policy.timeObj[day][hour]
                                }
                            } // for hour    policy.timeObj[day]
                            // console.log(that.selectedTimesForAllow);
                        } //for day    policy.timeObj
                    } //policy.timeBased true

                    //now getting subgroup ids where this policy has implemented
                    that.selectedTeams = []; //on edit policy clear selectedTeams Array  before reload
                    that.selectedTeamMembers = {}; //on edit policy clear selectedTeamMembers object before reload

                    //before selectedTeam first hasPolicy = false... 
                    subGroupNamesPolicyFalse();

                    //if active policy is match from subgroup object of policyID then hasPolicy true
                    that.subGroupNames.forEach(function(val, indx) {
                        if (val.policyID && val.policyID == policy.policyID) {
                            that.selectedTeam(val, true); //creating selected teams array
                        }
                    });

                } //this.selectedPolicy

            function subGroupNamesPolicyFalse() {
                //before selectedTeam first hasPolicy = false... 
                that.subGroupNames.forEach(function(val, indx) {
                    that.subGroupNames[indx].hasPolicy = false;
                });
            }

            this.newPolicy = function() {
                    //load initial page
                    init();

                    //chnage subgroup names hasPolicy false onload
                    subGroupNamesPolicyFalse();
                } //this.newPolicy


            //load constructor
            function init() {
                that.activePolicyId = ''; //at initial no policy has selected
                that.policyTitle = ''; //clear policy title (not required on load)
                that.isLocationbased = false; //unchek default location based
                that.isTimebased = false; //unchek default time based
                that.selectedTeams = []; //onLoad or create empty selectedTeams array
                that.selectedTeamMembers = {}; //onLoad or create empty selectedTeamMembers obj

                //set default location
                defaultGeoLocation();

                //generate scheduler
                loadSchaduler();
            }
            //run when controller load
            init();



        } // controller function
    ]); //contoller
})();
