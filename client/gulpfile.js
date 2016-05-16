/**
 * Created by ZiaKhan on 08/01/15.
 */

var gulp = require('gulp'),
    url = require('url'),
    concat = require('gulp-concat'),
    // minify = require('gulp-minify');
    uglify = require('gulp-uglify'),
    fs = require('fs');

var webserver = require('gulp-webserver');

gulp.task("minifying", function() {
    gulp.src([
            "./coreModules/core.module.js",
            "./coreModules/firebase-as-array.js",
            "./components/user/userService.js",
            "./components/activity/activity.js",
            "./components/report/report.js",
            "./components/chat/chat.js",
            "./components/manualattendace/manualattendace.js",
            "./components/progressreport/progressreportService.js",
            "./components/progressreport/progressreport.js",
            "./components/collaborator/collaboratorService.js",
            "./components/collaborator/collaborator.js",
            "./components/membershipcard/membershipcard.js",
            "./components/user/user.js",
            "./components/group/groupService.js",
            "./components/group/group.js",
            "./components/home/home.js",
            "./components/nav-loginbar/navLoginbar.js",
            "./components/nav-toolbar/navToobarService.js",
            "./components/nav-toolbar/navToolbar.js",
            "./components/signin/signInService.js",
            "./components/signin/signin.js",
            "./components/sign-up/signUpService.js",
            "./components/sign-up/signUp.js",
            "./components/forgot/forgotService.js",
            "./components/forgot/forgot.js",
            "./components/create-group/createGroupService.js",
            "./components/create-group/createGroup.js",
            "./components/edit-group/editGroupService.js",
            "./components/edit-group/edit-group.js",
            "./components/create-sub-group/createSubGroupService.js",
            "./components/create-sub-group/createSubGroup.js",
            "./components/join-group/joinGroupService.js",
            "./components/join-group/joinGroup.js",
            "./components/personal-settings/personal-settingsService.js",
            "./components/personal-settings/personal-settings.js",
            "./components/policy/policyService.js",
            "./components/policy/policy.js",
            "./components/user-setting/userSettingService.js",
            "./components/user-setting/userSetting.js",
            "./components/quiz/questionBanksService.js",
            "./components/quiz/questionBanks.js",
            "./components/componentsCoreModule.js",
            "./services/activityStreamService.js",
            "./services/auth.service.js",
            "./services/chatService.js",
            "./services/user.service.js",
            "./services/dataService.js",
            "./services/util.service.js",
            "./services/message.service.js",
            "./services/confirmDialog.service.js",
            "./services/firebase.service.js",
            "./services/user.firebase.service.js",
            "./services/group.firebase.service.js",
            "./services/sound.service.js",
            "./services/userPresence.firebase.js",
            "./services/userHelper.firebase.js",
            "./services/subgroup.firebase.service.js",
            "./services/checkin.service.js",
            "./directives/groupcardDirective.js",
            "./directives/subgroupcardDirective.js",
            "./directives/checkUserID.directive.js",
            "./directives/compareTo.directive.js",
            "./directives/checkGroupExistance.directive.js",
            "./app.js",
            "./config/appRoutes.js"
        ])
        .pipe(concat('all.js'))
        //.pipe(uglify())
        .pipe(gulp.dest("./minifyVersion/"));
});



// gulp.task("minifying", function(){
//     gulp.src([  "./checkin/**/*.js",
//                 "./components/**/*.js",
//                 //"./config/**/*.js",
//                 "./coreModules/**/*.js",
//                 "./directives/**/*.js",
//                 "./services/**/*.js",
//                 "./app-dev.js", "./router.es5.js"
//                 ])
//     .pipe(concat('all.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest("./minifyVersion/"));
// });




gulp.task('webserver', function() {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            //directoryListing: true,
            directoryListing: {
                enable: true,
                path: '/index.html'
            },
            open: true,
            port: 7000,
            middleware: function(req, res, next) {
                var fileName = url.parse(req.url);
                fileName = fileName.href.split(fileName.search).join("");
                var fileExists = fs.existsSync("./" + fileName);
                if (!fileExists) {
                    req.url = "/index.html";
                }
                return next();
            }
        }));
});


