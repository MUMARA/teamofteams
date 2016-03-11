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
            "./components/quiz/quizService.js",
            "./components/quiz/quiz.js",
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
