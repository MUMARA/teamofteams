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
                        // console.log('user', subgroup.val())
                        firebaseService.getRefUserSubGroupMemberships().child(userID).child(group.key()).on('child_removed', function(rmsubgroup) {
                            firebaseService.getRefSubGroupMembers().child(group.key()).child(subgroup.key()).off();
                            userData.forEach(function(val, indx) {
                                // if (val.id === userID) {
                                    if (val.groupsubgroup === (group.key() + ' / ' + rmsubgroup.key())) {
                                        userData.splice(indx, 1);
                                    }
                                // }
                            });
                        });
                        firebaseService.getRefUserSubGroupMemberships().child(userID).child(group.key()).child(subgroup.key()).on('child_changed', function(chsubgroup) {
                            // console.log('watch', chsubgroup)
                            // firebaseService.getRefSubGroupMembers().child(group.key()).child(subgroup.key()).off();
                            // userData.forEach(function(val, indx) {
                            //     // if (val.id === userID) {
                            //         if (val.groupsubgroup === (group.key() + ' / ' + rmsubgroup.key())) {
                            //             userData.splice(indx);
                            //         }
                            //     // }
                            // });
                        });
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
                            // console.log('user2', snapshot.key(), snapshot.val())
                            $firebaseObject(checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).child(snapshot.key())).$loaded().then(function(userdata) {
                                // console.log('user', userdata)
                                // checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).child(snapshot.key()).on('value', function(ss){
                                //     console.log('user', ss.key())
                                //     console.log('user', ss.val())
                                // })
                                if (userdata.type === 1) {
                                    var type = true;
                                } else {
                                    var type = false;
                                }
                                var message = userdata.message;
                                var timestamp = userdata.timestamp;
                                $firebaseObject(firebaseService.getRefUsers().child(userdata.$id)).$loaded().then(function(usermasterdata) {
                                    // console.log('user change 4', userdata.$id)
                                    firebaseService.getRefUsers().child(userdata.$id).on('child_changed', function(snapshot, prevChildKey) {
                                        // console.log('user change', snapshot.key(), snapshot.val(), userData.length)
                                        // for (var i = 0; i <= userData.length; i++) {
                                        //     // console.log('user change 2', i, userData[i].id, userdata.$id)
                                        //     if (userData[i].id === userdata.$id) {
                                        //         // console.log('user change 3', val.id)
                                        //         if (snapshot.key() === "profile-image") {
                                        //             userData[i].profileImage = snapshot.val();
                                        //         }
                                        //         if (snapshot.key() === "firstName") {
                                        //             userData[i].firstName = snapshot.val();
                                        //         }
                                        //         if (snapshot.key() === "lastName") {
                                        //             userData[i].lastName = snapshot.val();
                                        //         }
                                        //         if (snapshot.key() === "contactNumber") {
                                        //             userData[i].contactNumber = snapshot.val();
                                        //         }
                                        //         break;
                                        //     }
                                            userData.forEach(function(val, indx) {
                                                    // console.log('user 2', val.id, userdata.$id)
                                                if (val.id === userdata.$id) {
                                                    // console.log('user 1', val.id === userdata.$id)
                                                    console.log('user 1', snapshot.key())
                                                    if (snapshot.key() === "profile-image") {
                                                        val.profileImage = snapshot.val();
                                                    }
                                                    if (snapshot.key() === "firstName") {
                                                        val.firstName = snapshot.val();
                                                        val.fullName = val.firstName + ' ' + val.lastName;
                                                    }
                                                    if (snapshot.key() === "lastName") {
                                                        console.log('user 2', val.lastName)
                                                        val.lastName = snapshot.val();
                                                        val.fullName = val.firstName + ' ' + val.lastName;
                                                    }
                                                    if (snapshot.key() === "contactNumber") {
                                                        val.contactNumber = snapshot.val();
                                                    }
                                                }
                                            });
                                        // }
                                    });
                                    firebaseService.getRefUsers().child(userdata.$id).on('child_added', function(snapshot, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                if (snapshot.key() === "profile-image") {
                                                    val.profileImage = snapshot.val();
                                                }
                                                if (snapshot.key() === "firstName") {
                                                    val.firstName = snapshot.val();
                                                    val.fullName = val.firstName + ' ' + val.lastName;
                                                }
                                                if (snapshot.key() === "lastName") {
                                                    val.lastName = snapshot.val();
                                                    val.fullName = val.firstName + ' ' + val.lastName;
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
                                    userPresenceService.getRefUsersPresense().child(userdata.$id).child('connections').on('value', function(usersPresense, prevChildKey) {
                                        userData.forEach(function(val, indx) {
                                            if (val.id === userdata.$id) {
                                                if (usersPresense.val()) {
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
                                        firebaseService.getRefGroupMembers().child(group.key()).child(userdata.$id).once('value', function(snapshot) {
                                            // console.log('snap', snapshot.getPriority(), snapshot.val(), snapshot.key())
                                            // console.log('user', userdata.$id)
                                            if (userData.length > 0) {
                                                for (var indx = 0; indx <= userData.length; indx++) {
                                                    // console.log(val.id);
                                                    // console.log(userdata.$id)
                                                    // console.log(userData[indx])
                                                    if (userData[indx].id === userdata.$id && userData[indx].groupID === group.key() && userData[indx].subgroupID === subgroup.key()) {
                                                        userData[indx].id = userdata.$id;
                                                        userData[indx].type = type;
                                                        userData[indx].groupsubgroup = group.key() + ' / ' + subgroup.key();
                                                        userData[indx].groupsubgroupTitle = groupsubgroupTitle[group.key()] + ' / ' + groupsubgroupTitle[subgroup.key()];
                                                        userData[indx].groupID = group.key();
                                                        userData[indx].groupTitle = groupsubgroupTitle[group.key()];
                                                        userData[indx].subgroupID = subgroup.key();
                                                        userData[indx].subgroupTitle = groupsubgroupTitle[subgroup.key()];
                                                        userData[indx].membershipNo  = snapshot.getPriority() || '';
                                                        userData[indx].contactNumber = usermasterdata.contactNumber || '';
                                                        userData[indx].onlinestatus = usersPresense.val() ? true : false,
                                                        /*userData[indx].onlineweb = 0;
                                                        userData[indx].onlineios = 0;
                                                        userData[indx].onlineandroid = 0;*/
                                                        userData[indx].timestamp = timestamp;
                                                        userData[indx].message = message;
                                                        userData[indx].profileImage = usermasterdata['profile-image'] || '';
                                                        userData[indx].firstName = usermasterdata.firstName;
                                                        userData[indx].lastName = usermasterdata.lastName;
                                                        userData[indx].fullName = usermasterdata.firstName + ' ' + usermasterdata.lastName;
                                                        break;
                                                    }
                                                    if (userData.length === indx + 1) {
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
                                                            onlinestatus: usersPresense.val() ? true : false,
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
                                                    }
                                                };
                                            } else {
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
                                                    onlinestatus: usersPresense.val() ? true : false,
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
                                            }
                                        });
                                    });
                                });
                            }); //$firebaseObject
                        }); //firebaseService.getRefSubGroupMembers child_added
                    });
                });
            }

            function getUserData () {
                return userData;
            }

            function setUserGroups () {
                firebaseService.getRefUserGroupMemberships().child(userID).on('child_added', function(group, prevChildKey) {
                	firebaseService.getRefUserGroupMemberships().child(userID).child(group.key()).on('child_removed', function() {
                		userGroups.forEach(function(val,indx) {
                            if(val.groupID === group.key()) {
                                userGroups.splice(indx, 1);
                            }
                        });
                	});
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
