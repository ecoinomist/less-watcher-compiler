// =============================================================================
// CONFIGS
// =============================================================================
const {name} = require('./package.json')
const NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase()
console.log(`⚡ Running ${name} in ${NODE_ENV} mode`)
const packageDir = __dirname + '/'
const configFileName = name + '.config.js'
let defaultConfig = require(packageDir + 'config.js')()
// Get arguments passed to command line
const {_, ...commandConfig} = require('minimist')(process.argv.slice(2))
try {
  defaultConfig = require(process.cwd() + '/' + configFileName)(defaultConfig)
} catch (err) {
  console.log(`✓ No ${configFileName} detected, using these options:`)
}
const config = {...defaultConfig, ...commandConfig}
console.log(JSON.stringify(config, null, 2))
const {
  files,
  minify,
  sourcemap,
  autoprefix,
  flexbugsfix,
  javascriptEnabled,
  browserslist,
  plugins,
  postcssPlugins = [],
  postcssOptions,
  ...lessOptions
} = config
const themeConfigPath = '../../node_modules/semantic-ui-less/theme.config'
const input = 'test/' // relative path to styles folder
const output = 'public/static/'
const isProduction = NODE_ENV === 'production'
const hasSourcemap = !!sourcemap
const shouldMinify = isProduction || !!minify

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
  COPY: 'copy',
  THEME_CONFIG: 'theme.config',
}

/* Watch task triggers all automated tasks in config.js[files] */
gulp.task(TASK.WATCH, function () {
  liveReload.listen()
  return files.map(watchTask)
})

gulp.task(TASK.CSS, gulp.parallel(...files.filter(({task}) => task === TASK.CSS).map(cssTask)))

// FONTS - Copy to Distribution Folder
gulp.task(TASK.COPY, gulp.parallel(...files.filter(({task}) => task === TASK.COPY).map(copyTask)))

// theme.config - Symlink to Semantic UI config in library
gulp.task(TASK.THEME_CONFIG, function (done) {
  const realFile = packageDir + input + 'theme.config'
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

/**
 * Watch dynamic list of tasks
 */
function watchTask ({watch: changes, compile, task, output, renameOptions}) {
  const id = idFrom({task, compile})
  gulp.task(id, function () {
    switch (task) {
      case TASK.CSS:
        return cssTask({task, compile, output, renameOptions})()
      case TASK.COPY:
      default:
        return copyTask({task, compile, output, renameOptions})()
    }
  })
  return watch(changes, gulp.series(id))
}

/* CSS - Compile and Minify */
function cssTask ({task, compile, output, renameOptions}) {
  const t = () => gulp.src(compile)
    .pipe(plumber(function (error) {
      log(error.message)
      this.emit('end')
    }))
    .pipe(gulpIf(hasSourcemap, sourcemaps.init()))
    .pipe(less({plugins: lessPlugins, javascriptEnabled, ...lessOptions}))
    .pipe(postcss(cssPlugins, postcssOptions))
    .pipe(gulpIf(!!renameOptions, rename(renameOptions)))
    .pipe(gulpIf(hasSourcemap, sourcemaps.write('.')))
    .pipe(gulp.dest(output))
    .pipe(liveReload())
  Object.defineProperty(t, 'name', {value: idFrom({task, compile}), writable: false})
  return t
}

/* Copy to Distribution Folder */
function copyTask ({task, compile, output, rename: renameOptions}) {
  const t = () => gulp.src(compile)
    .pipe(plumber())
    .pipe(gulpIf(!!renameOptions, rename(renameOptions)))
    .pipe(gulp.dest(output))
  Object.defineProperty(t, 'name', {value: idFrom({task, compile}), writable: false})
  return t
}

/**
 * Crate Unique Task ID
 */
function idFrom({task, compile}) {
  return  `${task} -> ${compile}`
}

/* Default task for command: $ gulp */
exports.default = gulp.series(TASK.WATCH)
