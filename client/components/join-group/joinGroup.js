(function() {
    'use strict';

    angular
        .module('app.JoinGroup')
        .controller('JoinGroupController', ['joinGroupService', 'firebaseService', 'authService', '$firebaseObject', '$firebaseArray',
            function(joinGroupService, firebaseService, authService, $firebaseObject, $firebaseArray) {
                var $scope = this;
                //https://github.com/angular/material/issues/547#issuecomment-65620808

                /*private variables*/
                $scope.filteredGroups = [];



                /*listing groups*/
                this.listgroup;
                //this.groupOne = $firebaseObject(firebaseService.getRefGroupsNames());
                this.groupOne = $firebaseArray(firebaseService.getRefGroupsNames());
                this.groupOne.$loaded().then(function(data) {
                    if (data) {
                        //console.log(data);
                    }

                }).catch(function(err) {
                    console.log(err);
                });

                $scope.clear = function() {
                    if ($scope.listgroup == 0) {

                        $scope.listgroup = $scope.groupOne;
                    }
                    console.log($scope.listgroup);
                };

                $scope.listgroup = this.groupOne;
                // console.log( $scope.listgroup);


                /*VM functions*/
                $scope.queryGroups = queryGroups;
                $scope.answer = answer;
                $scope.hide = hide;

                /*VM properties*/
                $scope.group = {
                    groupID: "",
                    message: "Please add me in your group."
                };



                this.uImg = ['washedout.png', 'PanacloudLogoForList.svg', 'citibankLogo.svg', 'habibBankLogo.svg', 'washedout.png', 'PanacloudLogoForList.svg', 'citibankLogo.svg', 'habibBankLogo.svg', 'habibBankLogo.svg'];

                function loadAllGroups() {
                    $scope.filteredGroups = Firebase.getAsArray(firebaseService.getRefGroupsNames().orderByKey());
                    // console.log($scope.filteredGroups)
                }

                loadAllGroups();




                //query for groups names list
                function queryGroups() {
                    if ($scope.search) {
                        var filteredGroupsNamesRef = firebaseService.getRefGroupsNames()
                            .orderByKey()
                            .startAt($scope.search)
                            .endAt($scope.search + '~');

                        $scope.filteredGroups = Firebase.getAsArray(filteredGroupsNamesRef);
                        // console.log($scope.filteredGroups);
                        /*$scope.filteredGroups.forEach(function(el,i){
                            var j = i
                            $firebaseObject(firebaseService.getRefGroups().child(el.$id))
                                .$loaded()
                                .then(function(groupData){
                                    $scope.filteredGroups[j].groupImg = groupData['logo-image']? groupData['logo-image'].url:""
                                    if(groupData['group-owner-id']){
                                        $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
                                            .$loaded()
                                            .then(function(img){
                                                $scope.filteredGroups[j].ownerImg = img.$value
                                            })

                                    }
                                });
                        })*/
                        $scope.filteredGroups.forEach(function(el, i) {
                            var j = i;
                            $firebaseObject(firebaseService.getRefGroupsNames().child(el.$id))
                                .$loaded().then(function(gNames) {
                                    // console.log($scope.filteredGroups[j]);
                                    // $scope.filteredGroups[j].groupImg = gNames.groupImgUrl;
                                    // $scope.filteredGroups[j].ownerImg = gNames.ownerImgUrl;
                                });
                        });

                    } else {
                        // $scope.filteredGroups = [];
                        loadAllGroups();
                    }

                    return $scope.filteredGroups;
                }

                //cancels join/subscribe group modal
                function hide() {
                    joinGroupService.cancelGroupJoining();
                }

                //answers join/subscribe group modal and sends back some data modal.
                function answer(id) {

                    $scope.group.groupID = id;


                    joinGroupService.joinGroupRequest($scope.group);
                }


                this.validator = function(form) {
                    if (($scope.selectedItem && $scope.selectedItem.$id) && form.$valid) {
                        return false
                    } else {
                        return true;
                    }

                };

                /*
                this.canActivate = function () { // this function automatically gets called by newRouter  for  route Resolution  before controller creation
                    return joinGroupService.canActivate()
                }
                */
            }
        ]);
})();
