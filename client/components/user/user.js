(function() {
    'use strict';

    angular.module('app.user')
        .controller('UserController', ['$location', 'checkinService', '$rootScope', '$sessionStorage', 'subgroupFirebaseService', '$firebaseArray', 'userCompService', "firebaseService", 'userService', 'authService', '$timeout', '$firebaseObject', 'userPresenceService', '$sce', UserController]);

    function UserController($location, checkinService, $rootScope, $sessionStorage, subgroupFirebaseService, $firebaseArray, userCompService, firebaseService, userService, authService, $timeout, $firebaseObject, userPresenceService, $sce) {

        //$rootScope.fl= 'hello'
        var $scope = this;
        var that = this;
        //window.userScope = this;
        this.pageUserId = userService.getCurrentUser();
        this.createGroup = function() {
            $location.path('/user/:userID/create-group');
        }
        var userData;
        this.groupMembers;
        this.onlineGroupMembers = [];
        this.offlineGroupMembers = [];

        this.totalonlinegroupmember = {};
        this.totalgroupmember = {};

        // if($location.path.indexOf(this.pageUserId) == -1) {
        //     $location.path('/user/'+this.pageUserId+'/')
        // }
        // else {
        // console.log(this.pageUserId.userID);
        // $location.path('#/user/'+this.pageUserId.userID+'/')
        // }



        $scope.openCreateGroupPage = function() {
            userCompService.openCreateGroupPage();
        };
        $scope.openJoinGroupPage = function() {
            userCompService.openJoinGroupPage();
        };

        //$scope.userMemData = new userCompService.InitFlatData($scope.pageUserId.userID);
        //$scope.userMemData.$loaded().then(function(data) {

        //console.log(data)
        //debugger;
        //})

        window.fData = $scope.userMemData

        var profileImgRef = {};

        function profileImgRefCb(snapshot) {
            var self = this;
            if (snapshot.key() == 'logo-image') {
                $timeout(function() {
                    $scope.userObj[self.ind].userImg = $sce.trustAsResourceUrl(snapshot.val())
                        //getUserObj()
                })
            }

        }
        var groupDataUbind = {};
        var userDataUbind = {};
        var userObjUbind;
        this.userObj = [];

        function getUserObj() {
            var userObj = $firebaseArray(firebaseService.getRefUserGroupMemberships().child($scope.pageUserId.userID))
                .$loaded()
                .then(function(data) {
                    userObjUbind = data.$watch(function() {
                        getUserObj()
                    });
                    $scope.userObj = data;
                    data.forEach(function(el, i) {
                        var j = i;
                        $firebaseObject(firebaseService.getRefGroups().child(el.$id))
                            .$loaded()
                            .then(function(groupData) {
                                groupDataUbind[j] = groupData.$watch(function() {
                                    $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""
                                });
                                $scope.userObj[j].groupUrl = groupData['logo-image'] ? groupData['logo-image'].url : ""

                                if (groupData['group-owner-id']) {
                                    //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                                    $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
                                        .$loaded()
                                        .then(function(img) {

                                            $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value);
                                            userDataUbind[j] = img.$watch(function(dataVal) {

                                                $scope.userObj[j].userImg = $sce.trustAsResourceUrl(img.$value)
                                            })
                                        })
                                }
                            }, function(e) {
                                console.log(e)
                            });
                    });

                })
                .catch(function() {});
        }

        getUserObj();

        this.showGroupDetails = function(key) {
            //console.log(key)
            var getGroupMembers = $firebaseObject(firebaseService.getRefGroupMembers().child(key));
            getGroupMembers.$loaded()
                .then(function(data) {
                    var x = Object.keys(data);
                    $scope.groupMembers = x;
                    $scope.groupMembers.splice(0, 3);
                    // console.log($scope.groupMembers);
                    x.forEach(function(el, i) {
                        if ((el != '$$conf') && (el != '$id') && (el != '$priority')) {
                            var z = $firebaseObject(firebaseService.getRefMain().child('users-presence').child(el));
                            z.$loaded().then(function(data) {
                                    //console.log(data)
                                    if (z.presence) {
                                        console.log('online');
                                        $scope.onlineGroupMembers.push(data)
                                    } else {
                                        // console.log('offline');
                                        $scope.offlineGroupMembers.push(data)
                                    }
                                })
                                .catch(function(err) {
                                    console.log(err)
                                })
                        }
                        // console.log(el+' '+i)

                    })
                })

        };
        this.changeShow1 = function(key, prop, flag, index, that) {
            var ctx = {
                self: that,
                key: key,
                prop: prop,
                flag: flag,
                index: index
            };

            function bound() {
                var dom = $('#gCard' + this.index);
                angular.element(dom).scope().flags = {};
                angular.element(dom).scope().flags[flag] = true;
            }

            var x = bound.bind(ctx);
            $timeout(x, 2000);
            this.selectValue = key;
            this.noShow = !this.noShow;
            return prop;
        };
        this.changeShow2 = function(key, prop) {
            this.selectValue = key;
            console.log("hello");
            this.noShow = !this.noShow;
        };
        this.changeShow3 = function(key, prop) {
            this.selectValue = key;
        };
        this.deleteAll = function() {
            $scope.groupMembers = [];
            $scope.onlineGroupMembers = [];
            $scope.offlineGroupMembers = [];
            // console.log($scope.groupMembers + $scope.onlineGroupMembers + $scope.offlineGroupMembers)
        };


        $rootScope.searchFn = function(option, flag) {

            angular.forEach($scope.userMemData.data.flattenedsubGroupsByuser, function(el, key) {
                if (flag == 1) {

                    if (option == 'any') {
                        el.show = true;

                    } else {

                        (el.groupID + '_' + el.subgroupID) == option ? el.show = true : el.show = false
                    }

                } else {

                    var str = el.firstName + el.lastName;
                    var reg = new RegExp('^' + option, 'i');
                    reg.test(str) ? el.show = true : el.show = false;

                }
            });

            /*
                            alert(flag);
                            debugger;*/
        }

        $firebaseArray(firebaseService.getRefUserSubGroupMemberships().child(that.pageUserId.userID)).$loaded().then(function(groupdata) {
            groupdata.forEach(function(group, i) {
                that.totalonlinegroupmember[group.$id] = 0;
                that.totalgroupmember[group.$id] = 0;
            });
        })
        this.GetSubGroupUsers = function() {
                that.users = [];
                $firebaseArray(firebaseService.getRefUserSubGroupMemberships().child(that.pageUserId.userID)).$loaded().then(function(groupdata) {
                    groupdata.forEach(function(group, i) {
                        // console.log(val);
                        // console.log(i);
                        for (var subGroup in group) {
                            if (subGroup.indexOf('$') == -1) {
                                // console.log(subGroup);
                                // console.log(val.$id);
                                // Update wala manjan
                                checkinService.getRefCheckinCurrentBySubgroup().child(group.$id).child(subGroup).on('child_changed', function(snapshot, prevChildKey) {
                                    // console.log(snapshot.val());    
                                    // console.log(snapshot.key()); 
                                    that.users.forEach(function(val, indx) {
                                        if (val.id === snapshot.key()) {
                                            val.type = snapshot.val().type;
                                            val.message = snapshot.val().message;
                                            val.timestamp = snapshot.val().timestamp;
                                        }
                                    })
                                });
                                //user wala manjan
                                var subGroupID = subGroup;
                                subgroupFirebaseService.getFirebaseGroupSubGroupMemberObj(group.$id, subGroup).$loaded().then(function(subgroupsdata) {

                                    $firebaseArray(checkinService.getRefCheckinCurrentBySubgroup().child(group.$id).child(subGroupID)).$loaded().then(function(usersdata) {
                                        // console.log(usersdata);
                                        subgroupsdata.forEach(function(subgroupdata) {
                                            usersdata.forEach(function(userdata) {
                                                // console.log(subgroupdata.$id);
                                                // console.log(userdata.$id);
                                                if (subgroupdata.$id === userdata.$id) {
                                                    // console.log(userdata);
                                                    // console.log(userdata.$id);
                                                    // console.log(userdata.message);
                                                    // console.log(userdata.type);
                                                    if (userdata.type === 1) {
                                                        var type = true;
                                                    } else {
                                                        var type = false;
                                                    }
                                                    var timestamp = userdata.timestamp
                                                    $firebaseArray(firebaseService.getRefUsers().child(userdata.$id)).$loaded().then(function(usermasterdata) {
                                                        // console.log(usermasterdata);
                                                        for (var i = usermasterdata.length - 1; i >= 0; i--) {
                                                            if (usermasterdata[i].$id === "profile-image") {
                                                                var profileImage = usermasterdata[i].$value
                                                            }
                                                            if (usermasterdata[i].$id === "contactNumber") {
                                                                var contactNumber = usermasterdata[i].$value
                                                            }
                                                            if (usermasterdata[i].$id === "firstName") {
                                                                var firstName = usermasterdata[i].$value
                                                            }
                                                            if (usermasterdata[i].$id === "lastName") {
                                                                var lastName = usermasterdata[i].$value
                                                            }
                                                        };
                                                        // console.log()
                                                        that.users.push({
                                                            id: userdata.$id,
                                                            type: type,
                                                            groupID: group.$id + ' / ' + subGroupID,
                                                            contactNumber: contactNumber,
                                                            timestamp: timestamp,
                                                            profileImage: profileImage,
                                                            firstName: firstName,
                                                            lastName: lastName
                                                        });
                                                        if (type) {
                                                            that.totalonlinegroupmember[group.$id] += 1
                                                        }
                                                        that.totalgroupmember[group.$id] += 1
                                                        // console.log(that.users);                 
                                                    })
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        }
                    }); //groupdata.forEach
                }); //$firebaseArray(firebaseService.getRefUserSubGroupMemberships() on load
            } //this.GetSubGroupUsers


        //register event for user add user in SubGropus
        firebaseService.getRefUserSubGroupMemberships().child(that.pageUserId.userID).on('child_added', function(groupdata) {
            that.GetSubGroupUsers();
        });

        //this.GetSubGroupUsers();
    }



})();
/*
 */
