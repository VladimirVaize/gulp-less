const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const less = require('gulp-less');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const imageMin = require('gulp-imagemin');
const notify = require('gulp-notify');
const del = require('del');



// Авто обновление страници
function serverTask() {
	browserSync.init({
	    server: {
	        baseDir: "./src"
	    },
	    notify: true
	});
}

//Компиляция less файлов и проставление прификсов
function lessTask() {
	return src('src/less/**/*.less')
	.pipe(less().on("error", notify.onError()))
	.pipe(autoprefixer(['last 15 version']))
	.pipe(cleanCSS({
		compatibility: 'ie8'
		}))
	.pipe(dest('src/css'))
	.pipe(browserSync.reload({stream: true}))
}


// Оптимизация изображений
function imagesTask() {
	return src('src/img/**/*')
	.pipe(imageMin(
		imageMin.jpegtran({progressive: true}),
		imageMin.optipng({optimizationLevel: 5})
		))
	.pipe(dest('dist/img'))
}


// Мониториег изменения файлов
function watchTask() {
	watch('src/less/**/*.less', parallel(lessTask));
	watch('src/**/*.html', browserSync.reload);
	watch('src/js/**/*.js', parallel(scriptsTask));
	watch('src/img/**/*', browserSync.reload);
}

// Сжатие js скриптов
function scriptsTask() {
	return src([
		'src/js/jquery-3.4.1.js',
		'src/js/script.js'
		])
	.pipe(concat('script.min.js'))
	.pipe(uglify())
	.pipe(dest('src/js'))
	.pipe(browserSync.reload({stream: true}))
}

// Чистит директорию
function delTask() {
	return del(['dist']);
}

// Сборка
function buildTask() {
	return src([
		'src/**/*.html',
		'src/**/*.min.js',
		'src/**/*.css',
		])
	.pipe(dest('dist'))
}

exports.del = delTask;
exports.scripts = scriptsTask;
exports.less = lessTask;
exports.images = imagesTask;
exports.watch = watchTask;
exports.server = serverTask;

exports.build = series(delTask, scriptsTask, lessTask, imagesTask, buildTask);
exports.default = parallel(serverTask, watchTask);