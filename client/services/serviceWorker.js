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
  '../img/1questions.svg',
  '../img/1quiz_bank.svg',
  '../img/1quiz_schedule.svg',
  '../img/1sami.svg',
  '../img/1search.svg',
  '../img/1swift.png',
  '../img/1topic.svg',
  '../img/2.svg',
  '../img/2sami.svg',
  '../img/3sami.svg',
  '../img/4sami.svg',
  '../img/5sami.svg',
  '../img/6sami.svg',
  '../img/12452.svg',
  '../img/ABCD.svg',
  '../img/account-box.svg',
  '../img/add_quiz_2_.svg',
  '../img/arrow.svg',
  '../img/arrow-left.svg',
  '../img/backGroundImg.svg',
  '../img/book.png',
  '../img/Capture.PNG',
  '../img/Capture.PNG1.PNG',
  '../img/Capture.PNG3.PNG',
  '../img/card.jpg',
  '../img/carrot.svg',
  '../img/check.png',
  '../img/checkarrow.svg',
  '../img/checkbox.svg',
  '../img/citibankLogo.svg',
  '../img/closeIcon.png',
  '../img/comment.svg',
  '../img/correct.svg',
  '../img/corrects.svg',
  '../img/cross.svg',
  '../img/dd.jpg',
  '../img/delete.svg',
  '../img/email.svg',
  '../img/facebook.svg',
  '../img/forGroupPage.svg',
  '../img/forGroupPage1.svg',
  '../img/forGroupPage2.svg',
  '../img/geoLocation.svg',
  '../img/github-circle.svg',
  '../img/google.svg',
  '../img/habibBankLogo.svg',
  '../img/header_subheader.png',
  '../img/icon1.svg',
  '../img/image.PNG',
  '../img/image.svg',
  '../img/image2.PNG',
  '../img/info_small_icon.png',
  '../img/info2.svg',
  '../img/infoB.svg',
  '../img/line.svg',
  '../img/location.svg',
  '../img/location_point.svg',
  '../img/magnify.png',
  '../img/magnify.svg',
  '../img/map-marker.svg',
  '../img/menu.svg',
  '../img/multiContact.png',
  '../img/notification.svg',
  '../img/notification1.svg',
  '../img/PanacloudLogoForList.svg',
  '../img/passfail.jpg',
  '../img/people_button.svg',
  '../img/people_button_black.svg',
  '../img/phone-in-talk.svg',
  '../img/pizzahut.jpg',
  '../img/plus.svg',
  '../img/quiz_schedule.svg',
  '../img/ring.svg',
  '../img/sami.png',
  '../img/sampleUserImg.svg',
  '../img/search.svg',
  '../img/searchDarkGrey.svg',
  '../img/security.svg',
  '../img/sj.jpg',
  '../img/sj1.jpg',
  '../img/subheader.png',
  '../img/switchCardListLogo.svg',
  '../img/tcpana.png',
  '../img/toolbar.PNG',
  '../img/Untitled-1.psd',
  '../img/Untitled-3.png',
  '../img/Untitled-3.svg',
  '../img/Untitled-4.svg',
  '../img/Untitled-4_06.png',
  '../img/Untitled-6.svg',
  '../img/up-arrow.png',
  '../img/userImg1.svg',
  '../img/userImg2.svg',
  '../img/userImg3.svg',
  '../img/userImg4.svg',
  '../img/verified_user.svg',
  '../img/washedout.png',

  '../directive/checkGroupExistance.directive.js',
  '../directive/checkUserID.directive.js',
  '../directive/compareTo.directive.js',
  '../directive/dilogue1.tmpl.html',
  '../directive/dilogue2.tmpl.html',
  '../directive/groupcardDirective.html',
  '../directive/groupcardDirective.js',
  '../directive/subgroupcardDirective.html',
  '../directive/subgroupcardDirective.js',

  "../css/collaborator.css",
  "../css/style.css",

  "../coreModules/core.module.js",
  "../coreModules/firebase-as-array.js",

  "../config/appRoutes.js",
  "../config/ngMaterialConfig.js",

// components start

  "../components/activity/activity.js",
  "../components/activity/activity.html",

  "../components/chat/chat.html",
  "../components/chat/chat.js",

  "../components/collaborator/collaborator.html",
  "../components/collaborator/collaborator.js",
  "../components/collaborator/collaboratorService.js",

  "../components/create-group/create-group.html",
  "../components/create-group/create-group_org.html",
  "../components/create-group/createGroup.js",
  "../components/create-group/createGroupService.js",

  "../components/create-sub-group/create-sub-group.html",
  "../components/create-sub-group/create-sub-group_org.html",
  "../components/create-sub-group/createSubGroup.js",
  "../components/create-sub-group/createSubGroupService.js",

  "../components/edit-group/edit-group_org.html",
  "../components/edit-group/edit-group.html",
  "../components/edit-group/edit-group.js",
  "../components/edit-group/editGroupService.js",

  "../components/forgot/forgot.html",
  "../components/forgot/forgot.js",
  "../components/forgot/forgotService.js",

  "../components/group/group.js",
  "../components/group/group_.js",
  "../components/group/group_org.html",
  "../components/group/group.html",
  "../components/group/groupService.js",

  "../components/home/home.js",
  "../components/home/home.html",

  "../components/join-group/join-group_org.html",
  "../components/join-group/join-group.html",
  "../components/join-group/joinGroup.js",
  "../components/join-group/joinGroupService.js",

  "../components/manualattendace/manualattendace.js",
  "../components/manualattendace/manualattendace.html",

  "../components/membershipcard/membershipcard.js",
  "../components/membershipcard/membershipcard.html",

  "../components/nav-loginbar/navLoginbar.js",
  "../components/nav-loginbar/nav-loginbar.html",

  "../components/nav-toolbar/navToobarService.js",
  "../components/nav-loginbar/navToobar.html",
  "../components/nav-loginbar/nav-toolbar.html",

  "../components/personal-settings/personal-settingsService.js",
  "../components/personal-settings/personal-settings.html",
  "../components/personal-settings/personal-settings.js",

  "../components/policy/policy.js",
  "../components/policy/policy.html",
  "../components/policy/policyService.js",
  "../components/policy/policy_working.html",

  "../components/progressreport/progressreport.html",
  "../components/progressreport/progressreport.js",
  "../components/progressreport/progressreportService.js",

  "../components/quiz/images/closeIcon.png",
  "../components/quiz/images/deleteIcon.png",
  "../components/quiz/images/ic_delete_24px.svg",
  "../components/quiz/images.png",
  "../components/quiz/quiz.js",
  "../components/quiz/quiz.html",
  "../components/quiz/quizService.js",

  "../components/report/report.js",
  "../components/report/report.html",

  "../components/signin/signin.html",
  "../components/signin/signin.js",
  "../components/signin/signInService.js",

  "../components/sign-up/signUpService.js",
  "../components/sign-up/signUp.js",
  "../components/sign-up/sign-up.html",

  "../components/user/user.html",
  "../components/user/user.js",
  "../components/user/userService.js",
  "../components/user/user_org.html",
  "../components/user/usergroupcard.html",

  "../components/user-setting/user-setting.html",
  "../components/user-setting/userSetting.js",
  "../components/user-setting/user-setting_org.html",
  "../components/user-setting/userSettingService.html",

  "../components/componentsCoreModule.js",
// components end

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
