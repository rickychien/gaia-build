'use strict';

/* jshint node: true */

var gulp = require('gulp');
var change = require('gulp-change');
var changed = require('gulp-changed');
var jsmin = require('jsmin2');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-html-minifier');
var minifyJSON = require('gulp-jsonminify');
var zip = require('gulp-zip');
var merge = require('merge-stream');

var minifyJS = function() {
  return change(function(content) {
    return jsmin(content).code;
  });
};

module.exports = function(app, callback) {
  var ignores = ['!apps/**/+(build|test)/**', '!**/dictionaries/*.xml'];
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
    .pipe(minifyJSON());

  var other = gulp.src(['apps/' + app + '/**/*.*', '!**/*.+(js|css|html)']
    .concat(ignores));

  return merge(script, style, template, manifest, other)
    .pipe(zip('application.zip'))
    .pipe(gulp.dest(dest))
    .once('end', function() {
      if (callback) {
        callback();
      }
    });
};
