var express = require("express");
const fs = require('fs');

var router = express.Router();
router.post("/", function(req, res, next) {
  console.log(typeof req.body);
  console.log(req.body);
  fs.writeFileSync('./config.json', JSON.stringify(req.body));
  console.log("complete");
  res.status(200)
});

module.exports = router;