var through2 = require('through2')
var express =  require('express')
var gutil = require('gulp-util')
var util = require('./framework')

module.exports = (function() {

  var application, config

  var defaults = {
    port: 1337,
    host: '127.0.0.1',
    react: true,
    express: true
  }

  return function(inputOptions) {

    var options = inputOptions || {}
    options.config = inputOptions.config
    options.port = inputOptions.port || defaults.port
    options.host = inputOptions.host || defaults.host
    if(typeof inputOptions.react === 'undefined') {
      options.react = defaults.react
    }
    if(typeof inputOptions.express === 'undefined') {
      options.express = defaults.express
    }

    if(!config) {
      config = require(options.config)
    }
    if(!application) {
      gutil.log('init application')
      //pack it into function to ensure that subsequent runs will reuse the very same application object
      application = express()

      //Http server checks application from the closure each time. if we pass reference,
      //the reference would be remembered.
      //With the function there is new check for each call.
      init(function () {
        return application
      }, config, options)
    }

    var files = []


    var stream = through2.obj(function(file, enc, done) {
      if (file.isBuffer()) {
        var code = file.contents.toString(enc)
      }
      this.push(code)
      done()
    })
    stream.on('data', function(code) {
      files.push(code)
    })
    stream.on('end', function() {
      //take first chunk
      var serverCode = files[0]
      application = util.reloadApplication(serverCode, config, options)
    })
    return stream
  }
})()

function init(getApp, config, options) {
  //enable react hot reload
  util.enableHotReload(getApp(), config, options)

  //since reloadApplication changes application reference, it must be evaluated for each request
  util.createAndStartDevServer(getApp, options)

  //if original application created http server, ignore any errors
  util.ignoreServerRecreated()
}
