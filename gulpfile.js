var IS_MIN = false;
var JS_MIN = true;
var IS_LOCAL = true;

var dir = {
  src  : 'src/',
  dest : 'release/'
};

// ##########################################################
//core
var gulp           = require('gulp');
var mainBowerFiles = require('main-bower-files');
var del            = require('del');
var path           = require('path');
var plumber        = require('gulp-plumber');
var concat         = require('gulp-concat');
var changed        = require('gulp-changed');
var gulpif         = require('gulp-if');
var useref         = require('gulp-useref');
var rename         = require('gulp-rename');
var replace        = require('gulp-replace');
var connect = require('gulp-connect');

//js
var typescript     = require('gulp-typescript');
var uglify         = require('gulp-uglify');

//css
var sass           = require('gulp-sass');
var less           = require('gulp-less');
var pleeease       = require('gulp-pleeease');

//html
var jade           = require('gulp-jade');
var htmlmin        = require('gulp-minify-html');

//image
var imagemin       = require('gulp-imagemin');
var pngquant       = require('imagemin-pngquant');


//  Bower Settings  ----------------------------------
gulp.task('clear-libs', function() {
    del.sync(dir.dest + 'lib/');
});

gulp.task('bower', function() {
  gulp.src(mainBowerFiles({debugging:true, checkExistence:true}))
  .pipe(concat('libs.js'))
  .pipe(uglify())
  .pipe(gulp.dest(dir.src + 'common/js'));
});

//  copy_defaut  ----------------------------------
gulp.task('copy-static', function() {
  gulp.src([dir.src + '**/*.css', dir.src + '**/*.inc', dir.src + '**/*.js', dir.src + '**/*.def', dir.src + '**/*.xml', dir.src + '**/*.mp4'])
    .pipe(changed( dir.dest ))
    .pipe(gulp.dest(dir.dest));
});

gulp.task('less', function() {
  gulp.src([dir.src + '**/*.less'])
    .pipe(changed( dir.dest ))
    .pipe(plumber())
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(pleeease({
      autoprefixer: {
          autoprefixer: ['last 4 versions']
      },
      minifier: IS_MIN
    }))
    .pipe(gulpif(!IS_MIN, replace(/  /g, '\t')))
    .pipe(gulp.dest(dir.dest));
});

//  sass  ----------------------------------
gulp.task('sass', function(){
  gulp.src([dir.src + '**/*.scss'])
  .pipe(changed( dir.dest ))
  .pipe(plumber())
  .pipe(sass({
    outputStyle:'nested'
  }))
  .pipe(pleeease({
    autoprefixer: {
        autoprefixer: ['last 4 versions']
    },
    minifier: IS_MIN
  }))
  .pipe(gulpif(!IS_MIN, replace(/  /g, '\t')))
  .pipe(gulp.dest(dir.dest))
  .pipe(gulpif(IS_LOCAL, connect.reload()));
});

//  jade  ----------------------------------
gulp.task('jade', function () {
  gulp.src([dir.src + '**/*.jade' , '!' + dir.src + '**/_includes/*'])
    .pipe(changed( dir.dest ))
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(replace(/  /g, '\t'))
    .pipe(gulp.dest(dir.dest))
    .pipe(gulpif(IS_LOCAL, connect.reload()));
});

//image ----------------------------------
gulp.task( 'imagemin', function(){
  var srcGlob = dir.src + '/**/*.+(jpg|jpeg|png|gif|svg)';
  var imageminOptions = {
    optimizationLevel: 3,
    use: [pngquant({
      quality: 60-75,
      speed: 1
    })]
  };

  gulp.src( dir.src + '/**/*.+(jpg|jpeg|png|gif|svg)' )
    .pipe(changed( dir.dest ))
    .pipe(imagemin())
    .pipe(gulp.dest( dir.dest ));
});

//  js  ----------------------------------
var typescriptProject = typescript.createProject({
  target         : "ES5",
  removeComments : true,
  sortOutput     : true,
  noImplicitAny  : false,
  noEmitOnError  : false,
  module         :"commonjs"
});

gulp.task('typescript', function(){
  gulp.src([dir.src + '**/*.ts'])
    .pipe(changed( dir.dest ))
    .pipe(typescript(typescriptProject))
    .js
    .pipe(gulpif(JS_MIN, uglify()))
    .pipe(gulpif(!JS_MIN, replace(/    /g, '\t')))
    .pipe(gulp.dest(dir.dest));
});

//- ----------------------------------------------------------- <
gulp.task('connectDev',function(){
  connect.server({
    root: [dir.dest],   //ルートディレクトリ
    port: 8000,     //ポート番号
    livereload: true
  });
});


// publishJS
/*
gulp.task('publishJS', function() {
  return gulp.src(dir.dest + '/d-navi/js/dn_*.js')
  .pipe(concat('dn.min.js'))
  .pipe(gulp.dest(dir.dest + '/d-navi/js'));
});
*/

//  watch  ----------------------------------
gulp.task('watch', function () {
    gulp.watch(dir.src + '**/*.scss', ['sass']);
    gulp.watch(dir.src + '**/*.less', ['less']);
    gulp.watch(dir.src + '**/*.jade', ['jade']);
    gulp.watch(dir.src + '**/*.ts', ['typescript']);
});

gulp.task('default',['watch','connectDev']);
