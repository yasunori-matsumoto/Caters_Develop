/* ===================================================================   <
 *	gulp_settings by Yasu MatsuMoto
 * 	require gulp -g, typescript -g, stylus -g
 ===================================================================   */
var IS_MIN      = true;
var IS_HARDCASE = false;

var dir = {
  src  : 'src/',
  dest : 'build/special/styling/',
  //-  src  : 'src/sp/',
  //-  dest : 'build/special/styling/sp/',
  root : 'build/'
};

//- ===================================================================  importorts <
var gulp           = require('gulp');
var mainBowerFiles = require('main-bower-files');
var del            = require('del');
var path           = require('path');
var plumber        = require('gulp-plumber');
var concat         = require('gulp-concat');
var changed        = require('gulp-changed');
var gulpif         = require('gulp-if');
var rename         = require('gulp-rename');
var replace        = require('gulp-replace');
var browserSync    = require('browser-sync');

//- . . . . . . . . . . . . . . . . . . js <
var typescript     = require('gulp-typescript');
var coffee         = require('gulp-coffee');
var react          = require('gulp-react');
var uglify         = require('gulp-uglify');

//- . . . . . . . . . . . . . . . . . . css <
var less           = require('gulp-less');
var sass           = require('gulp-sass');
var stylus         = require('gulp-stylus');
var nib            = require('nib');

var csscomb        = require('gulp-csscomb');
var shorthand      = require('gulp-shorthand');
var pleeease       = require('gulp-pleeease');
var cssmin         = require('gulp-minify-css');

//- . . . . . . . . . . . . . . . . . . html <
var jade           = require('gulp-jade');
var htmlmin        = require('gulp-htmlmin');

//- . . . . . . . . . . . . . . . . . . image <
var imagemin       = require('gulp-imagemin');
var spritesmith    = require('gulp.spritesmith');
var pngquant       = require('imagemin-pngquant');


//- ----------------------------------------------------------- makeLibs <
gulp.task('bower', function() {
  gulp.src(mainBowerFiles({debugging : true, checkExistence : true}))
  .pipe(concat('libs.js'))
  .pipe(gulp.dest(dir.src + 'assets/js'));
});

//- ----------------------------------------------------------- copy static files <
gulp.task('copyStaticFiles', function() {
  gulp.src( dir.src + '**/*.+(css|js|def|xml|mp4|json|zip|inc)')
    .pipe(changed( dir.dest ))
    .pipe(gulp.dest(dir.dest));
});

//- ===================================================================  stylesheets <
gulp.task('stylesheets', function(){
  gulp.src( dir.src + '**/*.+(scss|styl|less|)')
  .pipe(changed( dir.dest ))
  .pipe(plumber())
  //- ----------------------------------------------------------- sass <
  .pipe(gulpif(/[.]scss$/, sass({
        outputStyle:'compact' //-  nested, expanded, compact, compressed
      })
    )
  )
  //- ----------------------------------------------------------- less <
  .pipe(gulpif(/[.]less$/, less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
      })
    )
  )
  //- ----------------------------------------------------------- styls <
  .pipe(gulpif(/[.]styl$/, stylus({
        use: nib(),
        linenos: false, //-  line_comments
        compress: true
      })
    )
  )
  //- -----------------------------------------------------------  utils <
  .pipe(pleeease({
    autoprefixer : {
      browsers : ['last 4 versions','ie 8', 'ie 9', 'Firefox >= 2', 'Opera 12.1', 'ios 6', 'android 4']
    },
    minifier: IS_MIN
  }))
  .pipe(gulpif(IS_MIN, shorthand()))
  .pipe(csscomb())
  .pipe(gulpif(!IS_MIN, replace(/\n\n/g, '\n')))
  .pipe(gulpif(IS_HARDCASE, replace(/    /g, '\t')))
  .pipe(gulpif(IS_MIN, cssmin({compatibility: 'ie8', keepBreaks:true})))
  .pipe(gulpif(IS_MIN, rename({suffix:'.min'})))
  .pipe(gulp.dest(dir.dest))
  .pipe(browserSync.reload({stream: true}));
});


//- ----------------------------------------------------------- jade <
var _htmlOption = {
  removeComments                : true,
  collapseWhitespace            : false,
  removeEmptyAttributes         : true,
  removeScriptTypeAttributes    : true, //- text/javascript
  removeStyleLinkTypeAttributes : true //- stylesheet
};

