/**
 * Created by Jahanzaib on 1/27/2015.
 */


(function() {

    // Invoke 'strict' JavaScript mode
    'use strict';

    angular
        .module('checkin')
        .filter('array', function() {
            return function(items) {
                var filteredItems = [];

                for (var key in items) {
                    filteredItems.push(items[key])
                }

                return filteredItems;
            };
        });
})();
