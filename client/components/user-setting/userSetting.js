/**
 * Created by Muhammad Mohsin on 6/17/2015.
 */
/**
 * Created by sj on 6/10/2015.
 */
(function () {
    'use strict';
    angular
        .module('app.userSetting')
        .controller('UserSettingController',['$rootScope','messageService','$stateParams','$localStorage','groupFirebaseService','firebaseService','$location','createSubGroupService','userService','authService','$timeout','utilService','$mdDialog','$mdSidenav','$mdUtil',UserSettingController])
       /* .controller("DialogController", ["$mdDialog", DialogController]);*/
    function UserSettingController($rootScope,messageService,$stateParams,$localStorage,groupFirebaseService,firebaseService,$location,createSubGroupService,userService,authService,$timeout,utilService,$mdDialog,$mdSidenav,$mdUtil) {

        var that = this;
        var user = userService.getCurrentUser();
        this.hide = hide;
        var localStorage = $localStorage.loggedInUser;
        var groupID=$stateParams.groupID;
        var $loggedInUserObj = groupFirebaseService.getSignedinUserObj();

        this.approveMembership = approveMembership;
        this.rejectMembership = rejectMembership;
        this.changeMemberRole=changeMemberRole;

        this.openCreateSubGroupPage = function () {
            $location.path('/user/group/'+groupID+'/create-subgroup');
        }

        this.subgroupPage = function () {
            $location.path('user/group/'+groupID+'/subgroup');
        }
        this.editgroupPage = function () {
            $location.path('user/group/'+groupID+'/edit-group');
        }
        this.openGeoFencingPage = function(){
            $location.path('/user/group/'+groupID+'/geoFencing');
        }

        this.syncGroupPromise = groupFirebaseService.getGroupSyncObjAsync(groupID, localStorage.userID)
            .then(function(syncObj){
                that.groupSyncObj = syncObj;
                //that.groupSyncObj.groupSyncObj.$bindTo(that, "group");
                that.group = that.groupSyncObj.groupSyncObj;
                that.members = that.groupSyncObj.membersSyncArray;
                that.subgroups = that.groupSyncObj.subgroupsSyncArray;
                that.pendingRequests = that.groupSyncObj.pendingMembershipSyncArray;
                // console.log(that.pendingRequests)
                //that.activities = that.groupSyncObj.activitiesSyncArray;


            });
        function hide() {
            /*   createGroupService.cancelGroupCreation();*/
            /* $mdDialog.cancel();*/
            $location.path('/user/group/'+groupID);

        }
        //For owner/admin: Rejects membership request.
        function approveMembership( requestedMember ) {
            $loggedInUserObj.$loaded().then(function () {
                $loggedInUserObj.userID = localStorage.userID;
                groupFirebaseService.approveMembership( groupID, $loggedInUserObj, requestedMember )
                    .then(function( res ) {
                        messageService.showSuccess( res );
                    }, function( reason ) {
                        messageService.showFailure( reason );
                    });
            });
        }

        //For owner/admin: Rejects membership request.
        function rejectMembership( requestedMember ) {
            $loggedInUserObj.$loaded().then(function () {
                $loggedInUserObj.userID = localStorage.userID;
                groupFirebaseService.rejectMembership(groupID, $loggedInUserObj, requestedMember)
                    .then(function (res) {
                        messageService.showSuccess(res);
                    }, function (reason) {
                        messageService.showFailure(reason);
                    });
            });
        }

        //For owner only: to change membership role of a member
        function changeMemberRole( newType, member ) {
            groupFirebaseService.changeMemberRole( newType, member, that.group, $loggedInUserObj )
                .then(function( res ) {
                    messageService.showSuccess( res );
                }, function( reason ) {
                    messageService.showFailure( reason );
                });
        }


//dummy data
        this.userarray = [];
        this.name = 'World';
        this.userImg= ['card.jpg','userImg1.svg','userImg2.svg','userImg3.svg','userImg4.svg','card.jpg','userImg1.svg','userImg2.svg','userImg3.svg','userImg4.svg'];

        for(var i = 1 ; i<5 ; ++i){
            this.userarray.push( {
                img: '../../img/' + this.userImg[i],
                name: 'Salman',
                phone: '4019654',
//                group: 'first',
                //LastM: 'second'
                LastM: "yy-mm-dd"
            })
        }

    }



})();
