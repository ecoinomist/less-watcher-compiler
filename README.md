## LESS CSS Watcher + Compiler
![less-watcher-compiler-cli](docs/less-watcher-compiler.png)
1. Watch for file changes and compile less to css. 
2. Customizable lessc options: minify, autoprefixer and flexbugs fixes using PostCSS, etc. (see below).
3. Works when files are added/removed/moved/renamed/edited, and watcher updates efficiently. 
4. Resume watching after compilation errors are fixed, without exiting process.
5. Configure multiple source files to watch for changes, and corresponding task to execute.
6. Reload CSS without refreshing app state in browser ([LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) - better and faster than Hot reloading)
7. Works with any popular frontend build setup using CRA (Create React App), Next.js, jQuery, etc.

### Installation
```
yarn add -D less-watcher-compiler gulp
```

### Options
Create `less-watcher-compiler.config.js` (optional) in the root directory with content similar to example [config.js](config.js).

All options can be passed as command line (cli) arguments, which will override config file options.

### Usage
Add this script to `package.json`:
```js
  "scripts": {
    "style": "gulp --gulpfile ./node_modules/less-watcher-compiler/gulpfile.js --cwd ./"
  }
```

To watch and compile, run:
```bash
yarn style --sourcemap
```

To compile only once (useful for production build), run:
```bash
NODE_ENV=production yarn style css
```

To watch and compile with Semantic UI theme.config, run:
```bash
yarn style watch symlink
```
