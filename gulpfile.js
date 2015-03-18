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
var workerFarm = require('worker-farm');

var appList = argv.app ? [argv.app] : fs.readdirSync('apps');
var ignores = ['!apps/**/+(build|test)/**'];

gulp.task('clean', function() {
  return gulp.src('profile', { read: false })
    .pipe(rimraf('profile'));
});

gulp.task('build-apps', function() {
  var appWorker = workerFarm(require.resolve('./build_app'));
  var applistIndex = 0;
  appList.map(function(app) {
    appWorker(app, function(result) {
      console.log(applistIndex++);
      if (applistIndex === appList.length) {
        workerFarm.end(appWorker);
      }
    });
  });
});

gulp.task('default', ['build-apps']);
