##LESS CSS Watcher + Compiler
1. Watch for file changes and compile less to css. 
2. Many options: minify, add autoprefixer and flexbugs fixes using PostCSS, etc. (see below).
3. Works when files are added/removed/edited. 
4. Watcher resumes after compilation errors are fixed, without exiting process.
5. Configure multiple source files to watch for changes, and corresponding output file to compile.

###Installation
```
yarn add -D less-watcher-compiler
```

###Options
Create less-watcher-compiler.config.js in the root directory with this content:
```
module.exports = function () {
  // Default Options
  return {
    minify: false,
    sourcemap: false,
    autoprefixer: true,
    flexbugsfixer: true,
    browsers: [">0.3%", "not ie 11", "not dead", "not op_mini all"],
    plugins: [
      'functions', // use `less-plugin-functions`
    ],
  }
}
```

###Usage
Add this script to `package.json`:
```
  ...
  "scripts": {
    "style": "./node_modules/less-watcher-compiler"
  ...
```

To watch and compile, run:
```
yarn style 
```

To compile only once (useful for production build), run:
```
yarn style css
```
