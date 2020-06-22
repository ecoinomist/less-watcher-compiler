// =============================================================================
// CONFIGS
// =============================================================================
const themeConfigPath = '../../node_modules/semantic-ui-less/theme.config'
const input = 'test/' // relative path to styles folder
const output = 'public/static/'
const pwd = __dirname + '/'
const NODE_ENV = process.env.NODE_ENV || 'development'
const isProduction = NODE_ENV === 'production'
console.log(`⚡ Running ${require('./package.json').name} ${NODE_ENV} mode`)
// Get arguments passed to command line
const {
  minify,
  sourcemap,
  autoprefix = true,
  flexbugsfix = true,
  javascriptEnabled = true,
  browserslist = { // browser support list
    'production': [
      '>0.3%',
      'not dead',
      'not op_mini all'
    ],
    'development': [
      'last 1 chrome version',
      'last 1 firefox version',
      'last 1 safari version',
      'last 1 ie version'
    ]
  },
  // `less-plugin-glob` allows to import multiple less files using glob expressions (e.g. @import "common/**";)
  // `less-plugin-functions` allows to define custom less js-like functions
  plugins = ['less-plugin-glob', 'less-plugin-functions'],
  postcssPlugins = [],
  postcssOptions,
} = require('minimist')(process.argv.slice(2))
const hasSourcemap = !!sourcemap
const shouldMinify = isProduction || !!minify
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
const log = require('fancy-log')
/* compiles less files to css */
const less = require('gulp-less')
/* css post processing */
const postcss = require('gulp-postcss')
/* minify css with cssnano because csso (fastest) does not work with postcss */
/* see benchmark: http://goalsmashers.github.io/css-minification-benchmark/ */
/* and since we only need css minification in production, speed is not important */

// =============================================================================
// VALIDATION & PLUGIN SETUP
// =============================================================================
if (!plugins || plugins.constructor !== Array) throw new Error('plugins must be an array of strings')
if (!postcssPlugins || postcssPlugins.constructor !== Array) throw new Error('postcssPlugins must be an array of strings')
const lessPlugins = plugins.map(p => {
  if (p === 'less-plugin-functions') return new (require(p))()
  return require(p)
})
if (autoprefix) postcssPlugins.push('autoprefixer')
if (flexbugsfix) postcssPlugins.push('postcss-flexbugs-fixes')
if (shouldMinify) postcssPlugins.push('cssnano')
const cssPlugins = postcssPlugins.filter((value, index, self) => self.indexOf(value) === index)
  .map(p => {
    if (p === 'autoprefixer') return require(p)({overrideBrowserslist: browserslist[NODE_ENV]})
    return require(p)()
  })

// =============================================================================
// TASKS
// =============================================================================

const TASK = {
  WATCH: 'watch',
  CSS: 'css',
  FONTS: 'fonts',
  THEME_CONFIG: 'theme.config',
}

/* Watch task triggers all automated tasks when files change */
gulp.task(TASK.WATCH, function () {
  liveReload.listen()
  watch(files.watch.css, function () {
    gulp.series(TASK.CSS)
  })
  watch(files.watch.fonts, function () {
    gulp.series(TASK.FONTS, TASK.CSS)
  })
})

/* CSS - Compile and Minify */
gulp.task(TASK.CSS, function () {
  // Only minify in production
  // if (isProduction || shouldMinify) lessPlugins.push(lessMinify)
  return gulp.src(files.css)
    .pipe(plumber(function (error) {
      log(error.message)
      this.emit('end')
    }))
    .pipe(gulpIf(hasSourcemap, sourcemaps.init()))
    .pipe(less({plugins: lessPlugins, javascriptEnabled}))
    // .pipe(rename({basename: 'all'}))
    .pipe(postcss(cssPlugins, postcssOptions))
    .pipe(gulpIf(hasSourcemap, sourcemaps.write('.')))
    .pipe(gulp.dest(files.build.css))
    .pipe(liveReload())
})

// FONTS - Copy to Distribution Folder
gulp.task(TASK.FONTS, function () {
  return gulp.src(files.fonts)
    .pipe(plumber())
    .pipe(rename({dirname: ''})) // make folder structure flat
    .pipe(gulp.dest(files.build.fonts))
})

// theme.config - Symlink to Semantic UI config in library
gulp.task(TASK.THEME_CONFIG, function (done) {
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
gulp.task('default', gulp.series(TASK.THEME_CONFIG, TASK.WATCH))
