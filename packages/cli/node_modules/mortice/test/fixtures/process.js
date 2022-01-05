const mortice = require('../../')
const delay = require('delay')

const counts = {
  read: 0,
  write: 0
}

async function lock (type, muxex, timeout = 0) {
  counts[type]++
  const index = counts[type]

  console.info(`${type} ${index} waiting`)

  const release = await muxex[`${type}Lock`]()

  console.info(`${type} ${index} start`)

  if (timeout) {
    await delay(timeout)
  }

  console.info(`${type} ${index} complete`)

  release()
}

async function run () {
  const mutex = mortice()

  // queue up read/write requests, the third read should block the second write
  lock('write', mutex)
  lock('read', mutex)
  lock('read', mutex)
  lock('read', mutex, 500)
  lock('write', mutex)
  lock('read', mutex)
}

run()
  .then(() => {})