gulp.task('default', ['webserver']);

gulp.task('run', function() {
    gulp.watch(["./**/*.js"], ['minifying']);
});

gulp.task('generate-service-worker', function(callback) {
  var path = require('path');
  var swPrecache = require('sw-precache');
  var rootDir = '../client';

  swPrecache.write(path.join(rootDir, 'sw-gulp.js'), {
    //staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg}'],
    staticFileGlobs: [rootDir + '/{components,config,coreModules,css,directives,img,minifyVersion,services,sounds}/**/*.{js,html,css,png,jpg,gif,svg}',
    rootDir + '/bower_components/angular-material/angular-material.js',
    rootDir + '/bower_components/angular-material-icons/angular-material-icons.js',
    rootDir + '/bower_components/angular-messages/angular-messages.js',
    rootDir + '/bower_components/angular-animate/angular-animate.js',
    rootDir + '/bower_components/angular-aria/angular-aria.js',
    rootDir + '/bower_components/angular-sanitize/angular-sanitize.js',
    rootDir + '/bower_components/angular-audio/app/angular.audio.js',
    rootDir + '/bower_components/firebase/firebase-debug.js',
    rootDir + '/bower_components/angularfire/dist/angularfire.min.js',
    rootDir + '/bower_components/ngstorage/ngStorage.min.js',
    rootDir + '/bower_components/ngGeolocation/ngGeolocation.min.js',
    rootDir + '/bower_components/mui/mui.js',
    rootDir + '/bower_components/angular-truncate-2/dist/angular-truncate-2.js',
    rootDir + '/bower_components/ng-mfb/src/mfb-directive.js',
    rootDir + '/bower_components/ng-mfb/mfb/dist/mfb.css',
    rootDir + '/bower_components/angular-img-cropper/dist/angular-img-cropper.min.js',
    rootDir + '/bower_components/angular-material-data-table/dist/md-data-table.css',
    rootDir + '/bower_components/angular-material-data-table/dist/md-data-table.js',
    rootDir + '/bower_components/leaflet/dist/leaflet.css',
    rootDir + '/bower_components/leaflet/dist/leaflet-src.js',
    rootDir + '/bower_components/ui-leaflet/dist/ui-leaflet.js',
    rootDir + '/bower_components/angular-simple-logger/dist/angular-simple-logger.js',
    rootDir + '/bower_components/angular-filter/dist/angular-filter.js',
    rootDir + '/bower_components/moment/moment.js',
    rootDir + '/bower_components/rxjs/dist/rx.all.js',
    rootDir + '/lib/collaborator/codemirror/lib/codemirror.css',
    rootDir + '/lib/collaborator/firepad/dist/firepad.css',
    rootDir + '/css/collaborator.css',
    rootDir + '/lib/collaborator/codemirror/lib/codemirror.js',
    rootDir + '/lib/collaborator/firepad/dist/firepad.js',
    rootDir + '/lib/collaborator/swift/swift.js',
    rootDir + '/lib/collaborator/clike/clike.js',
    rootDir + '/lib/collaborator/bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
    // staticFileGlobs: [rootDir + '/components/*.{js,html}',
    // rootDir + '/config/*.js',
    // rootDir + '/coreModules/*.js',
    // rootDir + '/css/*.css',
    // rootDir + '/directives/*.js',
    // rootDir + '/img/**/*.{svg,png,jpg,psd,gif,ico}',
    // rootDir + '/minifyVersion/*.js',
    // rootDir + '/services/*.js',
    // rootDir + '/sounds/*.mp3',
    // //rootDir + '/*.{js,html}',
    rootDir + '/app-dev.js',
    //rootDir + '/app.js',
    rootDir + '/index.html}',    
    ],
    stripPrefix: rootDir
  }, callback);
});

