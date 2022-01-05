'use strict'

const varint = require('varint')

module.exports = (buf) => {
  if (!(buf instanceof Uint8Array)) {
    throw new Error('arg needs to be a Uint8Array')
  }

  const result = []

  while (buf.length > 0) {
    const num = varint.decode(buf)
    result.push(num)
    buf = buf.slice(varint.decode.bytes)
  }

  return result
}
