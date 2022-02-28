const express = require("express");
const fs = require('fs');
const { spawn, exec } = require('child_process');


var router = express.Router();
router.post("/startDev", function(req, res, next) {
  // const { contract_addr, chain_id } = req.body;
  // let config = getConfig('./config.json');
  // config.contract_addr = contract_addr;
  // config.chain_id = chain_id;
  // fs.writeFileSync('./config.json', JSON.stringify(config));
  // fs.writeFileSync('./../../lib/config.json', JSON.stringify(config));
  // console.log("complete");
  spawn('yarn dev', {cwd: './../../'});
  res.status(200)
});

module.exports = router;
