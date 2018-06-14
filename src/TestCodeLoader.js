/**
 * Created by noam on 1/3/16.
 */

const fs = require('fs')
const path = require('path')

const theRequireArrayOfTheTestFixtures = []

function TestCodeLoader (arrayOfSearchPaths) {
  this.loadFile = function (name, cb) {
    for (var i = 0; i < arrayOfSearchPaths.length; i++) {
      var jsPath = path.resolve(path.join(arrayOfSearchPaths[i], name + '.js'))
      if (fileExists(jsPath)) return loadFixture(jsPath, cb)
    }

    cb('File not found: ' + name)
  }

  function fileExists (jsPath) {
    try {
      fs.accessSync(jsPath, fs.F_OK)
      return true
    } catch (e) {
      return false
    }
  }

  function loadFixture (jsPath, cb) {
    try {
      theRequireArrayOfTheTestFixtures.push(require(jsPath))
      cb(null)
    } catch (e) {
      cb(new Error(e))
    }
  }
}

TestCodeLoader.prototype.make = function (name, args, cb) {
  if (!args) args = []

  try {
    const ns = name.split('.')

    let TheType

    for (var v = 0; v < theRequireArrayOfTheTestFixtures.length; v++) {
      TheType = theRequireArrayOfTheTestFixtures[v][ns[0]]

      for (var i = 1; i < ns.length; i++) {
        if (!TheType) continue

        TheType = TheType[ns[i]]
      }

      if (TheType) break
    }

    if (!TheType) return cb('NO_CLASS ' + name, null)

    var obj = new TheType(args)
    cb(null, obj)
  } catch (e) {
    cb(Error(e), null)
  }
}

module.exports = TestCodeLoader
