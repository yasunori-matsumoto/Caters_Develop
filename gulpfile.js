var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var dir = {
  src : 'src/',
  dest : 'release/'
}

gulp.task('hoge', function() {
    console.log('HelloWorld!');
});

gulp.task('clear-libs', function() {
    del.sync(dir.dest + 'lib/');
});

gulp.task('bower', ['clear-libs'], function() {
  gulp.src(mainBowerFiles())
  .pipe(concat('libs.js'))
  .pipe(uglify())
  .pipe(gulp.dest(dir.dest + 'lib/js'))
});
