/**
 * Created by Shahzad on 2/06/2015.
 */


(function() {

// Invoke 'strict' JavaScript mode
    'use strict';

    angular
        .module('checkin')
        .filter('getLocationNameByID', getLocationNameByID );

    getLocationNameByID.$inject = ['checkinService'];

    function getLocationNameByID( checkinService ) {
        return function( checkinObj, locations ) {
            return checkinService.getLocationName( checkinObj, locations );
        };
    }
})();

