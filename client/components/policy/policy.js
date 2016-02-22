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

            this.showPanel = true;
            var that = this;

            this.isLocationbased = false;
            this.isTimebased = false;
            this.isProgressReport = false;
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
            this.activePolicyId = false;

            var groupId = that.groupId = $stateParams.groupID;
            var SubgroupObj, userId = that.userId = userService.getCurrentUser().userID;
            var subgroupId = that.subgroupId = undefined;

            //checking is admin or not -- START
            that.groupAdmin = false
            firebaseService.getRefUserGroupMemberships().child(that.userId).child(that.groupId).once('value', function(group){
                if (group.val()['membership-type'] == 1) {
                    that.groupAdmin = true;
                } else if (group.val()['membership-type'] == 2) {
                    that.groupAdmin = true;
                }
            });
            //checking is admin or not -- END

            //Geo Fecning Default Location
            function defaultGeoLocation() {

                // for creating default geo fencing variables and define default lng, lat with marker
                setLocationMarker(67.04971699999999, 24.8131137);

                //getting user current location
                checkinService.getCurrentLocation().then(function(location) {
                    if (location) { //if location found
                        getLatLngByAddress(location.coords.latitude +', '+ location.coords.longitude);
                    }
                }, function(err) {
                    //messageService.showFailure(err.error.message);
                });
            } //defaultGeoLocation

            //setting location and its marker
            function setLocationMarker(lng, lat) {
                that.center.lat = lat;
                that.center.lng = lng;
                that.center.zoom = 20

                that.markers.mark.lat = lat;
                that.markers.mark.lng = lng;
                that.markers.mark.draggable = true;
                that.markers.mark.focus = true;
                that.markers.mark.message = '34C Stadium Lane 3, Karachi, Pakistan';

                that.paths.c1.type = 'circle';
                that.paths.c1.weight = 2;
                that.paths.c1.color = 'green';
                that.paths.c1.latlngs = that.center;
                that.paths.c1.radius = 20;
            } //setLocationMarker

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


            //on controller load...... START

            //Load Group Policies from given GroupID
            this.groupPolicies = [];
            this.groupPolicies = policyService.getGroupPolicies(that.groupId);

            //Load SubgroupNames from Given GroupID
            this.subGroupNames = policyService.getSubGroupNames(that.groupId)

            //on controller load...... END



            this.openEditGroupPage = function() {
                $state.go('user.edit-group', {
                    groupID: groupId
                })
            }

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
                    location: {
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

            this.subgroupSideNavBar = false;
            this.toggleSideNavBar = function() {
                that.subgroupSideNavBar = !that.subgroupSideNavBar;
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

            //on click schedule (checkbox) click create object
            this.onScheduleClick = function(index, parentIndex) {
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

            //on create policy
            this.newPolicy = function() {
                //load initial page
                init();

                //chnage subgroup names hasPolicy false onload
                subGroupNamesPolicyFalse();

                //On New/Create Policy Show Panel
                that.showPanel = true;
            };//this.newPolicy


            this.selectedPolicy = function(policy) {
                that.activePolicyId = policy.policyID;          //set active PolicyID
                that.policyTitle = policy.title;                //show title
                that.isLocationbased = policy.locationBased;    //show if locationBased is True

                that.isTimebased = policy.timeBased;            //show if timebased is true
                that.selectedTimesForAllow = {};

                that.isProgressReport = policy.progressReport;
                that.progressReportQuestions = {};
                that.showPanel = true;

                //Clear calender .. (run scheduler)
                loadSchaduler();

                if (that.isLocationbased) {
                    getLatLngByAddress(policy.location.lat +', '+ policy.location.lng);
                    that.paths.c1.radius = policy.location.radius;
                    //that.center.lat = policy.locationObj.lat;
                    //that.center.lng = policy.locationObj.lng;
                } //policy.locationBased true

                if (that.isTimebased) {
                    for (var day in policy.schedule) {
                        // console.log(day); // console.log(policy.timeObj[day]);
                        for (var hour in policy.schedule[day]) {
                            // console.log(hour);  // console.log(policy.timeObj[day][hour]);
                            that.schCalender[that.day.indexOf(day)][hour] = policy.schedule[day][hour];

                            if (that.selectedTimesForAllow.hasOwnProperty(day)) {
                                that.selectedTimesForAllow[day][hour] = policy.schedule[day][hour];
                            } else {
                                that.selectedTimesForAllow[day] = {};
                                that.selectedTimesForAllow[day][hour] = policy.schedule[day][hour]
                            }
                        } // for hour    policy.timeObj[day]
                        // console.log(that.selectedTimesForAllow);
                    } //for day    policy.timeObj
                } //policy.timeBased true

                if(that.isProgressReport) {
                     that.progressReportQuestions = arrayToObject(policy.progressReportQuestions[policy.latestProgressReportQuestionID]['questions']);        //when comes from firebase our question change into array from object.
                     isQuestionExists();  //checking if questions exists
                } //that.isDailyReport true

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
                }); //subGroupNames.forEach
            }; //this.selectedPolicy

            function subGroupNamesPolicyFalse() {
                //before selectedTeam first hasPolicy = false...
                that.subGroupNames.forEach(function(val, indx) {
                    that.subGroupNames[indx].hasPolicy = false;
                });
            } // subGroupNamesPolicyFalse

            //Daily Report -- START --
            this.showQuestionList = false;      //for showing table
            this.progressReportQuestions = {};
            // var dailyReportQuestionsLength = gettingQuestionsLength();
            this.addQuestion = function() {
                if(that.question) {

                    var sr = 0;
                    for(var i in that.progressReportQuestions) {
                        that.progressReportQuestions[sr.toString()] = that.progressReportQuestions[i];
                        sr++;
                    }

                    that.progressReportQuestions[sr.toString()] = that.question;
                    that.question = '';

                    //Show Table of Question if question exists
                    isQuestionExists();
                }
            };

            function isQuestionExists(){
                if(Object.keys(that.progressReportQuestions).length > 0) {
                    that.showQuestionList = true;
                } else {
                    that.showQuestionList = false;
                }
            }
            this.deleteQuestion = function(id) {
                delete that.progressReportQuestions[id.toString()];
                that.progressReportQuestions = arrayToObject(that.progressReportQuestions);

                //Show Table of Question if question exists
                isQuestionExists();
            };
            function gettingQuestionsLength(){      //getting current question object length
                return Object.keys(that.progressReportQuestions).length;
            }
            //when comes from firebase our question change into array from object.
            function arrayToObject(arr) {
                if(arr instanceof Array){
                    var rv = {};
                    for (var i = 0; i < arr.length; ++i)
                      if (arr[i] !== undefined) rv[i] = arr[i];
                    return rv;
                } else {
                    return arr;
                }
            }
            //Daily Report -- END --

            //onclick save button
            this.onSave = function() {

                if (that.policyTitle) {

                    if(!that.isProgressReport && !that.isTimebased && !that.isLocationbased) {
                        //nothing have to do....
                        messageService.showFailure('Please Select your Criteria');
                        return false;
                    }

                    //default ObjectX

                    var obj = {};
                    obj["title"] = that.policyTitle;    //setting policy title name
                    obj["locationBased"] = false;
                    obj["timeBased"] = false;
                    obj["location"] = "";
                    obj["schedule"] = "";
                    obj["defined-by"] = that.userId;
                    obj["timestamp"] = Firebase.ServerValue.TIMESTAMP;
                    obj["progressReport"] = false;
                    obj["progressReportQuestions"] = "";
                    obj["latestProgressReportQuestionID"] = '';


                    //if locationBased is selected
                    if (that.isLocationbased) {
                        //isLocationbased
                        obj["locationBased"] = true;
                        obj["location"] = {
                            lat: that.center.lat,
                            lng: that.center.lng,
                            radius: that.paths.c1.radius,
                            title: that.markers.mark.message
                        }
                    }

                    //if timeBased is selected
                    if (that.isTimebased) {
                        //isTimebased
                        if(Object.keys(that.selectedTimesForAllow).length > 0) {
                            obj["timeBased"] = true;
                            obj["schedule"] = that.selectedTimesForAllow;
                        } else {
                            messageService.showFailure('Please add schedule/time slot!');
                            return false;
                        }
                    }

                    //if dailyBased is selected
                    if(that.isProgressReport) {
                        //isDailyReport
                        if(Object.keys(that.progressReportQuestions).length > 0) {
                            obj["progressReport"] = true;
                            obj["progressReportQuestions"] = { questions: that.progressReportQuestions, timestamp: Firebase.ServerValue.TIMESTAMP }
                        } else {
                            messageService.showFailure('Please add some Questions for Daily Report!');
                            return false;
                        }
                    }
                    // console.log('team', that.selectedTeams);
                    // console.log('members', that.selectedTeamMembers);

                    //calling policy service function to add in firebase
                    policyService.answer(obj, that.groupId, that.selectedTeams, that.selectedTeamMembers, that.activePolicyId, function(lastQuestionid){
                       //Load Group Policies from given GroupID
                       //that.groupPolicies = policyService.getGroupPolicies(that.groupId);
                        if(that.activePolicyId) {  //if edit
                            that.groupPolicies.forEach(function(val,index){
                                if(val.policyID == that.activePolicyId) {
                                    if(obj["progressReport"]){
                                        obj['latestProgressReportQuestionID'] = lastQuestionid || '';
                                        obj['progressReportQuestions'][lastQuestionid] = obj['progressReportQuestions'];
                                    }
                                    //reasign updated obj to our local array
                                    that.groupPolicies[index] = obj;
                                }
                            });
                            messageService.showSuccess('Policy Successfully Updated!');
                            //$state.go('user.policy', {groupID: groupId});
                        } else{
                            messageService.showSuccess('Policy Successfully Created!');
                            //after created reload initial page
                            that.newPolicy();
                        }
                    });
                } else {//if that.title exists
                    messageService.showFailure('Please Write Policy Name');
                }
            } //onSave

            //load constructor
            function init() {
                that.activePolicyId = false; //at initial no policy has selected
                that.policyTitle = ''; //clear policy title (not required on load)
                that.isLocationbased = false; //unchek default location based
                that.isTimebased = false; //unchek default time based
                that.selectedTeams = []; //onLoad or create empty selectedTeams array
                that.selectedTeamMembers = {}; //onLoad or create empty selectedTeamMembers obj
                that.isProgressReport = false;
                //onLoad default qustion daily Report Questions obj
                that.progressReportQuestions = {'0': 'What did you accomplish today?', '1': 'What will you do tomorrow?', '2': 'What obstacles are impeding your progress?'};
                isQuestionExists();

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
