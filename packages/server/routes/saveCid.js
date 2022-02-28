var express = require("express");
const fs = require('fs');

const getConfig = (path) => {
  const config = fs.existsSync(path) 
    ? fs.readFileSync(path).toString()
    : '{}';
  return JSON.parse(config);
}

var router = express.Router();
router.post("/", function(req, res, next) {
  const { cid, assets } = req.body;
  let config = getConfig('./config.json');
  config.cid = cid;
  config.assets = assets;
  fs.writeFileSync('./config.json', JSON.stringify(config));
  console.log("complete", config);
  res.status(200)
});

module.exports = router;
