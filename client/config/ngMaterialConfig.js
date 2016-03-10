/**
 * Created by Shahzad on 5/21/2015.
 */

(function() {
    'use strict';
    angular.module("myApp")
        .config(function($mdThemingProvider, $mdIconProvider) {
            $mdThemingProvider.definePalette('panacloudPaletteName', {
                '50': 'ffebee',
                '100': 'ffcdd2',
                '200': 'ef9a9a',
                '300': 'e57373',
                '400': 'ef5350',
                '500': 'f44336',
                '600': 'e53935',
                '700': 'd32f2f',
                '800': 'c62828',
                '900': 'b71c1c',
                'A100': 'ff8a80',
                'A200': 'ff5252',
                'A400': 'ff1744',
                'A700': 'd50000',
                'contrastDefaultColor': 'light', // whether, by default, text (contrast)
                // on this palette should be dark or light
                'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'], //hues which contrast should be 'dark' by default

                'contrastLightColors': undefined // could also specify this if default was 'dark'
            });

            $mdThemingProvider.theme('default')
                .primaryPalette('panacloudPaletteName');
            /*$mdIconProvider
             .defaultIconSet('./assets/svg/avatars.svg', 128)
             .icon('menu'       , './assets/svg/menu.svg'        , 24)
             .icon('share'      , './assets/svg/share.svg'       , 24)
             .icon('google_plus', './assets/svg/google_plus.svg' , 512)
             .icon('hangouts'   , './assets/svg/hangouts.svg'    , 512)
             .icon('twitter'    , './assets/svg/twitter.svg'     , 512)
             .icon('phone'      , './assets/svg/phone.svg'       , 512);*/
        });
})();
