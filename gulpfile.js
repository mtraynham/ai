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
        .pipe(coffeeLint('.coffeelint.json'))
        .pipe(coffeeLint.reporter())
        .pipe(coffeeLint.reporter('fail'));
});

gulp.task('build', function () {
    var bundler = browserify({
        basedir: __dirname,
        entries: ['./src/index.coffee'],
        extensions: ['.coffee'],
        debug: global.isProduction ? true : false,
        cache: {},
        packageCache: {},
        fullPaths: false
    }).transform(coffeeify);

    var bundle = function () {
        return bundler
            .bundle()
            .pipe(source('ml.js'))
            .pipe(gulp.dest('./'))
            .pipe(streamify(uglify()))
            .pipe(rename('ml.min.js'))
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

gulp.task('setProduction', function () {
    global.isProduction = true;
});

var bumpFn = function (type) {
    gulp.src(['./bower.json', './package.json'])
        .pipe(bump({type: type}))
        .pipe(gulp.dest('./'));
};

// Default Task
gulp.task('default', ['lint', 'build']);
gulp.task('watch', ['setProduction', 'setWatch', 'lint', 'build']);
gulp.task('release', ['setProduction', 'lint', 'build']);
gulp.task('bump:major', function () {
    bumpFn('major');
});
gulp.task('bump:minor', function () {
    bumpFn('minor');
});
gulp.task('bump:patch', function () {
    bumpFn('patch');
});