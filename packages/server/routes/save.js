var express = require('express')
const fs = require('fs')

const getConfig = (path) => {
  const config = fs.existsSync(path) ? fs.readFileSync(path).toString() : '{}'
  return JSON.parse(config)
}

var router = express.Router()
router.post('/', function (req, res, next) {
  const { contract_addr, chain_id } = req.body

  let config = getConfig('./config.json')
  config.contract_addr = contract_addr
  config.chain_id = chain_id

  // Write config to two paths
  fs.writeFileSync('./config.json', JSON.stringify(config)) // used by setup when someone wants to update their config
  fs.writeFileSync('./../../lib/config.json', JSON.stringify(config)) // "live" config that is useed by the Storefront

  res.status(200)
})

module.exports = router
