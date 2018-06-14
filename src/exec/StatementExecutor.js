/**
 * Created by noam on 1/5/16.
 */

const SlimHelperLibrary = require('./../SlimHelperLibrary')
const ImportExecutor = require('./ImportExecutor')
const MakeExecutor = require('./MakeExecutor')
const ExecutionManager = require('./ExecutionManager')
const CallExecutor = require('./CallExecutor')
const AssignExecutor = require('./AssignExecutor')

function StatementExecutor (arrayOfSearchPaths) {
  var execManager = new ExecutionManager(arrayOfSearchPaths)

  var importer = new ImportExecutor(execManager)
  var maker = new MakeExecutor(execManager)
  var caller = new CallExecutor(execManager)
  var assigner = new AssignExecutor(execManager)

  addSlimHelperLibrary(this)

  this.import = importer.import
  this.make = maker.make
  this.call = caller.call
  this.callAndAssign = caller.callAndAssign
  this.assign = assigner.assign

  this.setInstance = function (name, fixture) {
    execManager.setInstance(name, fixture)
  }

  this.instance = function (name) {
    return execManager.getInstance(name)
  }

  function addSlimHelperLibrary (executer) {
    var slimHelper = new SlimHelperLibrary()
    slimHelper.setStatementExecutor(executer)

    execManager.pushToLibrary(slimHelper.ACTOR_INSTANCE_NAME, slimHelper)
  }
}

module.exports = StatementExecutor
