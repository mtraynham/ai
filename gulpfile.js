var gulp = require('gulp'),
    browserify = require('browserify'),
    bump = require('gulp-bump'),
    coffeeify = require('coffeeify'),
    coffeeLint = require('gulp-coffeelint'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify');

gulp.task('lint', function () {
    return gulp.src('src/*.coffee')
        .pipe(coffeeLint('.coffee-lint'))
        .pipe(coffeeLint.reporter())
        .pipe(coffeeLint.reporter('fail'));
});

gulp.task('build', function () {
    var bundler = browserify({
        basedir: __dirname,
        entries: ['./src/index.coffee'],
        extensions: ['.coffee'],
        cache: {},
        packageCache: {},
        fullPaths: true
    }).transform(coffeeify);

    var bundle = function () {
        return bundler
            .bundle()
            .pipe(source('ai.js'))
            .pipe(gulp.dest('./'))
            .pipe(streamify(uglify()))
            .pipe(rename('ai.min.js'))
            .pipe(gulp.dest('./'));
    };
    if (global.isWatching) {
        bundler = watchify(bundler);
        bundler.on('update', bundle);
    }
    return bundle();
});

gulp.task('setWatch', function () {
    global.isWatching = true;
});

// Default Task
gulp.task('default', ['lint', 'build']);
gulp.task('watch', ['setWatch', 'lint', 'build']);