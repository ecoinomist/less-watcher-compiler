// =============================================================================
// CONFIGS
// =============================================================================
console.log(`⚡ Running ${require("./package.json").name}`)
const task = {
  WATCH: 'watch',
  CSS: 'css',
  FONTS: 'fonts',
  THEME_CONFIG: 'theme.config',
}
// Get arguments passed to command line
const {
  minify,
  sourcemap,
  autoprefix,
  flexbugsfix,
  browsers = [">0.3%", "not ie 11", "not dead", "not op_mini all"], // browser support list
  plugins = ['less-plugin-glob', 'less-plugin-functions'],
} = require('minimist')(process.argv.slice(2))
const themeConfigPath = '../../node_modules/semantic-ui-less/theme.config'
const input = 'style/' // relative path to styles folder
const output = 'public/static/'
const pwd = __dirname + '/'
const hasSourcemap = !!sourcemap
const shouldMinify = !!minify
const files = {
  // Files to watch
  watch: {
    css: [input + '**/*.less', input + 'override/**/*', input + 'theme.config'],
    fonts: input + 'fonts/**/*',
  },
  // Files to compile
  css: input + '_all.less',
  fonts: input + 'fonts/**/*.{eot,eof,svg,ttf,woff,woff2}',
  // Distribution folders
  build: {
    css: output,
    fonts: output + 'fonts/',
  }
}
const isProduction = process.env.NODE_ENV === 'production'

// =============================================================================
// VALIDATION
// =============================================================================
if (!plugins || plugins.constructor !== Array) throw new Error('plugins must be an array of strings')
const lessPlugins = plugins.map(require)

// =============================================================================
// DEPENDENCIES
// =============================================================================
const gulp = require('gulp')
/* report what gulp is doing */
const gulpIf = require('gulp-if')
/* watches all changes including new files */
const watch = require('gulp-watch')
/* maps output to source files for debugging */
const sourcemaps = require('gulp-sourcemaps')
/* prevents errors from breaking gulp tasks */
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const liveReload = require('gulp-livereload')
/* compiles less files to css */
const less = require('gulp-less')
/* allows to import multiple less files using glob expressions (e.g. @import "common/**";) */
/* usage: .pipe(less({plugins: [lessglob]})) */
const log = require("fancy-log")
/* css browser prefixes */
// const autoprefixer = require('autoprefixer')({ browsers: browsers });
const postcss = require('gulp-postcss');
/* minify css with cssnano because csso (fastest) does not work with postcss */
/* see benchmark: http://goalsmashers.github.io/css-minification-benchmark/ */
/* and since we only need css minification in production, speed is not important */
// const cssnano = require('cssnano');

// =============================================================================
// TASKS
// =============================================================================

/* Watch task triggers all automated tasks when files change */
gulp.task(task.WATCH, function () {
  liveReload.listen()
  watch(files.watch.css, function () {
    gulp.series(task.CSS)
  })
  watch(files.watch.fonts, function () {
    gulp.series(task.FONTS, task.CSS)
  })
})

/* CSS - Compile and Minify */
gulp.task(task.CSS, function () {
  // Only minify in production
  // if (isProduction || shouldMinify) lessPlugins.push(lessMinify)
  return gulp.src(files.css)
    .pipe(plumber(function (error) {
      log(error.message)
      this.emit('end')
    }))
    .pipe(gulpIf(hasSourcemap, sourcemaps.init()))
    .pipe(less({plugins: lessPlugins, javascriptEnabled: true}))
    .pipe(rename({basename: 'all'}))
    .pipe(gulpIf(hasSourcemap, sourcemaps.write('.')))
    .pipe(gulp.dest(files.build.css))
    .pipe(liveReload())
})

// FONTS - Copy to Distribution Folder
gulp.task(task.FONTS, function () {
  return gulp.src(files.fonts)
    .pipe(plumber())
    .pipe(rename({dirname: ''})) // make folder structure flat
    .pipe(gulp.dest(files.build.fonts))
})

// theme.config - Symlink to Semantic UI config in library
gulp.task(task.THEME_CONFIG, function (done) {
  const realFile = pwd + input + 'theme.config'
  const linkFile = themeConfigPath
  const file = require('fs')
  file.unlink(linkFile, function () {
    file.symlink(
      realFile,
      linkFile,
      function () {
        console.log('Symlinked ' + realFile)
        done()
      }
    )
  })
})

/* Default task for command: $ gulp */
gulp.task('default', gulp.series(task.THEME_CONFIG, task.WATCH))
