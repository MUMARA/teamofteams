// Registering ServiceWorker...
if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(function (registration) {
        console.log(':^)', registration);
    }).catch(function (error) {
        console.log(':^(', error);
        // ref.child("user-errors").child('on-registration').push(error.toJSON(), function (err) {
        //     console.log('on-registration: ', err);
        // });
    });
} //if serviceWorker

/**
 * Created by ZiaKhan on 05/12/14.
*/

// Invoke 'strict' JavaScript mode
"use strict";
// Set the main application name
//var mainApplicationModuleName = 'Panacloud.WOW';// Theory behind this software: http://hq.teamfit.co/its-a-team-of-teams-world-now/
var mainApplicationModuleName = 'myApp'; // Theory behind this software: http://hq.teamfit.co/its-a-team-of-teams-world-now/
var mainApplicationModule = angular.module(mainApplicationModuleName, [
    'components',
    'core'


]).run(['authService', function(authService) {
    // alert('run');
    // authService.resolveUserPage();
}]);
mainApplicationModule.value('appConfig', {
    'apiBaseUrl': 'https://wgco9m0sl1.execute-api.us-east-1.amazonaws.com/dev',
    // 'apiBaseUrl': 'https://panacloudapi.herokuapp.com',
    // 'apiBaseUrl': 'http://localhost:3000',
    'myFirebase': 'https://luminous-torch-4640.firebaseio.com',
    'firebaseAuth': false,
    'serverPostApi': {
        userProfilePictureUpload: 'api/groupProfilepicture',
        groupProfilePictureUpload: 'api/groupProfilepicture'
    }
});

// Configure the hashbang URLs using the $locationProvider services
/*mainApplicationModule.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);*/

/*
mainApplicationModule.config (['$componentLoaderProvider', '$locationProvider', function ($componentLoaderProvider, $locationProvider) {
    $componentLoaderProvider.setTemplateMapping(function (name) {
        var dashName = dashCase(name);
        return '/components/' + dashName + '/' + dashName + '.html';
    });
    $locationProvider.hashPrefix('!');
}])
*/
/*
mainApplicationModule.config (['$locationProvider', function ($locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}])
*/

mainApplicationModule.constant('angularMomentConfig', {
    preprocess: 'unix' // optional https://github.com/urish/angular-moment
});

// Fix Facebook's OAuth bug
//if (window.location.hash === '#_=_') window.location.hash = '#!';

// // Manually bootstrap the AngularJS application
// angular.element(document).ready(function() {
//     angular.bootstrap(document, [mainApplicationModuleName]);
// });
