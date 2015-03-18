'use strict';

/* jshint node: true */

var gulp = require('gulp');
var argv = require('yargs').argv;
var rimraf = require('gulp-rimraf');
var workerFarm = require('worker-farm');
var fs = require('fs');

gulp.task('clean', function() {
  return gulp.src('profile', { read: false })
    .pipe(rimraf('profile'));
});

gulp.task('build-apps', function(done) {
  var appList = argv.app ? [argv.app] : fs.readdirSync('apps');
  var appWorker = workerFarm(require.resolve('./build-app'));
  var applistIndex = 0;

  appList.map(function(app) {
    appWorker(app, function() {
      if (++applistIndex === appList.length) {
        workerFarm.end(appWorker);
        done();
      }
    });
  });
});

gulp.task('default', ['build-apps']);
