/**
 * Created by sj on 6/10/2015.
 */
(function() {
    'use strict';
    angular
        .module('app.createSubGroup')
        .controller('CreateSubGroupController', ['activityStreamService','CollaboratorService', '$scope', 'policyService', '$firebaseArray', 'checkinService', 'subgroupFirebaseService', '$rootScope', 'messageService', '$firebaseObject', '$stateParams', 'groupFirebaseService', 'firebaseService', '$state', '$location', 'createSubGroupService', 'userService', 'authService', '$timeout', 'utilService', '$mdDialog', '$mdSidenav', '$mdUtil', '$q', 'appConfig', CreateSubGroupController])
        .controller("DialogController", ["$mdDialog", DialogController]);

    function CreateSubGroupController(activityStreamService,CollaboratorService, $scope, policyService, $firebaseArray, checkinService, subgroupFirebaseService, $rootScope, messageService, $firebaseObject, $stateParams, groupFirebaseService, firebaseService, $state, $location, createSubGroupService, userService, authService, $timeout, utilService, $mdDialog, $mdSidenav, $mdUtil, $q, appConfig) {


        $rootScope.croppedImage = {};
        //debugger;
        /*private variables*/
        var that = this;
        var user = userService.getCurrentUser();
        $rootScope.newImg = '';
        this.teamsettingpanel = false;
        var groupID = $stateParams.groupID;
        this.groupId = groupID;
        var groupData = subgroupFirebaseService.getFirebaseGroupObj(groupID);
            /*VM functions*/
            // this.searchUser = '';
            // this.processTeamAttendance =false;
            // this.showEditSubGroup = false;
        this.groupid = groupID;
        this.activeID;
        this.subgroupData = 0;
        this.answer = answer;
        this.hide = hide;
        this.saveFile = saveFile
        this.upload_file = upload_file
        this.selectedMemberArray = [];
        this.selectedAdminArray = [];
        this.membersArray = [];
        var SubgroupObj;
        this.selectedindex = undefined;
        this.selectedindex2 = 0;
        this.filterUser = filterUser;
        this.filterUser2 = filterUser2;
        this.submembers = 0;
        this.closeToggleAdmin = closeToggleAdmin;
        this.closeAdminToggler = closeAdminToggler;
        this.processingSave = false;
        this.becomeMember = [];
        this.becomeAdmin = [];
        this.memberss = {
            memberIDs: "",
            selectedUsersArray: []

        };

        this.adminSideNav = true;
        this.memberSideNav = true;

        that.groupAdmin = false
        firebaseService.getRefUserGroupMemberships().child(user.userID).child(groupID).once('value', function(group){
            if (group.val()['membership-type'] == 1) {
                that.groupAdmin = true;
            } else if (group.val()['membership-type'] == 2) {
                that.groupAdmin = true;
            }
        })


        this.ActiveSideNavBar = function(sideNav) {
          $mdSidenav(sideNav).toggle()
            // that.adminSideNav = true;
            // that.memberSideNav = true;
            // if(sideNav === 'admin') {
            //     that.adminSideNav = false;
            //     that.memberSideNav = true;
            // } else if(sideNav === 'member') {
            //     that.adminSideNav = true;
            //     that.memberSideNav = false;
            // } else {
            //     this.adminSideNav = true;
            //     this.memberSideNav = true;
            // }
        };

        this.createTeam = function(){
            that.subgroupData = {
                // subgroupID: "",
                // title: "",
                desc: "",
                members: "",
                membersArray: []
            };
            that.activeID = '';
            SubgroupObj = '';
            that.teamsettingpanel = true;
        };

        /*VM properties*/

        /*   this.Subgroup = {
         subgroupID: "",
         title: "",
         desc: "",
         members: "",
         membersArray: []

         };*/


        this.openUserSettingPage = function() {
            // $location.path('/user/group/' + groupID + '/user-setting');
            $state.go('user.user-setting', {groupID: groupID});
        };
        this.openEditGroup = function() {
            // $location.path('user/group/' + groupID + '/edit-group');
            $state.go('user.edit-group', {groupID: groupID})
        }
        this.openGeoFencingPage = function() {
            // $location.path('/user/group/' + groupID + '/geoFencing');
            $state.go('user.geo-fencing', {groupID: groupID})
        };
        this.subgroupPage = function() {
            // $location.path('user/group/' + this.groupid + '/subgroup');
            $state.go('user.subgroup', {groupID: groupID})
        }
        this.openPolicyPage = function() {
            // $location.path('/user/group/' + groupId + '/geoFencing');
            $state.go('user.policy', {groupID: groupID})
        }


        this.veiwSubgroup = function(subgroupData, index) {

            // this.showEditSubGroup = true;
            // that.showTeamAttendace = false;
            that.selectedindex = index;
            that.activeID = subgroupData.$id;
            that.activeSubgroupTitle = subgroupData.title;

            //will become a member array, for use on Save button
            that.becomeMemmber = [];
            that.becomeAdmin = [];

            //load user Admins
            loadAdminUSers(this.groupid, that.activeID, function(){
                subgroupFirebaseService.getSubgroupSyncObjAsync(groupID, that.activeID, user.userID)
                    .then(function(syncObj) {
                        that.subgroupSyncObj = syncObj;
                        // console.log(syncObj);
                        //console.log(data === obj); // true
                        // $scope.subgroupSyncObj.subgroupSyncObj.$bindTo($scope, "subgroup");
                        that.submembers = that.subgroupSyncObj.membersSyncArray;
                        // $timeout(function() {
                            // $scope.subgroups = $scope.subgroupSyncObj.subgroupsSyncArray;
                            //$scope.pendingRequests = $scope.subgroupSyncObj.pendingMembershipSyncArray;
                            //$scope.activities = $scope.subgroupSyncObj.activitiesSyncArray;
                            //$scope.groupMembersSyncArray = $scope.subgroupSyncObj.groupMembersSyncArray;
                            SubgroupObj = $firebaseObject(firebaseService.getRefSubGroups().child(groupID).child(that.activeID));
                            // console.log(1)
                            // console.log(SubgroupObj)
                            SubgroupObj.$loaded().then(function(data) {
                                that.subgroupData = data;
                                //that.group.groupID = data.$id;
                                that.img = data['logo-image'] && data['logo-image'].url ? data['logo-image'].url : ''
                                that.teamsettingpanel = true;

                                firebaseService.getRefMain().child('subgroup-policies').child(groupID).child(that.activeID).on('value', function(snaphot){
                                    that.subgroupPolicy = snaphot.val() ? snaphot.val()['policy-title'] : false;
                                })
                        // },50000)
                            // console.log(2)
                            // console.log(SubgroupObj)
                        })
                    })
            });
        };

        //cancels create group modal
        function hide() {
            /*   createGroupService.cancelGroupCreation();*/
            /* $mdDialog.cancel();*/
            $rootScope.newImg = null;
            // $location.path('/user/group/' + groupID);
            $state.go('user.group', {groupID: groupID});

        }


        this.showAdvanced = function(ev) {
            $rootScope.tmpImg = $rootScope.newImg;
            $rootScope.newImg = '';
            $mdDialog.show({
                controller: "DialogController as ctrl",
                templateUrl: 'directives/dilogue2.tmpl.html',
                targetEvent: ev,
                escapeToClose: false
            }).then(function(picture) {
                $rootScope.newImg = picture;
                //console.log("this is image" + picture)
            }, function(err) {
                //console.log(err)

            })

        };


        groupFirebaseService.getGroupSyncObjAsync(groupID, user.userID)
            .then(function(syncObj) {
                $timeout(function() {

                    that.groupSyncObj = syncObj;
                    // that.groupSyncObj.groupSyncObj.$bindTo(that, "group");
                    that.group = that.groupSyncObj.groupSyncObj;
                    that.members = that.groupSyncObj.membersSyncArray;
                    that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                    that.pendingRequests = that.groupSyncObj.pendingMembershipSyncArray;
                    that.activities = that.groupSyncObj.activitiesSyncArray;
                    // that.veiwSubgroup(that.subgroups[0])
                    // console.log(that.subgroups)
                });


            });

        this.assignMemberClick = function() {
            that.members.forEach(function(val, index){
                //if is member
                if(that.submembers.length > 0) {
                    for (var i = 0; i < that.submembers.length; i++) {
                        if (val.userID === that.submembers[i].userID) {
                            that.members[index].isMember = true;
                            that.members[index].isAdmin = (that.members[index].membershipType == 1 || that.members[index].membershipType == 2) ? true : false;
                            break;
                        }
                    }
                }
                //if is admin member
                if(that.selectedAdminArray.length > 0) {
                    for (var i = 0; i < that.selectedAdminArray.length; i++) {
                        if (val.user.profile.email === that.selectedAdminArray[i].email) {
                            that.members[index].isAdmin = true;
                            break;
                        }
                    }
                }
            }); //that.members.forEach
        };

        this.afterSelectMember = function(id){
            var _flag = false;
            that.members.forEach(function(val, index){
                // console.log('that.members', val)
                if(_flag){
                    return;
                }

                if(id === val.userID){
                    //if is member
                    if(that.becomeMember.length > 0) {
                        for (var i = 0; i < that.becomeMember.length; i++) {
                            if(id == that.becomeMember[i].$id) {
                                that.members[index].isMember = true;
                                _flag = true;
                                break;
                            }
                        }
                    }
                }

            }); //that.members.forEach
        };

        this.afterSelectAdmin = function(email){
            var _flag = false;
            that.members.forEach(function(val, index){
                if(_flag){
                    return false;
                }
                if(email == val.user.profile.email){
                    //if is admin member
                    if(that.becomeAdmin.length > 0) {
                        for (var i = 0; i < that.becomeAdmin.length; i++) {
                            // console.log('that.becomeAdminmembers', that.becomeAdmin[i])
                            if (email === that.becomeAdmin[i].member.user.profile.email && email === val.user.profile.email) {
                                that.members[index].isAdmin = true;
                                _flag = true;
                                break;
                            }
                        }
                    }
                }
            }); //that.members.forEach
        };

        this.selectedMember = function(userObj, index) {
            var _flag = true;
            //if(that.memberss.length > 0) {
            that.becomeMember.forEach(function(val, i){
                if(val == userObj){
                    _flag = false;
                }
            });//checking if userobj is exists or not
            //}

            if(that.submembers.length > 0){
                that.submembers.forEach(function(val, inx){
                    if(val.userID == userObj.$id){
                        _flag = false;
                    }
                })
            }

            if(_flag) {
                that.becomeMember.push(userObj);
                that.memberss.selectedUsersArray.push(userObj.$id);
                that.memberss.memberIDs = that.memberss.selectedUsersArray.join();
                var membersArray = that.memberss.memberIDs.split(',');

                //after add in  becomeMember chnage arrow css
                that.afterSelectMember(userObj.$id);
            }
        };




        // this.checkingIsSelectedMember = function(mmbrid) {
        //     that.becomeMember.forEach(function(val,index){
        //         console.log('val', val.$id, mmbrid);
        //         if(mmbrid === val.$id){
        //             console.log('trrrrrrue');
        //             return true;
        //         }
        //     });
        //     return false;
        // };

        this.selectedMemberSave = function(){
            if(that.becomeMember.length > 0){
                var membersIDarray = [];    //for policy
                that.becomeMember.forEach(function(userObj,index){

                    var subgroupObj = angular.extend({}, that.subgroupSyncObj.subgroupSyncObj, {
                        groupID: groupID,
                        subgroupID: that.activeID
                    });

                    //for coluser checking
                    saveMemberToFirebase(user, subgroupObj, that.memberss.memberIDs, that.subgroupSyncObj.membersSyncArray, groupData);

                    //for activity Stream Array
                    //now checking is user is also exist in selectedAdminList then not publish activity stream by member
                    var _flag_notInBecomeAdminArray = true;
                    if(that.becomeAdmin.length > 0){
                        that.becomeAdmin.forEach(function(val,index){
                            if(val.member.user.profile == userObj.$id) {
                                _flag_notInBecomeAdminArray = false;
                            }
                        });
                    }
                    //publish activity Stream
                    if(_flag_notInBecomeAdminArray){        //if not exists in becomeAdminArray then publish activity as member
                        userActivityStreamOnAddMemberOrAdmin(userObj, subgroupObj, true, false);
                    }
                    //for activity Stream Array

                    membersIDarray.push(userObj.$id);

                    //checking if team has policy then assigned policy to member
                    if(that.becomeMember.length == index+1){
                        policyService.assignTeamPolicyToMultipleMembers(membersIDarray, groupID, that.activeID, function(result, msg){

                        });
                    }

                }); //that.becomeMember.forEach
            } //if
        }; //this.selectedMemberSave

        function saveMemberToFirebase(user, subgroupObj, memberIDs, membersSyncArray, groupData){
            subgroupFirebaseService.asyncUpdateSubgroupMembers(user, subgroupObj, memberIDs, membersSyncArray, groupData)


                    // .then(function(response) {
                    //     // console.log("Adding Members Successful");
                    //     var unlistedMembersArray = response.unlistedMembersArray,
                    //         notificationString;
                    //
                    //     if (unlistedMembersArray.length && unlistedMembersArray.length === membersArray.length) {
                    //         notificationString = 'Adding Members Failed ( ' + unlistedMembersArray.join(', ') + ' ).';
                    //         messageService.showFailure(notificationString);
                    //     } else if (unlistedMembersArray.length) {
                    //         notificationString = 'Adding Members Successful, except ( ' + unlistedMembersArray.join(', ') + ' ).';
                    //         messageService.showSuccess(notificationString);
                    //     } else {
                    //         notificationString = 'Adding Members Successful.';
                    //         console.log("SubgroupObj",subgroupObj); //subgroupID
                    //         console.log("groupObj",groupData); // $id
                    //         var members = memberIDs.split(',');
                    //         for (var i = 0; i < members.length; i++) {
                    //           CollaboratorService.addAccessUser(CollaboratorService.getCurrentDocumentId(),groupData.$id,subgroupObj.subgroupID,members[i]);
                    //         }
                    //         messageService.showFailure(notificationString);
                    //     }
                    // }, function(reason) {
                    //     messageService.showFailure(reason);
                    // }); // subgroupFirebaseService.asyncUpdateSubgroupMembers

                .then(function(response) {
                    // console.log("Adding Members Successful");
                    var unlistedMembersArray = response.unlistedMembersArray,
                        notificationString;

                    if (unlistedMembersArray.length && unlistedMembersArray.length === membersArray.length) {
                        notificationString = 'Adding Members Failed ( ' + unlistedMembersArray.join(', ') + ' ).';
                        messageService.showFailure(notificationString);
                    } else if (unlistedMembersArray.length) {
                        notificationString = 'Adding Members Successful, except ( ' + unlistedMembersArray.join(', ') + ' ).';
                        messageService.showSuccess(notificationString);
                    } else {
                        notificationString = 'Adding Members Successful.';
                        messageService.showFailure(notificationString);
                    }
                }, function(reason) {
                    messageService.showFailure(reason);
                }); // subgroupFirebaseService.asyncUpdateSubgroupMembers


        }

        this.selectedAdmin = function(newType, member) {
            var obj = {type: newType, member: member};
            var _flag = true;

            //if(that.memberss.length > 0) {
            that.becomeAdmin.forEach(function(val, i){
                if(val.member == member){
                    _flag = false;
                }
            }); //checking if admin is exists or not
            //}

            if(that.selectedAdminArray.length > 0) {
                that.selectedAdminArray.forEach(function(val,i){
                    if(val == member.user.profile.email){
                        _flag = false;
                    }
                });
            }

            if(_flag) {
                that.becomeAdmin.push(obj);

                //after add in  becomeMember chnage arrow css
                this.afterSelectAdmin(obj.member.user.profile.email)
            }


        };

        this.selectedAdminSave = function(){
            if(that.becomeAdmin.length > 0){
                var membersIDarray = [];    //for policy
                that.becomeAdmin.forEach(function(val,index){

                    var subgroupObj = angular.extend({}, that.subgroupSyncObj.subgroupSyncObj, {
                        groupID: groupID,
                        subgroupID: that.activeID
                    });

                    //for coluser checking
                    saveAdminToFirebase(val.type, val.member, groupID, that.activeID, subgroupObj);



                    membersIDarray.push(val.member.userID);
                    //checking if team has policy then assigned policy to member
                    if(that.becomeMember.length == index+1){
                        policyService.assignTeamPolicyToMultipleMembers(membersIDarray, groupID, that.activeID, function(result, msg){

                        })
                    }
                }) //that.becomeMember.forEach
            } //if
        }; //selectedAdminSave

        function saveAdminToFirebase(newType, member, groupID, activeID, subgroupObj){
            createSubGroupService.changeMemberRole(newType, member, groupID, activeID).then(function() {
                messageService.showSuccess("New Admin selected");
                //publish activity Stream
                $timeout(function(){
                    userActivityStreamOnAddMemberOrAdmin(member.user.profile, subgroupObj, false, true);
                },1000);
            }, function(reason) {
                messageService.showFailure(reason);
            });
        }

        function userActivityStreamOnAddMemberOrAdmin (userObj, subgroupObj, isMember, isAdmin) {
            var areaType;

            if(isMember){
                areaType = 'subgroup-member-assigned';
            }

            if(isAdmin){
                areaType = 'subgroup-admin-assigned';
            }

            //publish an activity stream record -- START --
            var type = 'subgroup';
            var targetinfo = {id: subgroupObj.$id, url: groupID+'/'+subgroupObj.$id, title: subgroupObj.title, type: 'subgroup' };
            var area = {type: areaType };
            var group_id = groupID+'/'+subgroupObj.$id;
            var memberuserID = userObj.$id;
            //for group activity record
            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
            //for group activity stream record -- END --
        }

        this.deleteAdminMember = function(admin){
           var adminMemberId = '';
           that.submembers.forEach(function(val,indx){
                if(val.userSyncObj.email == admin.email && val.membershipType != 1){
                    createSubGroupService.DeleteUserMemberShip(val.userSyncObj.$id,groupID,that.activeID,that.submembers.length);

                    //publish an activity stream record -- START --
                    var type = 'subgroup';
                    var targetinfo = {id: that.activeID, url: groupID+'/'+that.activeID, title: that.activeSubgroupTitle, type: 'subgroup' };
                    var area = {type: 'subgroup-admin-removed' };
                    var group_id = groupID+'/'+that.activeID;
                    var memberuserID = val.userSyncObj.$id;
                    //for group activity record
                    activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
                    //for group activity stream record -- END --

                }
           });

           that.selectedAdminArray.forEach(function(val, indx){
                if(val.email == admin.email && val.membershipType != 1){
                    that.selectedAdminArray.splice(indx, 1);
                }
           });

       };

        this.deleteMember = function(userID){
            createSubGroupService.DeleteUserMemberShip(userID,groupID,that.activeID,that.submembers.length);

            //publish an activity stream record -- START --
            var type = 'subgroup';
            var targetinfo = {id: that.activeID, url: groupID+'/'+that.activeID, title: that.activeSubgroupTitle, type: 'subgroup' };
            var area = {type: 'subgroup-member-removed' };
            var group_id = groupID+'/'+that.activeID;
            var memberuserID = userID;
            //for group activity record
            activityStreamService.activityStream(type, targetinfo, area, group_id, memberuserID);
            //for group activity stream record -- END --
        };

        function loadAdminUSers(groupid, subgroupid, cb){
            createSubGroupService.getAdminUsers(groupid, subgroupid, function(data){
                that.selectedAdminArray = data;
                cb();
            })
        }


        function filterUser(userID) {
            var disableItem = false;
            for (var i = 0; i < that.submembers.length; i++) {
                if (userID === that.submembers[i].userID) {
                    disableItem = true;
                } else if (that.membersArray.indexOf(userID) >= 0) {
                    disableItem = true;
                }
            }
            return disableItem;
        }

        function filterUser2(email) {
        	// console.log(that.selectedAdminArray[0].email);
            var disableItem = false;
            if(that.selectedAdminArray && that.selectedAdminArray.length > 0) {
	            for (var i = 0; i < that.selectedAdminArray.length; i++) {
	                if (email === that.selectedAdminArray[i].email) {
	                    disableItem = true;
	                }

	            }
            }
            return disableItem;
        }

        function answer(groupForm) {
           that.processingSave = true;
            var fromDataFlag;
            //return if form has invalid model.
            if (groupForm.$invalid) {
                 that.processingSave = false;
                return;
            }
            //if ($rootScope.croppedImage && $rootScope.croppedImage.src) {
            if ($rootScope.newImg) {
                var x = utilService.base64ToBlob($rootScope.newImg);
                var temp = $rootScope.newImg.split(',')[0];
                var mimeType = temp.split(':')[1].split(';')[0];
                that.saveFile(x, mimeType, that.subgroupData.$id).then(function(data) {
                        // console.log('subgroup img  uploaded ' + data)
                        // console.log(3)
                        //console.log(SubgroupObj)

                        if(SubgroupObj) {
                            //edit team
                            SubgroupObj['logo-image'].url = data;
                            that.selectedMemberSave();
                            that.selectedAdminSave();
                            createSubGroupService.editSubgroup(that.subgroupData, SubgroupObj, groupID, function(){
                                that.processingSave = false;
                                that.teamsettingpanel = false;
                                that.selectedindex = undefined;
                            });
                        } else {
                            //create team
                            that.subgroupData.imgLogoUrl = data;
                            createSubGroupService.createSubGroup(user.userID, groupData, that.subgroupData, that.subgroups, fromDataFlag, groupID,function(){
                                that.teamsettingpanel = false;
                                that.selectedindex = undefined;
                            });
                            that.processingSave = false;
                        }
                            // $rootScope.newImg=null;
                    })
                    .catch(function(err) {
                        // return alert('picture upload failed' + err)
                        that.processingSave = false;
                        that.teamsettingpanel = false;

                        return messageService.showFailure('picture upload failed' + err);
                    });
                // console.log(x);
            } else {
                fromDataFlag = false;
                if(SubgroupObj) {
                    //edit team
                    that.selectedMemberSave();
                    that.selectedAdminSave();
                    createSubGroupService.editSubgroup(that.subgroupData, SubgroupObj, groupID,function(){
                        that.processingSave = false;
                        that.teamsettingpanel = false;
                        that.selectedindex = undefined;


                    });
                } else {
                    //create team
                    createSubGroupService.createSubGroup(user.userID, groupData, that.subgroupData, that.subgroups, fromDataFlag, groupID, function(){
                        that.selectedindex = undefined;
                       that.teamsettingpanel = false;
                    });
                    that.processingSave = false;

                }
            }
        }

        function saveFile(file, type, groupID) {
            var defer = $q.defer();
            //if(!that.group.groupID)return alert('Pleas provide group url firstt');
            //var groupID= that.group.groupID;
            var xhr = new XMLHttpRequest();

            //xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?file_name="+ groupID + '_' + that.subgroupData.$id + "." + type.split('/')[1]+ "&file_type=" + type);
            xhr.open("GET", appConfig.apiBaseUrl + "/api/savegroupprofilepicture?groupID=" + groupID + '&subgroupID' + that.subgroupData.$id + "&file_type=" + type);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {

                        var response = JSON.parse(xhr.responseText);
                        defer.resolve(that.upload_file(file, response.signed_request, response.url));
                    } else {
                        defer.reject(essageService.showFailure("Could not get signed URL."))
                    }
                }
            };
            xhr.send();
            return defer.promise;
        }


        //Cropper Code start
        // this.showAdvanced = function(ev) {
        //     $rootScope.tmpImg = $rootScope.newImg;
        //     $rootScope.newImg = '';
        //     $mdDialog.show({
        //         controller: "DialogController",
        //         controllerAs: "ctrl",
        //         templateUrl: 'directives/dilogue1.tmpl.html',
        //         targetEvent: ev
        //     }).then(function(picture) {
        //         $rootScope.newImg = picture;
        //         // console.log("this is image" + picture)
        //     }, function(err) {
        //         //console.log(err)
        //
        //     })
        //
        // };


        //Cropper Code End

        this.canActivate = function() {
            return authService.resolveUserPage();
        }


        // side navigation

        this.toggleRight = buildToggler('right');
        this.toggleAdmin = AdminToggler('rights');

        function buildToggler(navID) {
            var debounceFn = $mdUtil.debounce(function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        // console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFn;
        };

        function AdminToggler(navID) {
            var debounceFnc = $mdUtil.debounce(function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        // console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFnc;
        };

        function upload_file(file, signed_request, url) {

            var defer = $q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function(data) {
                // alert(xhr.status);
                //alert(xhr.responseText);
                if (xhr.status === 200) {
                    messageService.showSuccess('Picture uploaded....')
                        // console.log(url);
                        //document.getElementById("preview").src = url;
                        // that.subgroupData.imgLogoUrl = url;
                    defer.resolve(url + '?random=' + new Date())
                        //document.getElementById("avatar_url").value = url;
                }
            };
            xhr.onerror = function(error) {
                defer.reject(messageService.showSuccess('Could not upload file.'));
            };
            xhr.send(file);
            return defer.promise;
        }

        that.OwnerRef = $firebaseObject(firebaseService.getRefGroups().child(groupID))
            .$loaded()
            .then(function(groupData) {

                if (groupData['group-owner-id']) {
                    //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                    that.picRef = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']) /*.child('profile-image')*/ )
                        .$loaded()
                        .then(function(userData) {

                            that.userObj = userData;

                        })

                }
            });

        function closeAdminToggler() {
            $mdSidenav('rights').close()
                .then(function() {
                    // console.log("close LEFT is done");
                });
        };

        function closeToggleAdmin() {
            $mdSidenav('right').close()
                .then(function() {
                    // console.log("close LEFT is done");
                });
        };
    }

    function DialogController($mdDialog) {
        this.my = {
            model: {
                img: ''
            }
        };
        this.openFileSelect = function(){
          angular.element('#ImageUpload').click();
        }
        this.hide = function(picture) {
            // console.log("dialog box pic" + picture)
            $mdDialog.hide(picture);
        };
    }
})();
