/**
 * Created by ZiaKhan on 08/01/15.
 */

var gulp = require('gulp');

var webserver = require('gulp-webserver');

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