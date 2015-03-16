var gulp = require('gulp');
var argv = require('yargs').argv;
var changed = require('gulp-changed');
var rimraf = require('gulp-rimraf');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var JSONMinify = require('gulp-jsonminify');
var zip = require('gulp-zip');
var tap = require('gulp-tap');
var merge = require('merge-stream');
var workerFarm = require('spawn-task-experiment').workerPool();

var ignores = [
  '!apps/**/test/**',
  '!apps/**/build/**'
];

module.exports = function(app, callback) {
  var dest = 'profile/' + app;
  var script = gulp.src(['apps/' + app + '/**/*.js'].concat(ignores))
    .pipe(changed(dest, { extension: '.js' }))
    .pipe(uglify());

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
    .pipe(uglify());

  var sharedStyle = gulp.src('shared/**/*.css', { base: './' })
    .pipe(changed(dest, { extension: '.css' }))
    .pipe(minifyCSS());

  var streams = merge(script, style, template, manifest, sharedScript, sharedStyle)
    .pipe(zip('application.zip'))
    .pipe(gulp.dest('profile/' + app));
  streams.once('end', function() {
    callback();
  });
};