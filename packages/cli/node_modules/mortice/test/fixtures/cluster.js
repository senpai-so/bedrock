const cluster = require('cluster')
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

  if (type === 'read' && index === 4) {
    process.send('done')
  }
}

async function run () {
  const mutex = mortice()

  if (cluster.isMaster) {
    cluster.on('message', (worker, message) => {
      if (message === 'done') {
        worker.kill()
      }
    })

    cluster.fork()
  } else {
    // queue up read/write requests, the third read should block the second write
    lock('write', mutex)
    lock('read', mutex)
    lock('read', mutex)
    lock('read', mutex, 500)
    lock('write', mutex)
    lock('read', mutex)
  }
}

run()
  .then(() => {})
