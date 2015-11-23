/**
 * Created by Shahzad on 2/25/2015.
 */

(function () {
    'use strict';

    angular
        .module('core')
        .factory('confirmDialogService', confirmDialogService );

    confirmDialogService.$inject = ['$mdDialog'];

    function confirmDialogService( $mdDialog ) {

        return function ( cautionString ) {
            return $mdDialog.show({
                templateUrl: 'core/views/confirmDialog.tmpl.html',
                controller: 'ConfirmDialogCtrl',
                locals: {
                    cautionString: cautionString || 'Are you sure ?'
                }
            });
        };
    }

})();
