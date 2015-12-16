/**
 * Created by ZiaKhan on 02/02/15.
 */

'use strict';

angular.module('core')
    .factory('soundService', ["ngAudio", function(ngAudio) {
        var successSound = ngAudio.load("sounds/guitar_success.mp3"); // returns NgAudioObject
        var failSound = ngAudio.load("sounds/piano_fail.mp3");

        return {
            playSuccess: function() {
                successSound.play();
            },
            playFail: function() {
                failSound.play();
            }
        };
    }]);
