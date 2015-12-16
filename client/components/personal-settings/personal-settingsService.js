/*
 * Created by Shahzad on 5/23/2015.
 */

(function() {
    'use strict';
    angular
        .module('app.personalSettings', ['core'])
        .factory('personalSettingsService', ['soundService', '$location', 'userService',
            function(soundService, $location, userService) {

                return {

                    'cancelPersonalSettings': function(userId) {
                        //console.log("Personal Settings Cancelled");
                        soundService.playFail();
                        $location.path('/user/' + userService.getCurrentUser().userID)

                    }
                }

            }
        ])

})();

<!--waste-->
