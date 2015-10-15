gulp-hot-reload [![](http://img.shields.io/npm/dm/gulp-hot-reload.svg?style=flat)](https://www.npmjs.org/package/gulp-hot-reload) [![](http://img.shields.io/npm/v/gulp-hot-reload.svg?style=flat)](https://www.npmjs.org/package/gulp-hot-reload)
==============

Gulp plugin to reload Express/React.js application without server restart.

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
      port: 1337,
      react: true,
      config: path.join(__dirname, 'webpack.config.js')
    }))
})
```

- Create webpack configuration for client and server
- Add .babelrc file to your project

## How it Works

- the pipeline starts with running *gulp.src* on application entry point
- webpack-stream is a stream-enabled webpack compiler, that can be easily plugged into gulp pipeline. It runs webpack internally, sending the file from *gulp.src* as an entry point 
- webpack bundles server application. It is possible with minor tweaks to [webpack configuration](https://github.com/getjs/gulp-hot-reload-boilerplate/blob/master/README.md#webpackserverconfigjs) and offers several benefits
- application, as a single chunk, comes into gulp-hot-reload. Having whole application in a single entity makes hot reload easy
- gulp-hot-reload starts development server if it has not started already. If the development server is configured to be started on the same port as the application server, the application server will not start and only one server instance will be running
- gulp-hot-reload runs *eval* on bundles application
- server.js module.exports the application, hence it is returned
- gulp-hot-reload configures webpack-dev-middleware and webpack-hot-middleware on it
- development server routes all the requests to the applciation returned from *eval*
- gulp watches for files changes and runs the process if any file is modified.

## Options

Options are passed to the plugin function in gulpfile:

```javascript
    .pipe(reload({
      port: 1337,
      react: true,
      config: path.join(__dirname, 'webpack.config.js')
    }))
```

- **port** - default: 1337. Port at which dev server starts. It might be the same port as used by the application - in such a case gulp-hot-reload will start development server and block the application server from starting. If the ports differ, both development and application servers start.
- **react** - default: true. If true, hot module replacement of React components is enabled. Set it to false to benefit from server reload without having React application in frontend.
- **config** - path to client webpack configuration. For sample see [boilerplate webpack.config.js](https://github.com/getjs/gulp-hot-reload-boilerplate/blob/master/webpack.config.js).

## Inspirations and references
- [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform)
- [ultimate-hot-reloading-example](https://github.com/glenjamin/ultimate-hot-reloading-example)
