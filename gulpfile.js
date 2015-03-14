'use strict';

/* jshint node: true */

var gulp = require('gulp');
var argv = require('yargs').argv;
var changed = require('gulp-changed');
var rimraf = require('gulp-rimraf');
var concat = require('gulp-concat');
var minifyJS = require('gulp-jsmin');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-html-minifier');
var JSONMinify = require('gulp-jsonminify');
var zip = require('gulp-zip');
var tap = require('gulp-tap');
var merge = require('merge-stream');
var fs = require('fs');

var appList = argv.app ? [argv.app] : fs.readdirSync('apps');
var ignores = ['!apps/**/+(build|test)/**'];

gulp.task('clean', function() {
  return gulp.src('profile', { read: false })
    .pipe(rimraf('profile'));
});

gulp.task('build-apps', function() {
  var tasks = appList.map(function(app) {
    var dest = 'profile/' + app;

    var script = gulp.src(['apps/' + app + '/**/*.js'].concat(ignores))
      .pipe(changed(dest, { extension: '.js' }))
      .pipe(minifyJS());

    var style = gulp.src(['apps/' + app + '/**/*.css'].concat(ignores))
      .pipe(changed(dest, { extension: '.css' }))
      .pipe(minifyCSS({ processImport: false }));

    var template = gulp.src(['apps/' + app + '/**/*.html'].concat(ignores))
      .pipe(changed(dest, { extension: '.html' }))
      .pipe(minifyHTML());

    var manifest = gulp.src('apps/' + app + '/manifest.webapp')
      .pipe(changed(dest, { extension: '.webapp' }))
      .pipe(JSONMinify());

    var sharedScript = gulp.src('shared/**/*.js', { base: './' })
      .pipe(changed(dest, { extension: '.js' }))
      .pipe(minifyJS());

    var sharedStyle = gulp.src('shared/**/*.css', { base: './' })
      .pipe(changed(dest, { extension: '.css' }))
      .pipe(minifyCSS());

    return merge(script, style, template, manifest, sharedScript, sharedStyle)
      .pipe(zip('application.zip'))
      .pipe(gulp.dest('profile/' + app));
  });

  return merge(tasks);
});

gulp.task('default', ['build-apps']);
