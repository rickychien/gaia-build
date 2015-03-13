var gulp = require('gulp');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var minifyJS = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');

const ignores = [
  '!apps/**/test/**',
  '!apps/**/build/**'];
const dest = 'profile/';

gulp.task('clean', function() {
  return gulp.src(dest)
    .pipe(rimraf(dest));
});

gulp.task('scripts', function() {
  return gulp.src(['apps/**/*.js'].concat(ignores))
    .pipe(changed('profile/'))
    .pipe(minifyJS())
    .pipe(gulp.dest(dest));
});

gulp.task('style', function() {
  return gulp.src(['apps/**/*.css'].concat(ignores))
    .pipe(changed('profile/'))
    .pipe(minifyCSS({ processImport: false }))
    .pipe(gulp.dest(dest));
});

gulp.task('template', function() {
  return gulp.src(['apps/**/*.html'].concat(ignores))
    .pipe(changed('profile/**'))
    .pipe(minifyHTML())
    .pipe(gulp.dest(dest));
});

gulp.task('manifest', function() {
  return gulp.src('apps/**/webapp.manifest')
    .pipe(changed('profile/**'))
    .pipe(gulp.dest(dest));
});

gulp.task('shared', function() {
  return gulp.src('shared/**')
    .pipe(changed('profile/**'))
    .pipe(gulp.dest(dest));
});

gulp.task('default', ['scripts', 'style', 'template', 'manifest', 'shared']);
