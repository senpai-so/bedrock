const mortice = require('../../')
const delay = require('delay')

const counts = {
  read: 0,
  write: 0
}

async function lock (type, muxex, timeout = 0) {
  counts[type]++
  const index = counts[type]

  globalThis.postMessage({
    type: 'log',
    message: `${type} ${index} waiting`
  })

  const release = await muxex[`${type}Lock`]()

  globalThis.postMessage({
    type: 'log',
    message: `${type} ${index} start`
  })

  if (timeout) {
    await delay(timeout)
  }

  globalThis.postMessage({
    type: 'log',
    message: `${type} ${index} complete`
  })

  release()

  if (type === 'read' && index === 4) {
    globalThis.postMessage({
      type: 'done'
    })
  }
}

module.exports = () => {
  const mutex = mortice({
    singleProcess: true
  })

  lock('write', mutex)
  lock('read', mutex)
  lock('read', mutex)
  lock('read', mutex, 500)
  lock('write', mutex)
  lock('read', mutex)
}
