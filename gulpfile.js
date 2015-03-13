'use strict';

/* jshint node: true */

var gulp = require('gulp');
var changed = require('gulp-changed');
var rimraf = require('gulp-rimraf');
var minifyJS = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var zip = require('gulp-zip');
var merge = require('merge-stream');

var ignores = [
  '!apps/**/test/**',
  '!apps/**/build/**'];
var appList = [
  'bluetooth',
  'camera',
  'clock'
];

gulp.task('clean', function() {
  return gulp.src('profile', { read: false })
    .pipe(rimraf('profile'));
});

function buildApps(app) {
  var dest = 'profile/' + app;
  var script = gulp.src(['apps/' + app + '/**/*.js'].concat(ignores))
    .pipe(changed(dest, { extension: '.js' }))
    .pipe(minifyJS());

  var style = gulp.src(['apps/' + app + '/**/*.css'].concat(ignores))
    .pipe(changed(dest, { extension: '.css' }))
    .pipe(minifyCSS({ processImport: false }));

  var template = gulp.src(['apps/' + app + '/**/*.html'].concat(ignores))
    .pipe(changed(dest))
    .pipe(minifyHTML());

  var manifest = gulp.src('apps/' + app + '/manifest.webapp')
    .pipe(changed(dest));

  var shared = gulp.src('shared/**/*.*', { base: './'})
    .pipe(changed(dest));

  return merge(script, style, template, manifest, shared);
}

gulp.task('build-apps', function() {
  var tasks = appList.map(function(app) {
    return buildApps(app)
      .pipe(zip(app + '/application.zip'));
  });

  return merge(tasks).pipe(gulp.dest('profile'));
});

gulp.task('default', ['build-apps']);
