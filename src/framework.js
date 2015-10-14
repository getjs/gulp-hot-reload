import express from 'express'
import fs from 'fs'
import webpack from 'webpack'
import dev from 'webpack-dev-middleware'
import hot from 'webpack-hot-middleware'
import config from './../webpack.config.js'
import http from 'http'
import path from 'path'
import gutil from 'gulp-util'

export function createAndStartDevServer(getApp) {
  const server = http.createServer((req, res, next) => {
    getApp()(req, res, next)
  })
  server.listen(1337, '127.0.0.1',() => {
    const port = server.address().port
    const host = server.address().address
    console.log(`Development server started at http://${host}:${port}`)
  })
}

export function createWebpackCompiler() {
  config.entry = ['webpack-hot-middleware/client', './app/application.js']
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
  return webpack(config)
}

export var enableHotReload = (function() {
  var compiler, devMiddleware, hotMiddleware

  return function (app) {
    //create once and reuse to keep socket connections
    if(!compiler) compiler = createWebpackCompiler()
    if(!devMiddleware) devMiddleware = dev(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath
    })
    if(!hotMiddleware) hotMiddleware = hot(compiler)

    app.use(devMiddleware)
    app.use(hotMiddleware)
  }
})()

export function reloadApplication(serverCode) {
  //var serverCode = fs.readFileSync('./build/server.js','utf8')

  //we can't just re-import as not sure what module systems used
  //eval works for all the module systems.
  var reloadedApp = eval(serverCode)

  //we got new app, need to hot reload again
  enableHotReload(reloadedApp)
  return reloadedApp
}

//app will try to create server again - intercept EADDRINUSE error and ignore it, otherwise rethrow
export function ignoreServerRecreated() {
  process.on('uncaughtException', (e) => {
    if (e.code !== 'EADDRINUSE' || e.syscall !== 'listen' || e.address != '127.0.0.1' || e.port !== 1337) {
      console.log(e)
      throw e
    }
  })
}

