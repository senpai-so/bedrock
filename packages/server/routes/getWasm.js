var express = require('express')
var fs = require('fs')
var path = require('path')

var router = express.Router()
router.get('/', function (req, res, next) {
  res.status(200).json({
    wasm: fs
      .readFileSync(
        // Store the path better!!!
        path.join('../../contracts/bedrock/artifacts/bedrock_base.wasm')
      )
      .toString('base64')
  })
})

module.exports = router
