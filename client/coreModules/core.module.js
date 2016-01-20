/**
 * Created by ZiaKhan on 16/12/14.
 */

// Invoke 'strict' JavaScript mode
'use strict';

//add ngMaterial
// Create the 'example' module
angular.module('core', [

    // 'angularMoment',
    'ngAudio',
    'ngAnimate',
    'ngAria',
    // 'checkin',
    'ngMdIcons',
    //'ngMaterial',
    'firebase',
    'ngStorage',
    'ngGeolocation',
    // 'ui.select',
    'ngMessages',
    'ng-mfb',
    // 'ui.select',
    // 'ngSanitize',
    'ui.router',
    'angular-img-cropper',
    'md.data.table'/*,
    'leaflet-directive'*/,
    'ui-leaflet',
    'angular.filter'

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
.filter('emptyString', [
  function() {
    return function(input, param) {
      if (!param) return input

      var ret = [];
      if (!angular.isDefined(param)) param = true;


      if (param) {
        angular.forEach(input, function(v) {
          if (angular.isDefined(v.comment) && v.comment) {
            v.comment = v.comment.replace(/^\s*/g, '');
            ret.push(v);
          }

        });
      }
      return ret;
    };
  }
])
.filter('millSecondsToTimeString', [function() {
    return function(millseconds) {
        var seconds = Math.floor(millseconds / 1000);
        var days = Math.floor(seconds / 86400);
        var hours = Math.floor((seconds % 86400) / 3600);
        var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
        var timeString = '';
        if(days > 0) timeString += (days > 1) ? (days + " days ") : (days + " day ");
        if(hours > 0) timeString += (hours > 1) ? (hours + " hours ") : (hours + " hour ");
        if(minutes >= 0) timeString += (minutes > 1) ? (minutes + " minutes ") : (minutes + " minute ");
        return timeString;
    }
}])
.filter('glt', [function () {
    return function ( items, field, maxvalue, minvalue ) {
        if (maxvalue && minvalue){
            var filteredItems = []
            angular.forEach(items, function ( item ) {
                if (item[field] >= maxvalue &&  item[field] <= minvalue) {
                    filteredItems.push(item);
                }
            });
            return filteredItems;
        } else if (maxvalue){
            var filteredItems = []
            angular.forEach(items, function ( item ) {
                if (item[field] >= maxvalue) {
                    filteredItems.push(item);
                }
            });
            return filteredItems;
        } else {
          return items
        }
        
    }
}])
.filter('multilineFilter', ['$sce', function ($sce) {
    return function (text) {
        if (text !== undefined) return $sce.trustAsHtml(text.replace(/\n/g, '<br />'));
    }
}])
/* .run(["authService",function(authService){
     //debugger;
     authService.resolveUserPage();
 }]);*/
