const gulp = require('gulp');

const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const fileinclude = require('gulp-file-include');
const webphtml = require('gulp-webp-html-nosvg');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const webpcss = require("gulp-webpcss");
const newer = require('gulp-newer');
const webpack = require('webpack-stream');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const fonter = require('gulp-fonter-fix');
const ttf2woff2 = require('gulp-ttf2woff2');
const htmlmin = require('gulp-htmlmin');


  gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
      .pipe(clean());
});

  gulp.task('sass', function () {
    return gulp.src('src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(webpcss({
      webpClass: ".webp",
      noWebpClass: ".no-webp"
    }))
    .pipe(autoprefixer({
      grid: true,
      overrideBrowserslist: ['last 3 versions'],
			cascade: false
		}))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
    .pipe(rename({
        suffix: ".min",
      }))
    .pipe(gulp.dest('dist/css'));
  });

  gulp.task('sass-no-sourcemaps', function () {
    return gulp.src('src/sass/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(webpcss({
      webpClass: ".webp",
      noWebpClass: ".no-webp"
    }))
    .pipe(autoprefixer({
      grid: true,
      overrideBrowserslist: ['last 3 versions'],
			cascade: false
		}))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({
        suffix: ".min",
      }))
    .pipe(gulp.dest('dist/css'));
  });

  gulp.task('sasstocss', function () {
    return gulp.src('src/sass/**/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(webpcss({
      webpClass: ".webp",
      noWebpClass: ".no-webp"
    }))
    .pipe(autoprefixer({
      grid: true,
      overrideBrowserslist: ['last 3 versions'],
			cascade: true
		}))
    .pipe(gulp.dest('dist/css'));
  });

  gulp.task('html', function () {
    return gulp.src('src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(webphtml())
    .pipe(gulp.dest('dist'));
  });

  gulp.task('minify-html', () => {
    return gulp.src('src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(webphtml())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('js', function () {
    return gulp.src('src/js/app.js')
    .pipe(webpack({
      mode: 'development',
      output: {
        filename: 'app.min.js',
      }
    }))
    .pipe(gulp.dest('dist/js'));
  });

  gulp.task('img', function () {
    return gulp.src('src/img/**/*.{jpg,jpeg,png,gif}')
    .pipe(newer('dist/img'))
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
  ]))
    .pipe(gulp.dest('dist/img'));
  });

  gulp.task('imgwebp', function () {
    return gulp.src('src/img/**/*.{jpg,jpeg,png,gif}')
    .pipe(newer('dist/img/**/*.webp'))
    .pipe(webp())
    .pipe(gulp.dest('dist/img'));
  });

  gulp.task('movewebp', function () {
    return gulp.src('src/img/**/*.webp')
    .pipe(newer('dist/img'))
    .pipe(gulp.dest('dist/img'));
  });

  gulp.task('svg', function () {
    return gulp.src('src/img/**/*.svg')
    .pipe(newer('dist/img'))
    .pipe(gulp.dest('dist/img'));
  });

  gulp.task('icons', function () {
    return gulp.src('src/icons/**/*.*')
    .pipe(newer('dist/icons'))
    .pipe(gulp.dest('dist/icons'));
  });

  gulp.task('otf-to-ttf', function () {
    return gulp.src('src/fonts/**/*.otf')
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(gulp.dest('src/fonts'));
  });

  gulp.task('ttf-to-woff', function () {
    return gulp.src('src/fonts/**/*.ttf')
    .pipe(fonter({
      formats: ['woff']
    }))
    .pipe(gulp.dest('src/fonts'));
  });

  gulp.task('ttf-to-woff2', function () {
    return gulp.src('src/fonts/**/*.ttf')
    .pipe(ttf2woff2())
    .pipe(gulp.dest('src/fonts'));
  })

  gulp.task('movefonts', function () {
    return gulp.src('src/fonts/**/*.{woff,woff2,ttf}')
    .pipe(gulp.dest('dist/fonts'))
  })

  gulp.task('watch', function () {
    // watching html
    gulp.watch('src/**/*.html', gulp.parallel('html'))
    // CONCAT? .scss files & minifying them & moving to dist/js
    gulp.watch('src/sass/**/*.(scss|sass|css)', gulp.parallel('sass', 'sasstocss'))
    // CONCAT? .js files & minifying them & moving to dist/js
    gulp.watch('src/js/**/*.js', gulp.parallel('js'))
    // watching usual images & converting to minified jpg and webp & moving them to dist/img
    gulp.watch('src/img/**/*.{jpg,jpeg,png,gif}', gulp.series('img', 'imgwebp'))
    // watching .webp files & moving them to dist/img
    gulp.watch('src/img/**/*.webp', gulp.parallel('movewebp'))
    // watching .svg files in /img & moving them to dist/img
    gulp.watch('src/img/**/*.svg', gulp.parallel('svg'))
    // watching all files in icons & moving them to dist/icons
    gulp.watch('src/icons/**/*.*', gulp.parallel('icons'))
  });

gulp.task('main', gulp.series('html', 'sass', 'sasstocss', 'js', 'img', 'imgwebp', 'movewebp', 'svg', 'icons', 'otf-to-ttf', 'ttf-to-woff', 'ttf-to-woff2', 'movefonts'));

gulp.task('dev', gulp.series('clean', 'main', 'watch'));

gulp.task('build', gulp.series('clean', 'minify-html', 'sass-no-sourcemaps', 'sasstocss', 'js', 'img', 'imgwebp', 'movewebp', 'svg', 'icons', 'otf-to-ttf', 'ttf-to-woff', 'ttf-to-woff2', 'movefonts'));

gulp.task('default', gulp.series('dev'));