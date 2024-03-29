module.exports = function () {
  return {
    // Default Options
    files: [ // list of source files to watch for changes and corresponding tasks to run
      {
        task: 'css', // name of the task to run, must be one of ['css', 'copy']
        watch: [ // file/s to watch for changes, using glob pattern
          'style/*.less', // only match files in root folder, sub-folders should have their own watcher
          'style/fonts/**/*.less',
        ],
        compile: 'style/_all.less', // file/s to compile when changes detected, using glob pattern
        output: 'public/static/', // destination directory where new file/s should be saved
        renameOptions: {basename: 'all'}, // change output file name
        // optional callback each time the task finishes
        callback: (file) => {},
      },
      {
        task: 'copy', // copy over `compile` file/s to `output` directory without compilation
        watch: [
          'style/fonts/**/*.{eot,eof,svg,ttf,woff,woff2}', // watch for changes of all file types within `style/fonts/` directory
        ],
        compile: 'style/fonts/**/*.{eot,eof,svg,ttf,woff,woff2}', // only copy over files with matched extensions
        output: 'public/static/fonts/',
        renameOptions: {dirname: ''}, // make folder structure flat on output, using `gulp-rename` npm package
      },
      /* Subtask to compile Semantic UI only to improve performance */
      {
        task: 'css',
        watch: [
          'style/override/**/*',
        ],
        compile: 'style/override/_semantic.less',
        output: 'public/static/',
        renameOptions: {basename: 'semantic'}, // change output file name
      },
    ],
    symlinks: [ // useful for Semantic UI theme.config setup using `semantic-ui-less` library
      {
        // paths are relative to process.cwd()
        target: 'style/override/theme.config', // path to the source file to reference
        link: 'node_modules/semantic-ui-less/theme.config' // path to the file that references the target
      }
    ],
    minify: false,
    sourcemap: false,
    autoprefix: true,
    flexbugsfix: true,
    javascriptEnabled: true,
    browserslist: {
      browserslist: {
        'production': [
          'defaults',
          // '>0.3%',
          // 'not dead',
          // 'not op_mini all'
        ],
        'development': [
          'last 1 version', // this makes sure there is -moz prefix
          // 'last 1 chrome version',
          // 'last 1 firefox version',
          // 'last 1 safari version',
          // 'last 1 ie version'
        ]
      },
    },
    postcssPlugins: [ // additional PostCSS plugins to use (you must install them yourself)
      // ['postcss-prefixwrap', '#my-app'] // example of namespacing all rules using unique id `my-app`
    ],
    postcssOptions: undefined, // additional PostCSS options to use (i.e. `{ parser: 'sugarss' }`)
    plugins: [
      'less-plugin-glob',
      'less-plugin-functions',
    ],
    // ...Other options passed to `lessc` compiler (currently using `gulp-less` npm package)
  }
}
