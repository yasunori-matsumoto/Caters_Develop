var IS_MIN = false;

var dir = {
  src  : 'src/',
  dest : 'release/'
};

// ##########################################################
//core
var gulp           = require('gulp');
var mainBowerFiles = require('main-bower-files');
var del            = require('del');
var plumber        = require('gulp-watch');
var plumber        = require('gulp-plumber');
var concat         = require('gulp-concat');

//js
var typescript     = require('gulp-typescript');
var uglify         = require('gulp-uglify');

//css
var sass           = require('gulp-sass');
var pleeease       = require('gulp-pleeease');

//html
var jade           = require('gulp-jade');


//  Bower Settings  ----------------------------------
gulp.task('clear-libs', function() {
    del.sync(dir.dest + 'lib/');
});

gulp.task('bower', ['clear-libs'], function() {
  gulp.src(mainBowerFiles())
  .pipe(concat('libs.js'))
  .pipe(uglify())
  .pipe(gulp.dest(dir.dest + 'common/js'));
});

//  sass  ----------------------------------
gulp.task('sass', function(){
  gulp.src(dir.src + '**/*.scss')
  .pipe(plumber)
  .pipe(sass())
  .pipe(pleeease({
    fallbacks: {
        autoprefixer: ['last 4 versions']
    },
    optimizers: {
        minifier: IS_MIN
    }
  }))
  .pipe(gulp.dest(dir.dest));
});

//  jade  ----------------------------------
gulp.task('jade', function () {
  gulp.src(dir.src + '**/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(dir.dest));
});

//  js  ----------------------------------
var typescriptProject = typescript.createProject({
  target         : "ES5",
  removeComments : true,
  sortOutput     : true
});

gulp.task('typescript', function(){
  gulp.src([dir.src + '**/*.ts'])
    .pipe(typescript(typescriptProject))
    .js
    .pipe(gulp.dest(dir.dest));
});

//  watch  ----------------------------------
gulp.task('watch', function () {
    gulp.watch(dir.src + '**/*.scss', ['sass']);
    gulp.watch(dir.src + '**/*.jade', ['jade']);
    gulp.watch(dir.src + '**/*.ts', ['typescript']);
});
