/**
 * Created by ZiaKhan on 20/01/15.
 */

/*following angularJS code-style guide https://github.com/johnpapa/angularjs-styleguide*/

(function() {

// Invoke 'strict' JavaScript mode
'use strict';

    angular
        .module('checkin', [
            'angularGeoFire',
            //'components',
            'core',
            'leaflet-directive',
            'angularMoment'
        ])
})();
