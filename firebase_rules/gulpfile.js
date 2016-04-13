var gulp = require('gulp'),
    concat = require('gulp-concat'),
    fs = require('fs');

gulp.task("default", function() {
    gulp.src([
            "./rules.bolt",
            "./quizRules.bolt",
        ])
        .pipe(concat('securityrules.bolt'))
        //.pipe(uglify())
        .pipe(gulp.dest("./"));
});
