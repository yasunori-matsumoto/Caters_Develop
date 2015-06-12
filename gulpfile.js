var IS_MIN = true;
var IS_HARDCASE = true;

var dir = {
  src  : 'src/pc/',
  dest : 'release/pc/'
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
var browserSync    = require('browser-sync');

//js
var typescript = require('gulp-typescript');
var uglify     = require('gulp-uglify');
var react      = require('gulp-react');

//css
var sass           = require('gulp-sass');
var less           = require('gulp-less');
var pleeease       = require('gulp-pleeease');

//html
var jade           = require('gulp-jade');
var data           = require('gulp-data');

//image
var imagemin       = require('gulp-imagemin');
var pngquant       = require('imagemin-pngquant');
var spritesmith    = require('gulp.spritesmith');

gulp.task('bower', function() {
  gulp.src(mainBowerFiles({debugging:true, checkExistence:true}))
  .pipe(concat('libs.js'))
  .pipe(uglify())
  .pipe(gulp.dest(dir.src + 'common/js'));
});

//  copy_defaut  ----------------------------------
gulp.task('copy-static', function() {
  gulp.src([dir.src + '**/*.css', dir.src + '**/*.inc', dir.src + '**/*.js', dir.src + '**/*.def', dir.src + '**/*.xml', dir.src + '**/*.mp4'])
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
      autoprefixer : {
        browsers : ['last 4 versions','ie 8', 'ie 9', 'Firefox >= 2', 'Opera 12.1', 'ios 6', 'android 4']
      },
      minifier: IS_MIN
    }))
    .pipe(gulpif(IS_HARDCASE, replace(/  /g, '\t')))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//  sass  ----------------------------------
gulp.task('sass', function(){
  gulp.src([dir.src + '**/*.scss'])
  .pipe(changed( dir.dest ))
  .pipe(plumber())
  .pipe(sass({
    // outputStyle:'nested'
    // outputStyle:'expanded'
    outputStyle:'compact'
    // outputStyle:'compressed'
  }))
  .pipe(pleeease({
    autoprefixer : {
      browsers : ['last 4 versions','ie 8', 'ie 9', 'Firefox >= 2', 'Opera 12.1', 'ios 6', 'android 4']
    },
    minifier: IS_MIN
  }))
  .pipe(gulpif(!IS_MIN, replace(/\n\n/g, '\n')))
  .pipe(gulpif(IS_HARDCASE, replace(/  /g, '\t')))
  .pipe(replace(/\n/g, '\r\n'))
  .pipe(gulp.dest(dir.dest))
  .pipe(browserSync.reload({stream: true}));
});

//  jade  ----------------------------------
gulp.task('jade', function () {
  gulp.src([dir.src + '**/*.jade' , '!' + dir.src + '**/_includes/*'])
    .pipe(changed( dir.dest ))
    .pipe(plumber())
    .pipe(jade({
      pretty: true,
      locals : {}
    }))
    .pipe(gulpif(IS_HARDCASE, replace(/  /g, '\t')))
    .pipe(replace(/\n/g, '\r\n'))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//image ----------------------------------
gulp.task( 'imagemin', function(){
  var srcGlob = dir.src + '/**/*.+(jpg|jpeg|png|gif|svg)';
  var imageminOptions = {
    optimizationLevel: 1,
    use: [pngquant({
      quality: 100,
      speed: 1
    })]
  };

  gulp.src( dir.src + '/**/*.+(jpg|jpeg|png|gif|svg)' )
    .pipe(changed( dir.dest ))
    .pipe(imagemin(imageminOptions))
    .pipe(gulp.dest( dir.dest ));
});


gulp.task('sprite', function () {
  var _source = dir.src + '/twc/info/super/img/utils/';
  var _imgOutput = dir.src + '/twc/info/super/img/sprites/';
  var _scssOutput = dir.src + '/twc/info/super/css/';

  var spriteData = gulp.src(_source + '*.png') //スプライトにする愉快な画像達
  .pipe(spritesmith({
    imgName: 'sprite.png', //スプライトの画像
    cssName: '_sprite.scss', //生成されるscss
    imgPath: '../img/sprites/sprite.png', //生成されるscssに記載されるパス
    cssFormat: 'scss', //フォーマット
    padding : 10,
    cssVarMap: function (sprite) {
      sprite.name = sprite.name; //VarMap(生成されるScssにいろいろな変数の一覧を生成)
    },
    cssOpts: {
      functions: false
    }
  }));
  spriteData.img.pipe(gulp.dest(_imgOutput)); //imgNameで指定したスプライト画像の保存先
  spriteData.css.pipe(gulp.dest(_scssOutput)); //cssNameで指定したcssの保存先
});

//  js  ----------------------------------
var typescriptProject = typescript.createProject({
  target         : "ES5",
  removeComments : true,
  sortOutput     : true,
  noImplicitAny  : false,
  noEmitOnError  : false,
  module         :"commonjs",
  typescript: require('typescript')
});

gulp.task('typescript', function(){
  gulp.src([dir.src + '**/*.ts'])
    .pipe(plumber())
    .pipe(changed( dir.dest ))
    .pipe(typescript(typescriptProject))
    .js
    .pipe(gulpif(IS_MIN, uglify()))
    .pipe(gulpif(IS_HARDCASE, replace(/  /g, '\t')))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

//  JSX -----------------------------------------------------------  <
gulp.task('jsx', function () {
  gulp.src([dir.src + '**/*.jsx'])
    .pipe(plumber())
    .pipe(react())
    .pipe(gulpif(IS_MIN, uglify()))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});


//  watch  ----------------------------------
gulp.task('watch', function () {
    browserSync({
      server: {
        baseDir: dir.dest
      }
    });
    gulp.watch(dir.src + '**/*.scss', ['sass']);
    gulp.watch(dir.src + '**/*.less', ['less']);
    gulp.watch(dir.src + '**/*.jade', ['jade']);
    gulp.watch(dir.src + '**/*.jsx', ['jsx']);
    gulp.watch(dir.src + '**/*.ts', ['typescript']);
});