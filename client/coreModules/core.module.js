/**
 * Created by ZiaKhan on 16/12/14.
 */

// Invoke 'strict' JavaScript mode
'use strict';

//add ngMaterial
// Create the 'example' module
angular.module('core', [

    'angularMoment',
    'ngAudio',
    'ngAnimate',
    'ngAria',
    'checkin',
    'ngMdIcons',
    //'ngMaterial',
    'firebase',
    'ngStorage',
    'ngGeolocation',
    'ui.select',
    'ngMessages',
    'ng-mfb',
    'ui.select',
    'ngSanitize',
    'ui.router',
    'ngImgCrop'

    /*   'customdirectives'*/

    //'angularCharts'
]).filter('trustUrl', function($sce) {
    return function(url) {
        /*var temp;
        $.get(url).success(function(data){
            temp = 'data:image/jpeg;base64' + data;
        });

        //var temp = webkitURL.createObjectURL(url)*/
        return url
    };
})

/* .run(["authService",function(authService){
     //debugger;
     authService.resolveUserPage();
 }]);*/
