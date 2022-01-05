const mortice = require('../../')

async function read (muxex) {
  const release = await muxex.readLock()

  try {
    console.info('read 1')

    throw new Error('err')
  } finally {
    release()
  }
}

async function write (muxex) {
  const release = await muxex.writeLock()

  await new Promise((resolve) => {
    console.info('write 1')

    resolve()
  })

  release()
}

async function run () {
  const mutex = mortice()

  read(mutex)
    .catch(() => {})
  write(mutex)
}

run()
  .then(() => {})
