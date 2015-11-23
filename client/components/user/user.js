
(function () {
    'use strict';

    angular.module('app.user')
        .controller('UserController', ['$rootScope','$sessionStorage','subgroupFirebaseService','$firebaseArray','userCompService',"firebaseService",'userService','authService','$timeout','$firebaseObject','userPresenceService','$sce', UserController]);

            function UserController ($rootScope,$sessionStorage,subgroupFirebaseService, $firebaseArray,userCompService,firebaseService,userService,authService,$timeout,$firebaseObject,userPresenceService,$sce){

                //$rootScope.fl= 'hello'
            var $scope = this;
            window.userScope = this;
            this.pageUserId = userService.getCurrentUser();
            this.createGroup = function(){
                $location.path('/user/:userID/create-group');
            }
            var userData;
            this.groupMembers;
            this.onlineGroupMembers = [];
            this.offlineGroupMembers = [];


            $scope.openCreateGroupPage = function(){
                userCompService.openCreateGroupPage();
            };
            $scope.openJoinGroupPage = function(){
                userCompService.openJoinGroupPage();
            };

            $scope.userMemData = new userCompService.InitFlatData($scope.pageUserId.userID);
            $scope.userMemData.$loaded().then(function (data) {

                //console.log(data)
                //debugger;
            })

                window.fData = $scope.userMemData

            var profileImgRef = {};

            function profileImgRefCb (snapshot){
                var self = this;
                if(snapshot.key()== 'logo-image'){
                    $timeout(function(){
                        $scope.userObj[self.ind].userImg = $sce.trustAsResourceUrl( snapshot.val())
                        //getUserObj()
                    })
                }

            }
            var groupDataUbind ={};
            var userDataUbind ={};
            var userObjUbind;
            this.userObj =[];
            function getUserObj(){
                var userObj =  $firebaseArray(firebaseService.getRefUserGroupMemberships().child($scope.pageUserId.userID))
                    .$loaded()
                    .then(function(data){
                        userObjUbind = data.$watch(function(){
                            getUserObj()
                        });
                        $scope.userObj = data;
                        data.forEach(function(el,i){
                            var j = i;
                            $firebaseObject(firebaseService.getRefGroups().child(el.$id))
                                .$loaded()
                                .then(function(groupData){
                                    groupDataUbind[j] = groupData.$watch(function(){
                                         $scope.userObj[j].groupUrl = groupData['logo-image']? groupData['logo-image'].url:""
                                    });
                                        $scope.userObj[j].groupUrl = groupData['logo-image']? groupData['logo-image'].url:""

                                        if(groupData['group-owner-id']){
                                            //userDataObj[j] = $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id'])/*.child('profile-image')*/)
                                             $firebaseObject(firebaseService.getRefUsers().child(groupData['group-owner-id']).child('profile-image'))
                                             .$loaded()
                                                     .then(function(img){

                                                 $scope.userObj[j].userImg = $sce.trustAsResourceUrl( img.$value );
                                                     userDataUbind[j]= img.$watch(function(dataVal){

                                                         $scope.userObj[j].userImg = $sce.trustAsResourceUrl( img )
                                                     })
                                                 })
                                        }
                                },function(e){console.log('Error:user.js_line84')});
                        });

                    })
                    .catch(function(){});
            }
            
            getUserObj();

            this.showGroupDetails = function(key){
                //console.log(key)
                var getGroupMembers = $firebaseObject(firebaseService.getRefGroupMembers().child(key));
                getGroupMembers.$loaded()
                    .then(function(data){
                        var x = Object.keys(data);
                        $scope.groupMembers = x;
                        $scope.groupMembers.splice(0,3);
                        // console.log($scope.groupMembers);
                         x.forEach(function(el,i){
                         if((el != '$$conf') && (el!= '$id') && (el!= '$priority')){
                         var z = $firebaseObject(firebaseService.getRefMain().child('users-presence').child(el));
                             z.$loaded().then(function(data){
                                 //console.log(data)
                                 if(z.presence){
                                     console.log('online');
                                     $scope.onlineGroupMembers.push(data)
                                 }
                                 else{
                                     // console.log('offline');
                                     $scope.offlineGroupMembers.push(data)
                                 }
                             })
                                 .catch(function(err){
                                     console.log(err)
                                 })
                         }
                             // console.log(el+' '+i)

                         })
                    })

            };
            this.changeShow1 = function(key, prop,flag,index,that){
                var ctx = {
                    self:that,
                    key:key,
                    prop:prop,
                    flag:flag,
                    index:index
                };

                function bound(){
                    var dom = $('#gCard'+this.index);
                    angular.element(dom).scope().flags = {};
                    angular.element(dom).scope().flags[flag] = true;
                }

                var x = bound.bind(ctx);
                $timeout(x,2000);
                this.selectValue = key;
                this.noShow = !this.noShow;
                return prop;
            };
            this.changeShow2 = function(key, prop){
                this.selectValue = key;
                console.log("hello");
                this.noShow = !this.noShow;
            };
            this.changeShow3 = function(key, prop){
                this.selectValue = key;
            };
            this.deleteAll = function(){
                $scope.groupMembers = [];
                $scope.onlineGroupMembers = [];
                $scope.offlineGroupMembers = [];
                // console.log($scope.groupMembers + $scope.onlineGroupMembers + $scope.offlineGroupMembers)
            };


            $rootScope.searchFn = function (option, flag) {

                angular.forEach($scope.userMemData.data.flattenedsubGroupsByuser, function (el, key) {
                    if (flag == 1) {

                        if (option == 'any' ) {
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

        }

})();
/*
*/
