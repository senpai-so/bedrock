const { resolveSoa } = require('dns')
var express = require('express')
const fs = require('fs')

const getConfig = (path) => {
  const config = fs.existsSync(path) ? fs.readFileSync(path).toString() : '{}'
  return JSON.parse(config)
}

var router = express.Router()
router.post('/', function (req, res, next) {
  console.log("Saving CID")
  const { cid, assets } = req.body

  let config = getConfig('./config.json')
  config.cid = cid
  config.assets = assets

  // Save config for use by the /save endpoint
  fs.writeFileSync('./config.json', JSON.stringify(config))

  console.log("CID & Assets saved")
  res.sendStatus(200)
})

module.exports = router
