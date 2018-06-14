/**
 * Created by noam on 1/19/16.
 */

function toException (e) {
  if (e.stack) { return '__EXCEPTION__:' + e.stack.toString() }

  return '__EXCEPTION__:message:<<' + e.toString() + '>>'
}

function isPromise (obj) {
  return obj && obj.then && typeof obj.then === 'function' &&
    obj.catch && typeof obj.catch === 'function'
}

exports.toException = toException
exports.isPromise = isPromise
