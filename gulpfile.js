'use strict';

/* jshint node: true */

var gulp = require('gulp');
var argv = require('yargs').argv;
var rimraf = require('gulp-rimraf');
var workerFarm = require('worker-farm');
var fs = require('fs');
var Make = require('./commandGen');
var through = require('through2');
var path = require('path');
var runSeq = require('gulp-run-sequence');
var merge = require('merge-stream');

var appList = argv.app ? [argv.app] : fs.readdirSync('apps');
var ignores = ['!apps/**/+(build|test)/**'];

function mergeAppPath(newFolderPath, appPath) {
  var currentPath = path.resolve('./');
  var target = appPath.replace(currentPath, '').replace('apps/', '');
  return currentPath + '/' + newFolderPath + target;
}

gulp.task('clean', function() {
  return gulp.src(['profile', 'build_stage'], { read: false })
    .pipe(rimraf('profile'))
    .pipe(rimraf('build_stage'));
});


var make = new Make.make();

gulp.task('cpapp', function(done) {
  var tasks = appList.map(function(app) {
    return gulp.src('apps/' + app)
      .pipe(through.obj(
        function(file, env, cb) {
          var targetPath = path.resolve('build_stage/' + app);
          var sourcePath = path.resolve('apps/' + app);
          make.insertTask(false, targetPath, [sourcePath],
            [
             '@mkdir -p ' + path.resolve('build_stage/' + app),
             '@cp -r ' + sourcePath + ' ' + path.resolve('build_stage')
            ]
          );
          cb();
        },
        function(cb) {
          cb();
        }
      ));
        
  });
  return merge(tasks).pipe(through.obj(function(file, env, cb) {
    cb();
    done();
  }));
});

gulp.task('config-apps', function(done) {
  // scan HTML ? 
  var appFolderName = [];
  var commands = [];
  var tasks = appList.map(function(app) {
    appFolderName.push(path.resolve('profile/' + app));

    make.insertTask(false, path.resolve('profile/' + app + '/application.zip'),
      [path.resolve('build_stage/' + app + '/js')],
      ['@mkdir -p ' + path.resolve('profile/' + app),
       '@zip -r ' +
        path.resolve('profile/' + app + '/application.zip') + ' ' +
        'build_stage/' + app + ' -x "*.png"']);

    make.insertTask(false, path.resolve('profile/' + app),
      [path.resolve('profile/' + app + '/application.zip')],
      []);

    var jsFileList = [];
    var jsStream = gulp.src(['apps/' + app + '/**/*.js'].concat(ignores))
      .pipe(through.obj(function(file, env, cb) {
        var targetPath = mergeAppPath('build_stage', file.path);
        var folderName = path.dirname(targetPath);
        var fileName = path.basename(targetPath);
        var minifiedPath = folderName + '/min_' + fileName;
        jsFileList.push(minifiedPath);
        make.insertTask(false, minifiedPath,
          [path.resolve('build_stage/' + app)],
          ['@node jsmin ' + targetPath +' -o ' + minifiedPath]);
        cb();
        }, function(cb) {
          make.insertTask(false, path.resolve('build_stage/' + app + '/js'),
            jsFileList, []);
          cb();
        })
      );
    return merge(jsStream);
  });

  
  make.insertTask(false, 'profile', appFolderName,
    []);
  return merge(tasks).pipe(through.obj(function(file, env, cb) {
    cb();
    done();
  }));
});

gulp.task('writeMakefile', function() {
  return gulp.src('Makefile').pipe(through.obj(function(file, env, cb) {
    make.writeMk('Makefile');
    cb();
  }));
});

gulp.task('default', function(cb) {
  runSeq('cpapp', 'config-apps', 'writeMakefile', cb);
});
