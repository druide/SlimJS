/**
 * Created by noam on 1/18/16.
 */

const dgram = require('dgram')

const server = dgram.createSocket('udp4')

server.on('error', function (err) {
  console.error('server error:\n' + err.stack)
})

server.on('message', function (data, rinfo) {
  console.log(data.toString())
})

server.bind(9999)
