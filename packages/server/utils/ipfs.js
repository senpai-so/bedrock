const IPFS = require('ipfs-core')

async function getAssets(cid) {
  console.log("Entered getAssets function")
  const ipfs = await IPFS.create()

  if (ipfs.isOnline()) { console.log( "IPFS ONLINE") }
  else { console.log("IPFS OFFILINE")}
  let idx = 1 // TODO: DELETE THIS
  let docs = []
  for await (const doc of ipfs.ls(cid)) {
    console.log(idx)
    idx += 1
    docs.push(doc)
  }
  return docs
}

module.exports = getAssets