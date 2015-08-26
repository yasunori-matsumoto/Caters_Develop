/* ===================================================================   <
 *	gulp_settings by Yasu MatsuMoto
 * 	require gulp -g, typescript -g, stylus -g
 ===================================================================   */
var IS_MIN      = true;
var IS_HARDCASE = true;
var _isPC       = true;

var _src  = _isPC ? 'src/pc/' : 'src/sp/';
var _dest = _isPC ? '_git/public_html/' : '_git/public_html/sp/';
var dir = {
  src  : _src,
  dest : _dest
};

//- ===================================================================  importorts <
var gulp           = require('gulp');
var mainBowerFiles = require('main-bower-files');

var path           = require('path');
var plumber        = require('gulp-plumber');
var concat         = require('gulp-concat');
var changed        = require('gulp-changed');
var gulpif         = require('gulp-if');
var rename         = require('gulp-rename');
var replace        = require('gulp-replace');
var browserSync    = require('browser-sync');
var connectSSI     = require('connect-ssi');

//- . . . . . . . . . . . . . . . . . . js <
var typescript     = require('gulp-typescript');
var uglify         = require('gulp-uglify');

//- . . . . . . . . . . . . . . . . . . css <
var stylus         = require('gulp-stylus');
var nib            = require('nib');
var pleeease       = require('gulp-pleeease');
var cssmin         = require('gulp-minify-css');

//- . . . . . . . . . . . . . . . . . . html <
var jade           = require('gulp-jade');

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
  gulp.src([dir.src + '**/*.+(css|js|def|xml|mp4|json|zip|inc)', '!' + dir.src + '**/tsconfig*'])
    .pipe(changed( dir.dest ))
    .pipe(gulp.dest(dir.dest));
});

//- ===================================================================  stylesheets <
gulp.task('stylesheets', function(){
  var prefixer = ['last 4 versions','ie 8', 'ie 9', 'Firefox >= 2', 'Opera 12.1', 'ios 6', 'android 4'];
  if (!_isPC) prefixer =  ['last 2 versions', 'ios 6', 'android 4'];
  
  gulp.src([dir.src + '**/*.+(scss|styl|less|)', '!' + dir.src + '**/_*'])
  .pipe(changed( dir.dest ))
  //- ----------------------------------------------------------- styls <
  .pipe(gulpif(/[.]styl$/, stylus({
        use: nib(),
        linenos: false, //-  line_comments
        compress: true
      })
    )
  )
  //- -----------------------------------------------------------  utils <
  .pipe(plumber())
  .pipe(
    pleeease({
      autoprefixer : {
        browsers : prefixer
      },
      minifier: IS_MIN
    })
  )
  .pipe(gulpif(!IS_MIN, replace(/\n\n/g, '\n')))
  .pipe(gulpif(IS_HARDCASE, replace(/    /g, '\t')))
  .pipe(gulpif(IS_MIN, cssmin({compatibility: 'ie8', keepBreaks:true, rebase:false})))
  .pipe(rename({suffix:'.min'}))
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
  gulp.src([dir.src + '**/*.jade' , '!' + dir.src + '**/_*/*'])
    .pipe(changed( dir.dest ))
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulpif(IS_HARDCASE, replace(/  /g, '\t')))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//- ----------------------------------------------------------- image optimize <
gulp.task('optimizeImage', function(){
  var srcGlob = dir.src + '**/*.+(jpg|jpeg|png|gif|svg)';
  var _quality = '80-90';
  var imageminOptions = {
    optimizationLevel: 3, //-  low< 1-7 >high
    use: [pngquant({
      quality: _quality, //-  0 (worst) to 100 (perfect) :String
      speed: 1
    })]
  };
  gulp.src( [dir.src + '**/*.+(jpg|jpeg|png|gif|svg)',  '!' + dir.src + '**/_*/*'])
    .pipe(changed( dir.dest ))
    .pipe(imagemin(imageminOptions))
    .pipe(gulp.dest( dir.dest ));
});
//- ----------------------------------------------------------- css sprite <

var SPRITE_MODE = {
  ASSETS  : 0
};


gulp.task('makeSprite',  function () {
  var _source, _imgOutput, _scssOutput, _prefix, _mode;
  _scssOutput = dir.src + 'assets/css/sprites/';
  _imgOutput  = dir.src + 'assets/img/sprites/';

  //- . . . . . . . . . . . . . . .  . . . config Mode <
  _mode = SPRITE_MODE.ASSETS;
  
  //- . . . . . . . . . . . . . . .  . . . config Mode <
  switch (_mode) {
    case SPRITE_MODE.ASSETS :
      _prefix     = 'assets';
      _source     = dir.src + 'assets/img/_src/';
    break;
  }
  
  console.log('===================================================================');
  console.log('sprite_mode : ' + _prefix);
  console.log('sprite_direc : ' + _source);
  console.log('_imgOutput : ' + _imgOutput);
  console.log('. . . . . . . . . . . . . . .  . . .');

  var spriteData = gulp.src(_source + '*.png')
  .pipe(spritesmith({
    imgName  : 'sprite_' + _prefix + '.png',
    cssName  : '_' + _prefix + '.styl',
    imgPath  : '../img/sprites/sprite_' + _prefix + '.png',
    cssFormat: 'stylus',
    padding  : 20,
    cssVarMap: function (sprite) {
      sprite.name = _prefix + '_' + sprite.name;
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
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest(dir.dest))
    .pipe(browserSync.reload({stream: true}));
});

//- ----------------------------------------------------------- watch <
gulp.task('watch', ['copyStaticFiles'], function () {
    browserSync({
      server: {
        baseDir: dir.dest,
        middleware : [
          connectSSI({
            baseDir: dir.dest,
            ext:'.html'
          })
        ]
      }
    });
    gulp.watch(dir.src + '**/*.jade', ['jade']);
    gulp.watch(dir.src + '**/*.styl', ['stylesheets']);
    gulp.watch(dir.src + '**/*.ts', ['typescript']);
});
;