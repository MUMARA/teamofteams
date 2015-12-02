(function () {
    'use strict';
    angular
        .module('app.user', ['core'])
        .factory('userCompService', ['$state', '$interval', 'userService', '$location', 'authService', '$http', '$q', 'appConfig', '$sessionStorage', '$firebaseObject', 'firebaseService', 'userFirebaseService', '$firebaseArray', 
            function ($state, $interval, userService, $location, authService, $http, $q, appConfig, $localStorage, $firebaseObject, firebaseService, userFirebaseService, $firebaseArray) {
                 var FlattendGroupDataByUser = (function() {
                 var _cb, self,pending = true;
                 var $loadedDefer,_count=0;
                 var flattenedsubGroupsByuser = {};

                 window.temp = {};
                function FlattendGroupDataByUser(userID) {

                    self = this;

                    self.data = {
                        get flattenedsubGroupsByuser(){
                            return flattenedsubGroupsByuser
                        }
                    };
                    pending = true;
                    self.refs={
                        flattendGroup : ''
                    };

                    self.init(userID);

                };

                function setData(data,containerRef){
                    var temp2;
                    //self.counter.outer = Object.keys(data).length
                    self.counter.loopDepth = Object.keys(data).length;
                    angular.forEach(data,function(el,i,a,b){

                        var temp2 = i

                        self.counter.loopDepth --
                        self.counter.total += Object.keys(el).length

                        angular.forEach(el,function(el2,i2){
                            var names = temp2.split('_')
                            var tempUserRef = firebaseService.getRefMain().child('users').child(i2)
                            var $tempUserRef = $firebaseObject(tempUserRef).$loaded()
                            var tempUserCheckinStatus = firebaseService.getRefMain().child('subgroup-check-in-current').child(names[0]).child(names[1]).child(i2);
                            var $tempUserCheckinStatus = $firebaseObject(tempUserCheckinStatus).$loaded();
                            $q.all([$tempUserRef,$tempUserCheckinStatus]).then(function(arr){
                                var  _el2 = el2;
                                var _temp2 = temp2;
                                var _i2 = i2;
                                //userCash[_i2] = _el2;
                                angular.extend(_el2, arr[0],arr[1]);
                                containerRef[_temp2 +'_' + _i2 ]= _el2;
                                containerRef[_temp2 +'_' + _i2].show = true

                                containerRef[_temp2 +'_' + _i2].groupID = names[0]
                                containerRef[_temp2 +'_' + _i2].subgroupID = names[1]
                                window.temp[_temp2 +'_' + _i2]=_el2

                                self.counter.count ++;
                                if(self.counter.count == self.counter.total  && !self.counter.loopDepth){
                                    $loadedDefer.resolve(self.data.flattenedsubGroupsByuser);
                                    self.counter.count = 0;
                                    self.counter.total = 0;
                                }
                                tempUserRef.on('child_changed',function(snapshotChanged){
                                    containerRef[_temp2 +'_' + _i2 ][snapshotChanged.key()]= snapshotChanged.val();
                                    window.temp[_temp2 +'_' + _i2][snapshotChanged.key()]=snapshotChanged.val();
                                })
                                tempUserCheckinStatus.on('child_changed',function(snapshotChangedstatus){
                                    containerRef[_temp2 +'_' + _i2 ][snapshotChangedstatus.key()]= snapshotChangedstatus.val();
                                    window.temp[_temp2 +'_' + _i2][snapshotChangedstatus.key()]=snapshotChangedstatus.val();

                                })
                            })

                        })
                    })

                }

                FlattendGroupDataByUser.prototype = {

                    'init': function (userID) {
                        flattenedsubGroupsByuser = {};
                        self.counter ={
                            total:0,
                            loopDepth:0,
                            count:0
                        };

                        self.refs.flattendGroup =firebaseService.getRefFlattendGroups().child(userID)
                        self.refs.flattendGroup.once('value',self.flattendGroupHandler)

                    },
                    'flattendGroupHandler':function(snapshot){
                        //debugger;


                        if(snapshot.val() && Object.keys(snapshot.val()).length){
                            self.data.groupSubgroupData = snapshot.val()
                            setData(snapshot.val(),flattenedsubGroupsByuser);
                        }else{
                            // console.log('no data')
                        }


                    },

                    $loaded: function () {
                        $loadedDefer = $q.defer()

                        return $loadedDefer.promise;
                    }
                }
                return FlattendGroupDataByUser;

            })()



            return {
                InitFlatData:FlattendGroupDataByUser,

                'openCreateGroupPage': function () {

                    $location.path('/user/' + userService.getCurrentUser().userID + '/create-group')

                },
                'openJoinGroupPage': function () {

                    // $location.path('/user/joingroup')
                    $state.go('user.join-group');

                }

            }

        }])


})();
