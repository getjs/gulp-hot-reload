# [gulp-hot-reload](https://github.com/getjs/gulp-hot-reload)

Gulp plugin to reload Express/React.js application without server restart

To get started, see complete [gulp-hot-reload-boilerplate](https://github.com/getjs/gulp-hot-reload-boilerplate).

## Goals
- hot reload React.js components using [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform) and [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware)
- reload Express application without process restart so React hot reloading keeps working. Any modification (adding/changing
routes, changes in the entry server.js file) should be possible.
- bundle both client and server with webpack
- during development building takes place in-memory
- add hot-reload capabilities to existing Express/React.js application with minimal effort

## Usage

- Plug gulp-hot-reload is used by putting it as a final step in gulp build pipe line, instead of gulp.dest call:

```javascript
gulp.task('build-backend', () => {
  gulp
    .src('./src/server.js')
    .pipe(webpackStream(serverConfig, webpack, buildDone))
    .pipe(reload({
      config: path.join(__dirname, 'webpack.config.js')
    }))
})
```

- Create webpack configuration for client and server

- Add .babelrc file to your project

## Inspirations and references
- [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform)
- [ultimate-hot-reloading-example](https://github.com/glenjamin/ultimate-hot-reloading-example)
