import { getClient } from './getClient'
import { CacheContent, Metadata } from 'lib/types'
import { MintMsg } from '../../packages/cli/src/lib/types'
import { Coin, isTxError, MsgExecuteContract } from '@terra-money/terra.js'
import { create } from 'ipfs-http-client'
import {
  concat as uint8ArrayConcat,
  toString as uint8ArrayToString
} from 'uint8arrays'
import { getAllTokens } from './getTokens'

// https://stackoverflow.com/questions/15585216/how-to-randomly-generate-numbers-without-repetition-in-javascript
function getRandomNums(n: number, max: number) {
  const result: number[] = []
  for (let i = 0; i < n; i++) {
    let x = Math.floor(Math.random() * max)
    while (result.includes(x)) {
      x = Math.floor(Math.random() * max)
    }
    result.push(x)
  }
  return result 
};

export const mint = async (
  wallet: any, 
  cacheContent: CacheContent, 
  count: number,
) => {
  if (cacheContent.contract_addr == '') return
  if (cacheContent.assets.length == 0) return
  if (cacheContent.chain_id == '') return

  // Load wallet & LCD client
  const lcd = await getClient(cacheContent.chain_id)
  let tokens = await getAllTokens(lcd, cacheContent.contract_addr) || []

  // Find which tokens have not been minted
  const newAssets = cacheContent.assets.filter(
    (asset) => !tokens.includes(asset.split('.')[0])
  )

  if (newAssets.length < count) {
    console.log('No NFTs left to mint :(')
    return
  }
  if (cacheContent.contract_addr === '') return

  const indices = getRandomNums(count, newAssets.length)

  const execMsgs = []
  for (const i of indices) {
    const assetRoot = newAssets[i].split('.')[0]
    const roomSplit = assetRoot.split('-')

    const extension: Metadata = {
      image: `https://bedrock.mypinata.cloud/ipfs/${cacheContent.cid}/${assetRoot}.png`,
      name: `Room ${roomSplit[0]}`,
      description: `#${roomSplit[1]}`,
      animation_url: undefined,
      attributes: [ { trait_type: "Room #", value: `${roomSplit[0]}`, display_type: undefined } ],
      background_color: undefined,
      external_url: undefined,
      image_data: undefined,
      youtube_url: undefined,
    }

    const mintMsg: MintMsg = {
      token_id: newAssets[i].split('.')[0],
      owner: wallet.walletAddress,
      token_uri: undefined,
      extension: extension,
    }

    const execMsg = { mint: mintMsg }
    execMsgs.push(
      new MsgExecuteContract(
        wallet.walletAddress,
        cacheContent.contract_addr,
        execMsg,
        [new Coin(cacheContent.config.price.denom, cacheContent.config.price.amount)]
      )
    )
  }  

  const sign_res = await wallet.sign({ msgs: execMsgs })
  const executeTxResult = await lcd.tx.broadcast(sign_res.result)

  if (isTxError(executeTxResult)) {
    console.log('Mint failed.')
    throw new Error(
      `mint failed. code: ${executeTxResult.code}, codespace: ${executeTxResult.codespace}, raw_log: ${executeTxResult.raw_log}`
    )
  }

  // If we reach here, mint succeeded
  const {
    wasm: { token_id }
  } = executeTxResult.logs[0].eventsByType

  return token_id[0]
}

const getIPFSContents = async (path: string) => {
  const url = 'https://dweb.link/api/v0'
  const ipfs = create({ url })

  const bufs: Uint8Array[] = []
  for await (const buf of ipfs.cat(path)) {
    bufs.push(buf)
  }
  const data = uint8ArrayConcat(bufs)
  return uint8ArrayToString(data)
}
