#! /usr/bin/env node

const path = require('path')
const fs = require('fs')
const SlimTcpServer = require('./tcp/SlimTcpServer.js')
const StatementExecutor = require('./exec/StatementExecutor.js')
const utils = require('./exec/ExecUtils')

const classpath = process.argv[process.argv.length - 2]
const arrayOfSearchPaths = classpath.split(path.delimiter)
const port = process.argv[process.argv.length - 1]
const BYE = 'bye'

SlimJS(port, arrayOfSearchPaths)

function SlimJS (port, arrayOfSearchPaths) {
  const statementExecutor = new StatementExecutor(arrayOfSearchPaths)

  const tcpSlimServer = new SlimTcpServer(port, onReceivedInstructionSet)

  tcpSlimServer.setOnInstructionArrived(onReceivedInstructionSet)
  tcpSlimServer.start()

  function onReceivedInstructionSet (instructionSet) {
    const returnValues = []

    let currentInstructionIndex = 0

    if (instructionSet === BYE) {
      return exit(() => {
        tcpSlimServer.writeResult(returnValues)
        process.exit(0)
      })
    }

    executeInstruction(instructionSet[0], onInstructionExecutionResult)

    function onInstructionExecutionResult (result) {
      returnValues.push(result)

      currentInstructionIndex++

      if (wasLastInstructionExecuted(result)) {
        tcpSlimServer.writeResult(returnValues)
        // onFinalInstructionExecuted(returnValues);
      } else {
        executeInstruction(
          instructionSet[currentInstructionIndex],
          onInstructionExecutionResult
        )
      }
    }

    function wasLastInstructionExecuted (result) {
      return result === BYE || currentInstructionIndex === instructionSet.length
    }
  }

  function executeInstruction (instructionArguments, cb) {
    const command = instructionArguments[1]

    statementExecutor[command](instructionArguments, cb)
  }

  function exit (cb) {
    const promises = []
    for (let i = 0; i < arrayOfSearchPaths.length; i++) {
      const jsPath = path.resolve(
        path.join(arrayOfSearchPaths[i], 'on-exit.js')
      )
      if (fileExists(jsPath)) {
        const result = require(jsPath)()
        if (utils.isPromise(result)) {
          promises.push(result.catch(console.error))
        }
      }
    }
    Promise.all(promises).then(cb)
  }

  function fileExists (jsPath) {
    try {
      fs.accessSync(jsPath, fs.F_OK)
      return true
    } catch (e) {
      return false
    }
  }
}