gulp.task('jade', function () {
  gulp.src([dir.src + '**/*.jade' , '!' + dir.src + '**/_templates/*'])
    .pipe(changed( dir.dest ))
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulpif(IS_MIN, htmlmin(_htmlOption)))
    .pipe(gulpif(IS_HARDCASE, replace(/    /g, '\t')))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//- ----------------------------------------------------------- image optimize <
gulp.task('optimizeImage', function(){
  var srcGlob = dir.src + '**/*.+(jpg|jpeg|png|gif|svg)';
  var imageminOptions = {
    optimizationLevel: 1,
    use: [pngquant({
      quality: 90-100,
      speed: 1
    })]
  };

  gulp.src( dir.src + '**/*.+(jpg|jpeg|png|gif|svg)' )
    .pipe(changed( dir.dest ))
    .pipe(imagemin(imageminOptions))
    .pipe(gulp.dest( dir.dest ));
});

//- ----------------------------------------------------------- css sprite <
gulp.task('makeSprite', function () {
  var _source     = dir.src + 'img/';
  var _imgOutput  = dir.src + 'img/spr/';
  var _scssOutput = dir.src + 'css/';

  var spriteData = gulp.src(_source + '*.png')
  .pipe(spritesmith({
    imgName  : 'spr.png',
    cssName  : '_sprite.styl',
    imgPath  : '../img/spr/spr.png',
    cssFormat: 'stylus',  //-  scss, stylus
    padding  : 10,
    cssVarMap: function (sprite) {
      sprite.name = sprite.name;
    },
    cssOpts: {
      functions: false
    }
  }));
  spriteData.img.pipe(gulp.dest(_imgOutput));
  spriteData.css.pipe(gulp.dest(_scssOutput));
});

//- ----------------------------------------------------------- typescript <
var typescriptProject = typescript.createProject({
  target         : 'ES5',
  removeComments : true,
  sortOutput     : true,
  noImplicitAny  : false,
  noEmitOnError  : false,
  module         : 'commonjs',
  typescript     : require('typescript')
});

gulp.task('typescript', function(){
  gulp.src([dir.src + '**/*.ts'])
    .pipe(changed( dir.dest ))
    .pipe(plumber())
    .pipe(typescript(typescriptProject))
    .js
    .pipe(gulpif(IS_MIN, uglify()))
    .pipe(gulpif(IS_MIN, rename({suffix:'.min'})))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//- ----------------------------------------------------------- coffieScript <
gulp.task('coffeeScript', function(){
  gulp.src([dir.src + '**/*.coffee'])
  .pipe(changed( dir.dest ))
  .pipe(plumber())
  .pipe(coffee())
  .pipe(gulpif(IS_MIN, uglify()))
  .pipe(gulpif(!IS_MIN, replace(/\n\n/g, '\n')))
  .pipe(gulpif(IS_MIN, rename({suffix:'.min'})))
  .pipe(gulp.dest(dir.dest))
  .pipe(browserSync.reload({stream: true}));
});

//- ----------------------------------------------------------- jsx <
gulp.task('jsx', function () {
  gulp.src([dir.src + '**/*.jsx'])
    .pipe(react())
    .pipe(gulpif(IS_MIN, uglify()))
    .pipe(gulpif(IS_MIN, rename({suffix:'.min'})))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//- ----------------------------------------------------------- js(raw) <
gulp.task('js-raw', function () {
  gulp.src([dir.src + '**/*.js'])
    .pipe(gulpif(IS_MIN, uglify()))
    .pipe(gulpif(IS_MIN, rename({suffix:'.min'})))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//- ----------------------------------------------------------- watch <
gulp.task('watch', ['copyStaticFiles'], function () {
    browserSync({
      server: {
        baseDir: dir.root
      },
      startPath : dir.dest
    });
    gulp.watch(dir.src + '**/*.jade', ['jade']);
    gulp.watch(dir.src + '**/*.less', ['stylesheets']);
    gulp.watch(dir.src + '**/*.scss', ['stylesheets']);
    gulp.watch(dir.src + '**/*.styl', ['stylesheets']);
    gulp.watch(dir.src + '**/*.ts', ['typescript']);
    gulp.watch(dir.src + '**/*.coffee', ['coffee']);
    gulp.watch(dir.src + '**/*.jsx', ['jsx']);
});