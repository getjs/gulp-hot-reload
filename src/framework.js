var http = require('http')
var webpack = require('webpack')
var dev = require('webpack-dev-middleware')
var hot = require('webpack-hot-middleware')
var gutil = require('gulp-util')

function createAndStartDevServer (getApp, options) {
  const server = http.createServer(function (req, res, next) {
    getApp()(req, res, next)
  })
  server.listen(options.port, options.host, function () {
    var port = server.address().port
    var host = server.address().address
    console.log("Development server started at http://" + host + ":" +port)
  })
}

function createWebpackCompiler (config) {
  config.entry.unshift('webpack-hot-middleware/client?path=' + config.output.publicPath + '__webpack_hmr')
  if (typeof config.plugins === 'undefined') config.plugins = []
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
  return webpack(config)
}


var enableHotReload = (function() {
  var compiler, devMiddleware, hotMiddleware

  return function (app, config, options) {
    //create once and reuse to keep socket connections
    if(!compiler) compiler = createWebpackCompiler(config)
    if(!devMiddleware) devMiddleware = dev(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath,
      stats: options.stats
    })
    app.use(devMiddleware)

    if(options.react) {
      if(!hotMiddleware) hotMiddleware = hot(compiler, { path: config.output.publicPath + '__webpack_hmr' })
      app.use(hotMiddleware)
    }
  }
})()


function reloadApplication (serverCode, config, options) {
  //we can't just re-import as not sure what module systems used
  //eval works for all the module systems.
  try {
    var reloadedApp = eval(serverCode)

    //we got new app, need to hot reload again
    enableHotReload(reloadedApp, config, options)
    return reloadedApp
  } catch(err) {
    gutil.log('[gulp-reload]', err.stack ? err.stack : err)
  }


}

//app will try to create server again - intercept EADDRINUSE error and ignore it, otherwise rethrow
function ignoreServerRecreated (options) {
  process.on('uncaughtException', function (e) {
    if (e.code !== 'EADDRINUSE' || e.syscall !== 'listen' || e.address != '127.0.0.1' || e.port !== options.port) {
      console.log(e)
      throw e
    }
  })
}

exports.createAndStartDevServer = createAndStartDevServer
exports.reloadApplication = reloadApplication
exports.createWebpackCompiler = createWebpackCompiler
exports.enableHotReload = enableHotReload
exports.ignoreServerRecreated = ignoreServerRecreated
