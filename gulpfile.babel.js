import gulp from 'gulp'
import del from 'del'
import babel from 'gulp-babel'
import minify from 'gulp-babel-minify'
import * as builder from 'electron-builder'
import fs from 'fs'
import path from 'path'

gulp.task("clean", () => {
  return del([
    'compiled/**/*',
    'dist/**/*'
  ]);
});

gulp.task('copy', ['clean'], () => {
  return gulp.src('./app/**/!(*.js|*.jsx|*.less)')
    .pipe(gulp.dest('./compiled'));
});

gulp.task('buildES6', ['copy'], () => {
  process.env.NODE_ENV = 'production';
  return gulp.src('./app/**/*.{js,jsx}')
    .pipe(babel())
    .pipe(minify())
    .pipe(gulp.dest('./compiled'));
})

gulp.task('pkg', ['buildES6'], () => {
  const {
    name, version, main, author, description, license, dependencies
  } = require('./package.json');
  const pkg = {
    name, version,
    main: path.relative('./app', main),
    author, description, license, dependencies
  }
  fs.writeFileSync('./compiled/package.json', JSON.stringify(pkg, null, 2));
});

gulp.task('build', ['clean', 'copy', 'buildES6', 'pkg'])