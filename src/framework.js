var http = require('http')
var webpack = require('webpack')
var dev = require('webpack-dev-middleware')
var hot = require('webpack-hot-middleware')

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
  config.entry.unshift('webpack-hot-middleware/client')
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
      publicPath: config.output.publicPath
    })
    app.use(devMiddleware)

    if(options.react) {
      if(!hotMiddleware) hotMiddleware = hot(compiler)
      app.use(hotMiddleware)
    }
  }
})()


function reloadApplication (serverCode, config, options) {
  //we can't just re-import as not sure what module systems used
  //eval works for all the module systems.
  var reloadedApp = eval(serverCode)

  //we got new app, need to hot reload again
  enableHotReload(reloadedApp, config, options)

  return reloadedApp
}

//app will try to create server again - intercept EADDRINUSE error and ignore it, otherwise rethrow
function ignoreServerRecreated () {
  process.on('uncaughtException', function (e) {
    if (e.code !== 'EADDRINUSE' || e.syscall !== 'listen' || e.address != '127.0.0.1' || e.port !== 1337) {
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
