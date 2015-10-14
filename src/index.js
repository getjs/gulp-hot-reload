import through2 from 'through2'
import express from 'express'
import gutil from 'gulp-util'
import {createAndStartDevServer, enableHotReload, ignoreServerRecreated, reloadApplication} from './framework'

export default (function(options) {

  var application

  var defaults = {
    port: 1337,
    host: '127.0.0.1',
    hmr: true,
    express: true
  }

  return function() {
    gutil.log('application:', application)
    if(!application) {
      gutil.log('init application')
      //pack it into function to ensure that subsequent runs will reuse the very same application object
      application = express()

      //Http server checks application from the closure each time. if we pass reference,
      //the reference would be remembered.
      //With the function there is new check for each call.
      init(() => application)
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
      application = reloadApplication(serverCode)
    })
    return stream
  }
})()

function init(getApp) {
  //enable react hot reload
  enableHotReload(getApp())

  //since reloadApplication changes application reference, it must be evaluated for each request
  createAndStartDevServer(getApp)

  //if original application created http server, ignore any errors
  ignoreServerRecreated()
}