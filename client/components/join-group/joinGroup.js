(function() {
    'use strict';

    angular
        .module('app.JoinGroup')
        .controller('JoinGroupController', ['dataService', 'userService', 'joinGroupService', 'firebaseService', 'authService', '$firebaseObject', '$firebaseArray',
            function(dataService, userService, joinGroupService, firebaseService, authService, $firebaseObject, $firebaseArray) {
                // var $scope = this;
                //https://github.com/angular/material/issues/547#issuecomment65620808

                /*private variables*/
                var that = this;
                this.filteredGroups = [];
                this.loadingData = true;
                this.user = userService.getCurrentUser();

                // firebaseService.getRefGroups().on('child_added', function (snapshot) {
                //     that.filteredGroups.push(snapshot.val());
                // });
                /*listing groups*/
                // this.listgroup;
                //this.groupOne = $firebaseObject(firebaseService.getRefGroupsNames());
                // this.filteredGroups = dataService.getTotalGroups();
                $firebaseArray(firebaseService.getRefGroupsNames()).$loaded().then(function(data){
                    that.filteredGroups = data;
                    that.loadingData = false;
                });

                // $firebaseArray(firebaseService.getRefGroups()).$loaded().then(function(data){
                //     that.filteredGroups = data;
                //     that.loadingData = false;
                // });
                // this.groupOne.$loaded().then(function(data) {
                //     if (data) {
                //         //console.log(data);
                //     }

                // }).catch(function(err) {
                //     console.log(err);
                // });

                // $scope.clear = function() {
                //     if ($scope.listgroup == 0) {

                //         $scope.listgroup = $scope.groupOne;
                //     }
                //     console.log($scope.listgroup);
                // };

                // $scope.listgroup = this.groupOne;
                // console.log( $scope.listgroup);


                /*VM functions*/
                // $scope.queryGroups = queryGroups;
                this.answer = answer;
                this.hide = hide;

                /*VM properties*/
                this.message = {};
                this.group = {
                    groupID: "",
                    message: "Please add me in your Team.",
                    membershipNo: ""
                };



//                this.uImg = ['washedout.png', 'PanacloudLogoForList.svg', 'citibankLogo.svg', 'habibBankLogo.svg', 'washedout.png', 'PanacloudLogoForList.svg', 'citibankLogo.svg', 'habibBankLogo.svg', 'habibBankLogo.svg'];
/*
                function loadAllGroups() {
                    $scope.filteredGroups = Firebase.getAsArray(firebaseService.getRefGroupsNames().orderByKey());
                    // console.log($scope.filteredGroups)
                }

*/
                // loadAllGroups();



/*
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
                                                                         $scope.filteredGroups[j].groupImg = groupData['logoimage']? groupData['logoimage'].url:""
                                                                         if(groupData['groupownerid']){
                                                                             $firebaseObject(firebaseService.getRefUsers().child(groupData['groupownerid']).child('profileimage'))
                                                                                 .$loaded()
                                                                                 .then(function(img){
                                                                                     $scope.filteredGroups[j].ownerImg = img.$value
                                                                                 })

                                                                         }
                                                                     });
                                                             })*/
/*                        $scope.filteredGroups.forEach(function(el, i) {
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

*/
                //cancels join/subscribe group modal
                function hide() {
                    joinGroupService.cancelGroupJoining();
                }

                //answers join/subscribe group modal and sends back some data modal.
                function answer(group) {
                    that.loadingData = true;
                    that.group.message = that.message[group.$id] || that.group.message;
                    that.group.membershipNo = that.membershipNo[group.$id] || that.group.membershipNo;
                    that.group.groupID = group.$id;
                    that.group.title = group.title;

                    joinGroupService.joinGroupRequest(that.group, function(){
                        that.loadingData = false;
                    });
                }

/*
                this.validator = function(form) {
                    if ((this.selectedItem && this.selectedItem.$id) && form.$valid) {
                        return false
                    } else {
                        return true;
                    }

                };

*/
                /*
                 this.canActivate = function () { // this function automatically gets called by newRouter  for  route Resolution  before controller creation
                     return joinGroupService.canActivate()
                 }
                 */
            }
        ]);
})();
