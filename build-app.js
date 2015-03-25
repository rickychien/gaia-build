'use strict';

/* jshint node: true */

var gulp = require('gulp');
var change = require('gulp-change');
var changed = require('gulp-changed');
var minifyJS = require('jsmin2');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-html-minifier');
var minifyJSON = require('gulp-jsonminify');
var tap = require('gulp-tap');
var zip = require('gulp-zip');
var merge = require('merge-stream');

module.exports = function(app, callback) {
  var ignores = ['!apps/**/+(build|test)/**'];
  var dest = 'profile/' + app;

  var script = gulp.src(['apps/' + app + '/**/*.js'].concat(ignores))
    .pipe(changed(dest, { extension: '.js' }))
    .pipe(change(function(content) {
      return minifyJS(content).code;
    }));

  var style = gulp.src(['apps/' + app + '/**/*.css'].concat(ignores))
    .pipe(changed(dest, { extension: '.css' }))

  var template = gulp.src(['apps/' + app + '/**/*.html'].concat(ignores))
    .pipe(changed(dest, { extension: '.html' }))

  var manifest = gulp.src('apps/' + app + '/manifest.webapp')
    .pipe(changed(dest, { extension: '.webapp' }))

  var other = gulp.src(['apps/' + app + '/**/*.*', '!(.js|.css|.html)'])

  return merge(script, style, template, manifest)
    .pipe(zip('application.zip'))
    .pipe(gulp.dest(dest))
    .once('end', function() {
      if (callback) {
        callback();
      }
    });
};
