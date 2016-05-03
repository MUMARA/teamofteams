/**
 * Created by ZiaKhan on 01/02/15.
 */

'use strict';

angular.module('core')
    .factory('messageService', ["$mdToast", "soundService", function($mdToast, soundService) {
        var position = 'top left';
        return {
            show: function(message) {
                $mdToast.show({
                    template: '<md-toast class="md-toast-animating">' + message + '</md-toast>',
                    hideDelay: 3000,
                    //hideDelay: 200000,
                    position: 'top left right'
                });
            },
            fast: function(message) {
                $mdToast.show({
                    template: '<md-toast class="md-toast-animating">' + message + '</md-toast>',
                    hideDelay: 500,
                    //hideDelay: 200000,
                    position: 'top left right'
                });
            },
            showSuccess: function(message) {
                this.show(message || 'Process successful.');
                soundService.playSuccess();
            },
            showFailure: function(message) {
                this.show(message || 'Process failed.');
                soundService.playFail();
            },
            fastSuccess: function(message) {
                this.fast(message || 'Process successful.');
                soundService.playSuccess();
            },
            fastFailure: function(message) {
                this.fast(message || 'Process failed.');
                soundService.playFail();
            },
            changePosition: function(position) {
                position = position
            },
            reset: function() {
                position = 'top left'
            }
        };
    }]);
