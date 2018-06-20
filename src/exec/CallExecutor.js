/**
 * Created by noam on 1/18/16.
 */

const VOID = '/__VOID__/'
const utils = require('./ExecUtils')

function CallExecutor (state) {
  this.call = function (instructionArgument, cb, symbolNameToAssignTo) {
    const id = instructionArgument[0]

    const instanceName = instructionArgument[2]
    const funName = instructionArgument[3]

    const args = instructionArgument.slice(4) || []

    let applyOnObject = state.getInstance(instanceName)

    let theFunc = applyOnObject ? applyOnObject[funName] : null

    try {
      if (!theFunc && isOptionalFunction(funName)) { return cb([id, VOID]) }

      loadSymbolValuesToArguments(args)

      if (!theFunc) { tryToGetSUT() }

      if (!theFunc) { tryToGetLibraryObject() }

      if (!applyOnObject) {
        return cb([id, utils.toException('NO_INSTANCE ' + instanceName)])
      }

      if (!theFunc) {
        return cb([id, utils.toException('NO_METHOD_IN_CLASS ' + funName + ' ' +
          applyOnObject.constructor.name)])
      }

      const funReturn = theFunc.apply(applyOnObject, args)

      if (typeof funReturn === 'undefined') {
        return cb([id, VOID])
      }

      if (!utils.isPromise(funReturn)) {
        if (symbolNameToAssignTo) {
          state.setSymbol(symbolNameToAssignTo, funReturn)
        }

        return cb([id, funReturn])
      }

      funReturn.then(function (val) {
        if (symbolNameToAssignTo) {
          state.setSymbol(symbolNameToAssignTo, val)
        }

        cb([id, val])
      }).catch(err => { cb([id, utils.toException(err)]) })
    } catch (e) {
      cb([id, utils.toException(e)])
    }

    function tryToGetSUT () {
      const systemUnderTest = state.getSut(instanceName)

      if (systemUnderTest && systemUnderTest[funName]) {
        theFunc = systemUnderTest[funName]
        applyOnObject = systemUnderTest
      }
    }

    function tryToGetLibraryObject () {
      const libraryObject = state.getLibraryObject(instanceName, funName)
      if (libraryObject) {
        theFunc = libraryObject[funName]
        applyOnObject = libraryObject
      }
    }
  }

  this.callAndAssign = function (instructionArgument, cb) {
    const symbolName = instructionArgument.splice(2, 1)

    this.call(instructionArgument, cb, symbolName)
  }

  function loadSymbolValuesToArguments (args) {
    for (var i = 0; i < args.length; i++) {
      if (args[i].toString().indexOf('$') === 0) {
        args[i] = state.getSymbol(args[i].substr(1))
      }
    }
  }

  function isOptionalFunction (funName) {
    return (funName === 'beginTable' || funName === 'endTable' ||
      funName === 'reset' || funName === 'execute' || funName === 'table')
  }
}

module.exports = CallExecutor
