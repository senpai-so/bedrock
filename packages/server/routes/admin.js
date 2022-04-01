const express = require('express')
const { spawn } = require('child_process')

let processCount = 0

var router = express.Router()
router.post('/startDev', function (req, res, next) {
  if (processCount > 0) {
    next(new Error('Child process already running. Check localhost:3002'))
  }

  processCount += 1

  const dAppProc = spawn('yarn', ['dev'], { cwd: './../../', shell: true })

  dAppProc.stderr.on('data', (data) => {
    console.error(data.toString())
  })

  dAppProc.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  res.status(200).json({ success: true })
})

module.exports = router
