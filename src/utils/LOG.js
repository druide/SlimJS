/**
 * Created by noamc on 1/3/16.
 */

const dgram = require('dgram')
const client = dgram.createSocket('udp4')

module.exports.LOG = function (msg) {
  const message = Buffer.from(msg)
  client.send(message, 0, message.length, 9999, 'localhost', function () { })
}
