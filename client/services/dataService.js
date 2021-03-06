/**
 * Created by Mkamran on 31/12/14.
 */

"use strict";

angular.module('core')
    .factory('dataService', ['$firebaseObject', 'firebaseService', 'checkinService', 'userService', 'userPresenceService',
        function($firebaseObject, firebaseService, checkinService, userService, userPresenceService) {
            var userData = [];
            var userGroups = [];
            var userID = '';

            function unloadData () {
                userData = [];
                userGroups = [];
                userID = '';
            }

            function loadData () {
                unloadData();
                userID = userService.getCurrentUser().userID;
                setUserData();
                setUserGroups();
            }

            function setUserData () {
                var groupTitle = '';
                var subgroupTitle = '';
                var groupsubgroupTitle = {};
                firebaseService.getRefUserSubGroupMemberships().child(userID).on('child_added', function(group, prevChildKey) {
                    $firebaseObject(firebaseService.getRefGroups().child(group.key())).$loaded().then(function(groupmasterdata) {
                        groupsubgroupTitle[group.key()] = groupmasterdata.title;
                    });
                    firebaseService.getRefUserSubGroupMemberships().child(userID).child(group.key()).on('child_added', function(subgroup, prevChildKey) {
                        checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).on('child_changed', function(snapshot, prevChildKey) {
                            userData.forEach(function(val, indx) {
                                if (val.id === snapshot.key()) {
                                    if (val.groupsubgroup === (group.key() + ' / ' + subgroup.key())) {
                                        if (snapshot.val().type === 1) {
                                            val.type = true;
                                        } else {
                                            val.type = false;
                                        }
                                        val.message = snapshot.val().message;
                                        val.timestamp = snapshot.val().timestamp;
                                    }
                                }
                            });
                        });
                        checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).on('child_added', function(snapshot, prevChildKey) {
                           userData.forEach(function(val, indx) {
                                if (val.id === snapshot.key()) {
                                    if (val.groupsubgroup === (group.key() + ' / ' + subgroup.key())) {
                                        if (snapshot.val().type === 1) {
                                            val.type = true;
                                        } else {
                                            val.type = false;
                                        }
                                        val.message = snapshot.val().message;
                                        val.timestamp = snapshot.val().timestamp;
                                    }
                                }
                            });
                        });
                        $firebaseObject(firebaseService.getRefSubGroups().child(group.key()).child(subgroup.key())).$loaded().then(function(subgroupmasterdata) {
                            groupsubgroupTitle[subgroup.key()] = subgroupmasterdata.title;
                        });
                        firebaseService.getRefSubGroupMembers().child(group.key()).child(subgroup.key()).on('child_added', function(snapshot, prevChildKey) {
                            $firebaseObject(checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).child(snapshot.key())).$loaded().then(function(userdata) {
                                if (userdata.type === 1) {
                                    var type = true;
                                } else {
                                    var type = false;
                                }
                                var message = userdata.message;
                                var timestamp = userdata.timestamp;
                                $firebaseObject(firebaseService.getRefUsers().child(userdata.$id)).$loaded().then(function(usermasterdata) {
                                    firebaseService.getRefUsers().child(userdata.$id).on('child_changed', function(snapshot, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                if (snapshot.key() === "profileImage") {
                                                    val.profileImage = snapshot.val();
                                                }
                                                if (snapshot.key() === "firstName") {
                                                    val.firstName = snapshot.val();
                                                }
                                                if (snapshot.key() === "lastName") {
                                                    val.lastName = snapshot.val();
                                                }
                                                if (snapshot.key() === "contactNumber") {
                                                    val.contactNumber = snapshot.val();
                                                }
                                            }
                                        });
                                    });
                                    firebaseService.getRefUsers().child(userdata.$id).on('child_added', function(snapshot, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                if (snapshot.key() === "profileImage") {
                                                    val.profileImage = snapshot.val();
                                                }
                                                if (snapshot.key() === "firstName") {
                                                    val.firstName = snapshot.val();
                                                }
                                                if (snapshot.key() === "lastName") {
                                                    val.lastName = snapshot.val();
                                                }
                                                if (snapshot.key() === "contactNumber") {
                                                    val.contactNumber = snapshot.val();
                                                }
                                            }
                                        });
                                    });
                                    /*userPresenceService.getRefUsersPresense().child(userdata.$id).child('defined-status').on('value', function(snapshot, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                val.onlinestatus = snapshot.val();
                                            }
                                        })
                                    });*/
                                    userPresenceService.getRefUsersPresense().child(userdata.$id).child('connections').on('value', function(snapshot, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                if (snapshot.val()) {
                                                    /*for (var key in snapshot.val()) {
                                                        if (snapshot.val()[key].type === 1) {
                                                            val.onlineweb = 1;
                                                        } else if (snapshot.val()[key].type === 2) {
                                                            val.onlineios = 1;
                                                        } else if (snapshot.val()[key].type === 3) {
                                                            val.onlineandroid = 1;
                                                        }
                                                    }*/
                                                    val.onlinestatus = true;
                                                } else {
                                                    val.onlinestatus = false;
                                                }
                                            }
                                        });
                                    });
                                    firebaseService.getRefGroupMembers().child(group.key()).child(userdata.$id).once('value', function(snapshot) {
                                        // console.log('snap', snapshot.getPriority(), snapshot.val(), snapshot.key())
                                        userData.push({
                                            id: userdata.$id,
                                            type: type,
                                            groupsubgroup: group.key() + ' / ' + subgroup.key(),
                                            groupsubgroupTitle: groupsubgroupTitle[group.key()] + ' / ' + groupsubgroupTitle[subgroup.key()],
                                            groupID: group.key(),
                                            groupTitle: groupsubgroupTitle[group.key()],
                                            subgroupID: subgroup.key(),
                                            subgroupTitle: groupsubgroupTitle[subgroup.key()],
                                            membershipNo : snapshot.getPriority() || '',
                                            contactNumber: usermasterdata.contactNumber || '',
                                            onlinestatus: false,
                                            /*onlineweb: 0,
                                            onlineios: 0,
                                            onlineandroid: 0,*/
                                            timestamp: timestamp,
                                            message: message,
                                            profileImage: usermasterdata['profile-image'] || '',
                                            firstName: usermasterdata.firstName,
                                            lastName: usermasterdata.lastName,
                                            fullName: usermasterdata.firstName + ' ' + usermasterdata.lastName
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }

            function getUserData () {
                return userData;
            }

            function setUserGroups () {
                firebaseService.getRefUserGroupMemberships().child(userID).on('child_added', function(group, prevChildKey) {
                    firebaseService.getRefGroups().child(group.key()).on('value', function(snapshot) {
                        var groupmasterdata = snapshot.val();
                        var eflag = true;

                        //checking if group exists then update
                        userGroups.forEach(function(val,indx) {
                            if(val.groupID === snapshot.key()) {
                                val.title = groupmasterdata.title;
                                val.address = groupmasterdata.address;
                                val.addressTitle = groupmasterdata['address-title'] || '';
                                val.phone = groupmasterdata.phone;
                                val.desc = groupmasterdata.desc;
                                val.ownerID = groupmasterdata["group-owner-id"];
                                val.owerImgUrl = groupmasterdata["owner-img-url"];
                                val.imgUrl = (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' );
                                val.membersOnline = (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0);
                                val.members = groupmasterdata["members-count"];
                                eflag = false;
                            }
                        });

                        if(eflag){
                            if(snapshot.hasChildren()) {
                                userGroups.push({
                                    groupID: snapshot.key(),
                                    title: groupmasterdata.title,
                                    address: groupmasterdata.address,
                                    addressTitle: groupmasterdata['address-title'] || '',
                                    phone: groupmasterdata.phone,
                                    desc: groupmasterdata.desc,
                                    ownerID: groupmasterdata["group-owner-id"],
                                    owerImgUrl: groupmasterdata["owner-img-url"],
                                    imgUrl: (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' ),
                                    membersOnline: (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0),
                                    members: groupmasterdata["members-count"]
                                }); //userGroups Push
                                firebaseService.getRefGroups().child(group.key()).on('child_changed', function(snapshot, prevChildKey) {
                                    userGroups.forEach(function(item, index){
                                        if (item.groupID === group.key()) {
                                            if (snapshot.key() === "title") {
                                                item.title = snapshot.val();
                                            }
                                            if (snapshot.key() === "members-checked-in") {
                                                item.membersOnline = snapshot.val().count;
                                            }
                                            if (snapshot.key() === "members-count") {
                                                item.members = snapshot.val();
                                            }
                                            if (snapshot.key() === "address-title") {
                                                item.addressTitle = snapshot.val();
                                            }
                                        }
                                    });
                                });// firebaseService
                            }//if snapshot.hasChildren()
                        } // if eflag



                        // userGroups.forEach(function(val,indx){
                        //     console.log('2')
                        //     if(val.groupID === snapshot.key()) {
                        //         console.log('3')
                        //         val.title = groupmasterdata.title;
                        //         val.address = groupmasterdata.address;
                        //         val.addressTitle = groupmasterdata['address-title'] || '';
                        //         val.phone = groupmasterdata.phone;
                        //         val.desc = groupmasterdata.desc;
                        //         val.ownerID = groupmasterdata["group-owner-id"];
                        //         val.owerImgUrl = groupmasterdata["owner-img-url"];
                        //         val.imgUrl = (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' );
                        //         val.membersOnline = (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0);
                        //         val.members = groupmasterdata["members-count"];
                        //     } else {
                        //         console.log('else')
                        //         if(snapshot.hasChildren()) {
                        //             userGroups.push({
                        //                 groupID: snapshot.key(),
                        //                 title: groupmasterdata.title,
                        //                 address: groupmasterdata.address,
                        //                 addressTitle: groupmasterdata['address-title'] || '',
                        //                 phone: groupmasterdata.phone,
                        //                 desc: groupmasterdata.desc,
                        //                 ownerID: groupmasterdata["group-owner-id"],
                        //                 owerImgUrl: groupmasterdata["owner-img-url"],
                        //                 imgUrl: (groupmasterdata["logo-image"] ? groupmasterdata["logo-image"].url : '' ),
                        //                 membersOnline: (groupmasterdata["members-checked-in"] ? groupmasterdata["members-checked-in"].count : 0),
                        //                 members: groupmasterdata["members-count"]
                        //             });
                        //             firebaseService.getRefGroups().child(group.key()).on('child_changed', function(snapshot, prevChildKey) {
                        //                 userGroups.forEach(function(item, index){
                        //                     if (item.groupID === group.key()) {
                        //                         if (snapshot.key() === "title") {
                        //                             item['title'] = snapshot.val()
                        //                         }
                        //                         if (snapshot.key() === "members-checked-in") {
                        //                             item.membersOnline = snapshot.val().count
                        //                         }
                        //                         if (snapshot.key() === "members-count") {
                        //                             item.members = snapshot.val()
                        //                         }
                        //                         if (snapshot.key() === "address-title") {
                        //                             item.addressTitle = snapshot.val();
                        //                         }
                        //                     }
                        //                 });
                        //             });
                        //         }//if closing
                        //     }//else closing
                        // })
                    });
                });
            }

            function getUserGroups () {
                return userGroups;
            }

            function setUserCheckInOut (grId, sgrId, userID, type) {
                userData.forEach(function(val, indx) {
                    if (val.groupsubgroup === (grId + ' / ' + sgrId)) {
                        if (val.id === userID) {
                            if (type) {
                                val.type = false;
                            } else {
                                val.type = true;
                            }
                        }
                    }
                });
            }

            return {
                loadData: loadData,
                unloadData: unloadData,
                getUserData: getUserData,
                getUserGroups: getUserGroups,
                setUserCheckInOut: setUserCheckInOut
            };
        }
    ]);
