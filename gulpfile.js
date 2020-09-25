var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var rev = require('gulp-rev-append');//添加MD5
var browserSync = require('browser-sync').create();
var contentIncluder = require('gulp-content-includer');
var htmlmin = require('gulp-htmlmin');//html压缩
var imagemin = require('gulp-imagemin');
var httpProxy = require('http-proxy');
var notify = require('gulp-notify');
var app = {
    srcPath: "src/",
    devPath: "build/",
    prdPath: "dist/"
};


function lib(cd) {
  gulp.src(app.srcPath + "libs/**/*.js", {allowEmpty: true})
      .pipe($.plumber())
      .pipe(gulp.dest(app.devPath + "static/libs"))
      .pipe(gulp.dest(app.prdPath + "static/libs"))
      .pipe(browserSync.stream());
      cd()
};

function html(cd) {
  var options = {
    removeComments: false,//清除HTML注释
    collapseWhitespace: true,//压缩HTML
    collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: false,//删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
    minifyJS: true,//压缩页面JS
    minifyCSS: true//压缩页面CSS
  };
  gulp.src(app.srcPath + "**/*.html", {allowEmpty: true})
      .pipe(rev())
      .pipe(gulp.dest(app.devPath))
      .pipe(htmlmin(options))
      .pipe(gulp.dest(app.prdPath))
      .pipe(browserSync.stream());
      cd()
};

function less(cd) {
  gulp.src(app.srcPath + "less/index.less", {allowEmpty: true})
      .pipe($.plumber())
      .pipe($.less())
      .pipe($.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: true, //是否美化属性值 默认：true 像这样：
        //-webkit-transform: rotate(45deg);
        //        transform: rotate(45deg);
        remove: false //是否去掉不必要的前缀 默认：true
      }))
      .pipe(gulp.dest(app.devPath + "static/css"))
      .pipe($.cssmin())
      .pipe(gulp.dest(app.prdPath + "static/css"))
      .pipe(browserSync.stream());
      cd()
};

function js(cd) {
  gulp.src(app.srcPath + "js/**/*.js", {allowEmpty: true})
      .pipe($.plumber())
      .pipe(gulp.dest(app.devPath + "static/js"))
      .pipe($.uglify())
      .pipe(gulp.dest(app.prdPath + "static/js"))
      .pipe(browserSync.stream());
      cd()
};


function image(cd) {
  // var options = [
  //   imagemin.gifsicle({interlaced: true}),
  //   imagemin.jpegtran({progressive: true}),
  //   imagemin.optipng({optimizationLevel: 5}),
  //   imagemin.svgo({
  //     plugins: [
  //       {removeViewBox: true},
  //       {cleanupIDs: false}
  //     ]
  //   })
  // ];
  // .pipe(imagemin(options))
  gulp.src(app.srcPath + "img/**/*", {allowEmpty: true})
      .pipe($.plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
      .pipe(gulp.dest(app.devPath + "static/img"))
      .pipe(gulp.dest(app.prdPath + "static/img"))
      .pipe(browserSync.stream());
      cd()
};
// 静态服务器 + 监听 less/html/js/images 文件
function serve(cd) {
  var proxy = httpProxy.createProxyServer({});

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    console.log(req.url, "请求错误")
    // res.end('Something went wrong. And we are reporting a custom error message.');
  });
  browserSync.init({
    // server: app.devPath
    server: {
      baseDir: app.devPath,
      middleware : function (req, res, next) {
        if(/\/web/.test(req.url)){
          proxy.web(req, res, {
            target: "http://11.205.50.109:6610"
          });
        }else{
          next()
        }
      }
    }
  });

  gulp.watch(app.srcPath + "libs/**/*.js", lib);
  gulp.watch(app.srcPath + "**/*.html", html);
  gulp.watch(app.srcPath + "less/**/*.less", less);
  gulp.watch(app.srcPath + "js/**/*.js", js);
  gulp.watch(app.srcPath + "img/**/*", image);
  gulp.watch("*.html").on('change', browserSync.reload);
  cd()
}

function clean(cd) {
    gulp.src([app.devPath, app.prdPath], {allowEmpty: true})
        .pipe($.clean());
        cd()
}
exports.default = gulp.series(lib, html, less, js, image, serve)