/**
 * Created by Mkamran on 31/12/14.
 */

'use strict';

angular.module('core')
    .factory('dataService', ['$firebaseObject', 'firebaseService', 'checkinService', 'userService',
        function($firebaseObject, firebaseService, checkinService, userService) {

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
                    })
                    firebaseService.getRefUserSubGroupMemberships().child(userID).child(group.key()).on('child_added', function(subgroup, prevChildKey) {
                        checkinService.getRefCheckinCurrentBySubgroup().child(group.key()).child(subgroup.key()).on('child_changed', function(snapshot, prevChildKey) {
                            userData.forEach(function(val, indx) {
                                if (val.id === snapshot.key()) {
                                    if (val.groupsubgroup === (group.key() + ' / ' + subgroup.key())) {
                                        val.type = snapshot.val().type;
                                        val.message = snapshot.val().message;
                                        val.timestamp = snapshot.val().timestamp;
                                    }
                                }
                            })
                        });
                        $firebaseObject(firebaseService.getRefSubGroups().child(group.key()).child(subgroup.key())).$loaded().then(function(subgroupmasterdata) {
                            groupsubgroupTitle[subgroup.key()] = subgroupmasterdata.title;
                        })
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
                                        })
                                    });
                                    userData.push({
                                        id: userdata.$id,
                                        type: type,
                                        groupsubgroup: group.key() + ' / ' + subgroup.key(),
                                        groupsubgroupTitle: groupsubgroupTitle[group.key()] + ' / ' + groupsubgroupTitle[subgroup.key()],
                                        groupID: group.key(),
                                        groupTitle: groupsubgroupTitle[group.key()],
                                        subgroupID: subgroup.key(),
                                        subgroupTitle: groupsubgroupTitle[subgroup.key()],
                                        contactNumber: usermasterdata.contactNumber || '',
                                        timestamp: timestamp,
                                        message: message,
                                        profileImage: usermasterdata['profile-image'] || '',
                                        firstName: usermasterdata.firstName,
                                        lastName: usermasterdata.lastName
                                    });
                                })
                            });
                        })
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
                            });
                            firebaseService.getRefGroups().child(group.key()).on('child_changed', function(snapshot, prevChildKey) {
                                userGroups.forEach(function(item, index){
                                    if (item.groupID === group.key()) {
                                        if (snapshot.key() === "title") {
                                            item['title'] = snapshot.val()
                                        }
                                        if (snapshot.key() === "members-checked-in") {
                                            item.membersOnline = snapshot.val().count
                                        }
                                        if (snapshot.key() === "members-count") {
                                            item.members = snapshot.val()
                                        }
                                        if (snapshot.key() === "address-title") {
                                            item.addressTitle = snapshot.val();
                                        }
                                    }
                                });
                            });
                        }
                    })
                })
            }

            function getUserGroups () {
                return userGroups;
            }

            return {
                loadData: loadData,
                unloadData: unloadData,
                getUserData: getUserData,
                getUserGroups: getUserGroups
            }
        }
    ]);
