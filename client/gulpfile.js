/**
 * Created by ZiaKhan on 08/01/15.
 */

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    // minify = require('gulp-minify');
    uglify = require('gulp-uglify');

var webserver = require('gulp-webserver');

gulp.task("minifying", function() {
    gulp.src([ //"./directives/angular-leaflet-directive.min.js", 
            //"./coreModules/core.module.js", 
            //"./coreModules/firebase-as-array.js",
            "./components/user/userService.js",
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
            "./components/subgroup/subgroupService.js",
            "./components/subgroup/subgroup.js",
            "./components/create-sub-group/createSubGroupService.js",
            "./components/create-sub-group/createSubGroup.js",
            "./components/join-group/joinGroupService.js",
            "./components/join-group/joinGroup.js",
            "./components/personal-settings/personal-settingsService.js",
            "./components/personal-settings/personal-settings.js",
            "./components/user-setting/userSettingService.js",
            "./components/user-setting/userSetting.js",
            "./components/geo-fencing/geo-fencing.js",
            "./components/create-channels/createChannelsService.js",
            "./components/create-channels/createChannels.js",
            "./components/create-teams-channels/createTeamsChannelsService.js",
            "./components/create-teams-channels/createTeamsChannels.js",
            "./components/quiz/quizService.js",
            "./components/quiz/quiz.js",
            // "./components/quiz-add-book/quizAddBookService.js",
            // "./components/quiz-add-book/quizAddBook.js",
            // "./components/quiz-add-chapter/quizAddChapterService.js",
            // "./components/quiz-add-chapter/quizAddChapter.js",
            // "./components/quiz-add-topic/quizAddTopicService.js",
            // "./components/quiz-add-topic/quizAddTopic.js",
            // "./components/quiz-add-question/quizAddQuestionService.js",
            // "./components/quiz-add-question/quizAddQuestion.js",
            // "./components/quiz-create/quizCreateService.js",
            // "./components/quiz-create/quizCreate.js",
            // "./components/quiz-attempt/quizAttemptService.js",
            // "./components/quiz-attempt/quizAttempt.js",
            // "./components/quiz-attempting/quizAttemptingService.js",
            // "./components/quiz-attempting/quizAttempting.js",
            // "./components/quiz-assign/quizAssignService.js",
            // "./components/quiz-assign/quizAssign.js",
            // "./components/quiz-result/quizResultService.js",
            // "./components/quiz-result/quizResult.js",
            "./components/geo-fencing/geo-fencing.js",
            "./components/componentsCoreModule.js",
            "./services/auth.service.js",
            "./services/chatService.js",
            "./services/user.service.js",
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
            "./services/dataService.js",
            "./directives/checkUserID.directive.js",
            "./directives/activitiesList.directive.js",
            "./directives/getGavatar.directive.js",
            "./directives/compareTo.directive.js",
            "./directives/checkUserID.directive.js",
            "./directives/checkGroupExistance.directive.js",
            "./directives/cropper.directive.js",
            "./directives/groupcardDirective.js",
            "./checkin/libs/leaflet-map/leaflet-src.js",
            "./checkin/libs/GoogleLayer.js",
            "./checkin/checkin.module.js",
            "./checkin/services/checkin.service.js",
            "./checkin/filters/checkin.array.filter.js",
            "./checkin/filters/checkin.getLocationNameByID.filter.js",
            "./checkin/controllers/defineLocation.controller.js",
            "./checkin/controllers/home.checkin.app.controller.js",
            "./checkin/controllers/home.checkin.app.BySubgroup.controller.js",
            "./checkin/controllers/user.checkin.controller.js",
            "./checkin/controllers/charts.checkin.controller.js",
            "./app.js",
            // "./config/appRoutes.js",
            // "./config/ngMaterialConfig.js"
        ])
        .pipe(concat('all.js'))
        //.pipe(minify())
        .pipe(uglify())
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
            port: 7000
        }));
});


gulp.task('default', ['webserver']);

gulp.task('run', function() {
    gulp.watch(["./**/*.js"], ['minifying']);
});
