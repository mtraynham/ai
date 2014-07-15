var gulp = require('gulp'),
    browserify = require('browserify'),
    bump = require('gulp-bump'),
    coffeeify = require('coffeeify'),
    coffeeLint = require('gulp-coffeelint'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify');

gulp.task('lint', function () {
    return gulp.src('src/*.coffee')
        .pipe(coffeeLint('.coffee-lint'))
        .pipe(coffeeLint.reporter())
        .pipe(coffeeLint.reporter('fail'));
});

gulp.task('build', function () {
    var bundler = browserify({
        entries: ['./src/index.coffee'],
        extensions: ['.coffee']
    })
    return bundler
        .transform(coffeeify)
        .bundle({debug: true})
        .pipe(source('ai.js'))
        .pipe(gulp.dest('./'))
        .pipe(streamify(uglify()))
        .pipe(rename('ai.min.js'))
        .pipe(gulp.dest('./'));
});

// Default Task
gulp.task('default', ['lint', 'build']);