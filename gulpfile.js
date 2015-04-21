'use strict';

// Dependencies
var path         = require('path');
var gulp         = require('gulp');
var stylus       = require('gulp-stylus');
var gutil        = require('gulp-util');
var browserify   = require('browserify');
var watchify     = require('watchify');
var source       = require('vinyl-source-stream');
var buffer       = require('vinyl-buffer');
var autoprefixer = require('gulp-autoprefixer');
var csso         = require('gulp-csso');

var setup = {
  js: {
    src: './src/js/app.js',
    dest: './src/app.js'
  },
  css: {
    src: './src/stylus/app.styl',
    dest: './dest/app.css'
  }
};

/**
 * Default task for frontend developers.
 */
gulp.task('default', ['watchify', 'js', 'css', 'css:watch']);

/**
 * Task to build frontend for production
 */
gulp.task('build', ['js', 'css', 'images', 'manifest']);

/**
 * What to use: watchify or just browserify?
 * @type {bool}
 */
var watch = false;

/**
 * Enable watchify. Should be placed before `js` task.
 */
gulp.task('watchify', function() { watch = true; });

/**
 * Compile js and observe it for changes (if `watch === true`)
 * @return {Stream}
 */
gulp.task('js', function(done) {
  var bundler = browserify({ debug: true, cache: {}, packagecache: {}, fullpaths: true });
  if (watch) bundler = watchify(bundler);
  bundler
    .on('update', bundle)
    .on('log', gutil.log)
    .add(setup.js.src)
  ;
  function bundle() {
    return bundler.bundle()
      .on('error', gutil.log.bind(gutil, 'browserify error'))
      .pipe(source(path.basename(setup.js.dest)))
      .pipe(buffer())
      .pipe(gulp.dest(path.dirname(setup.js.dest)))
    ;
  }
  return bundle();
});

/**
 * Compile stylus to css with some goodies like autoprefixer and csso.
 * @return {Stream}
 */
gulp.task('css', function() {
  return gulp.src(setup.css.src)
    .pipe(stylus({ 'url': 'embedurl' }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9', 'Opera >= 12']
    }))
    .pipe(csso())
    .pipe(gulp.dest(setup.css.dest));
});

/**
 * Observe for css updates
 * @return {undefined}
 */
gulp.task('css:watch', function() {
  gulp.watch(path.dirname(setup.css.src) + '**/*.styl', ['css']);
});
