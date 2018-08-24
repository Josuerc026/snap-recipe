var gulp = require('gulp'),
  sass = require('gulp-sass'),
  pretty = require('gulp-jsbeautifier'),
  stripDebug = require('gulp-strip-debug');

gulp.task('sass', function(done){
 gulp.src('src/css/*.scss')
   .pipe(sass().on('error', sass.logError))
   .pipe(gulp.dest('dist/css'));
    done();
});

gulp.task('styles',function(){
 gulp.src('dist/css/*.css')
   .pipe(pretty())
   .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function(done){
 gulp.src('src/js/*.js')
   .pipe(pretty())
   .pipe(gulp.dest('dist/js/'));
   done();
});


gulp.task('materialize', function(done){
 gulp.src('node_modules/materialize-css/dist/js/materialize.js')
   .pipe(pretty())
   .pipe(gulp.dest('dist/js/'));
   done();
});

gulp.task('watch', function(){
 gulp.watch('src/css/*.scss', gulp.series('sass'));
 gulp.watch('src/js/*.js', gulp.series('scripts'));
 gulp.watch('dist/css/*.css', gulp.series('styles'));
});
//gulp.task('default', ['sass', 'watch', 'scripts', 'styles']);
gulp.task('default', gulp.series('sass', 'watch', 'scripts', 'styles'));

