/**
 * Created by Shahzad on 2/27/2015.
 */

(function () {
    'use strict';

    angular
        .module('checkin')
        .controller('ChartsCheckinCtrl', ChartsCheckinCtrl );

    ChartsCheckinCtrl.$inject = ['$scope', '$timeout', 'firebaseService'];

    function ChartsCheckinCtrl( $scope, $timeout, firebaseService ) {

        /*listeners*/
        var currentGroupDataRef = firebaseService.getRefGroups().child( $scope.groupID );
        currentGroupDataRef.on('value', groupDataChanged );

        /*VM functions*/
        //...

        /*VM properties*/
        $scope.chartActive = true;
        $scope.chartType = 'pie';

        $scope.chartData = {
            data: [{
                x: "PanaCloud",
                y: [5],
                tooltip: "from panaCloud"
            }, {
                x: "Swift",
                y: [2],
                tooltip: "form Swift"
            }, {
                x: "Meet one",
                y: [3],
                tooltip: "from Meetone"
            }, {
                x: "Other location",
                y: [1],
                tooltip: "from Other location"
            }, {
                x: "Not available",
                y: [3],
                tooltip: "not available"
            }
            ]
        };

        //$scope.chartTeamConfig = {
        //    title: 'Team summary',
        //    tooltips: true,
        //    labels: false,
        //    legend: {
        //        display: true,
        //        //could be 'left, right'
        //        position: 'left'
        //    },
        //    colors: ['black'],
        //    waitForHeightAndWidth: true
        //};
        //
        //$scope.chartSubTeamConfig = {
        //    title: 'Sub Team 1',
        //    tooltips: true,
        //    labels: false,
        //    legend: {
        //        display: false,
        //        //could be 'left, right'
        //        position: 'left'
        //    },
        //    waitForHeightAndWidth: true
        //};
        //
        //$scope.chartSubTeam2Config = {
        //    title: 'Sub Team 2',
        //    tooltips: true,
        //    labels: false,
        //    legend: {
        //        display: false,
        //        //could be 'left, right'
        //        position: 'left'
        //    },
        //    waitForHeightAndWidth: true
        //};

        $scope.chartGroupConfig = {
            title: $scope.groupID + ' summary',
            tooltips: true,
            labels: false,
            legend: {
                display: true,
                //could be 'left, right'
                position: 'left'
            },
            waitForHeightAndWidth: true
        };

        //listener for any change in group checkin. updates charts values.
        function groupDataChanged( snapshot ) {
            var groupMetaDataObj = snapshot.val();

            $timeout(function () {
                $scope.chartGroupActive = true;

                $scope.totalMembers = groupMetaDataObj['members-count'];
                $scope.checkedInUsers = groupMetaDataObj['members-checked-in'].count;
                $scope.checkedOutUsers = $scope.totalMembers - $scope.checkedInUsers;

                $scope.chartGroupData = {
                    data: [
                        {
                            x: 'Checked In',
                            y: [$scope.checkedInUsers],
                            tooltip: "Checked-In Users: " + $scope.checkedInUsers
                        },
                        {
                            x: 'Checked out',
                            y: [$scope.checkedOutUsers],
                            tooltip: "Checked-Out Users: " + $scope.checkedOutUsers
                        }]
                };
            });
        }
    }

})();
