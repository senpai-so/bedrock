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
  const { cid, assets } = req.body; // Make sure these come in as expected & eensure they are not undefined/''
  let config = getConfig('./config.json');
  config.cid = cid;
  config.assets = assets;
  fs.writeFileSync('./config.json', JSON.stringify(config));
  console.log("complete", config);
  res.status(200)
});

module.exports = router;

/**
 * TODO
 *  - Save assets to cache before going to config page
 *    - saveConfig => load cache, if exists ? update fields for each config : save config then throw error
 *      - mv ./config.json ./../../lib/config.json
 */