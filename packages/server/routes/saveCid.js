var express = require('express')
const fs = require('fs')

const getCache = (path) => {
  return JSON.parse(
    fs.existsSync(path) ? fs.readFileSync(path).toString() : '{}'
  )
}

const generateAssets = (tokenCount, fileExt) => {
  const assets = []
  for (let i=1; i<=tokenCount; i++) {
    assets.push(`${i}` + fileExt)
  }
  return assets
}

var router = express.Router()
router.post('/', function (req, res, next) {
  const { cid, tokenCount, fileExt } = req.body

  if (!['.jpg', '.jpeg', '.png'].includes(fileExt)) {
    res.sendStatus(400)
  }

  let cache = getCache('./cache.json')
  cache.cid = cid
  cache.assets = generateAssets(tokenCount, fileExt)

  // Save config for use by the /save endpoint
  fs.writeFileSync('./cache.json', JSON.stringify(cache))

  res.status(200)
})

module.exports = router
