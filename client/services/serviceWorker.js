console.log('watch on service worker');
var cacheName = 'weatherPWA-step-5-12';
var filesToCache = [
  '/',
  // './*',
  // './sounds/*'
  "./activityStreamService.js",         //services
  "./auth.service.js",         //services
  "./chatService.js",         //services
  "./checkin.service.js",         //services
  "./confirmDialog.service.js",         //services
  "./dataService.js",         //services
  './firebase.service.js',         //services
  './group.firebase.service.js',         //services
  './message.service.js',         //services
  './sound.service.js',         //services
  './subgroup.firebase.service.js',         //services
  './user.firebase.service.js',         //services
  './user.service.js',         //services
  './userHelper.firebase.js',         //services
  './userPresence.firebase.js',         //services
  './util.service.js',         //services

  '../sounds/guitar_success.mp3',       //sounds
  '../sounds/piano_fail.mp3',       //sounds

  '../app.js',
  '../app-dev.js',
    '../bower.json',
    '../gulpfile.js',
    '../index.html',
  '../package.json',
  
  '../minifyVersion/all.js',
  
  '../img/12452.svg',
  '../img/1add_quiz.svg',
  '../img/1angular.png',
  '../img/1arrow.png',
  '../img/1banda.svg',
  '../img/1book.svg',
  '../img/1calendar.svg',
  '../img/1chapter.svg',
  '../img/1dots.svg',
  '../img/1dropdown.svg',
  '../img/1ioniclogo.png',

  // '../images/ic\_refresh\_white\_24px.svg'
  // // '/images/partly-cloudy.png',
  // // '/images/rain.png',
  // // '/images/scattered-showers.png',
  // // '/images/sleet.png',
  // // '/images/snow.png',
  // // '/images/thunderstorm.png',
  // // '/images/wind.png'
];

self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function (e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
