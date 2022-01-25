import { getClient } from '../lib/getClient';
import { CacheContent, loadCache, saveCache } from "../utils/cache";
import { encryptedToRawKey } from "../utils/keys";
import { MintMsg } from "../lib/types";
import { isTxError, MsgExecuteContract } from '@terra-money/terra.js';


export const mint = async (
  wallet: any,
  cacheName: string,
  env: string,
) => {
  // Choose next asset
  const savedContent = loadCache(cacheName, env);
  const cacheContent: CacheContent = savedContent || { program: { contract_address: undefined, tokens_minted: [] }, items: undefined, env: env, cacheName: cacheName };
  if (typeof cacheContent.items === 'undefined') return;

  if (typeof cacheContent.program.tokens_minted === 'undefined') {
    cacheContent.program.tokens_minted = []
  }

  if (typeof cacheContent.env === 'undefined' || cacheContent.env == '') return; // do this better

  // Select our NFT to mint
  let mintMsg: MintMsg = { token_id: "", owner: undefined, token_uri: undefined, extension: undefined };
  const newAssets = cacheContent.items.filter(x => !cacheContent.program.tokens_minted.includes(x.token_id));

  if (newAssets.length === 0) {
    console.log("No NFTs left to mint :(")
    return;
  }

  // Load wallet & LCD client 
  const lcd = await getClient(cacheContent.env);

  const idx = Math.floor(Math.random() * newAssets.length)
  mintMsg = cacheContent.items[idx];
  mintMsg.owner = wallet.walletAddress;

  const execMsg = { mint: mintMsg };
  console.log("ExecMsg:", execMsg);

  const { contract_address } = cacheContent.program;
  if (typeof contract_address === 'undefined') return;
  
  // const result = await executeTransaction(terra, wallet., contract_address, execMsg);
  const execute = new MsgExecuteContract(
    wallet.walletAddress, 
    contract_address, 
    execMsg
  );

  const sign_res = await wallet.sign({ msgs: [execute]})
  const executeTxResult = await lcd.tx.broadcast(sign_res.result)

  if (isTxError(executeTxResult)) {
    console.log("Mint failed.")
    throw new Error(
      `mint failed. code: ${executeTxResult.code}, codespace: ${executeTxResult.codespace}, raw_log: ${executeTxResult.raw_log}`
    );
  }
  
  // If we reach here, mint succeeded
  const { wasm: { token_id } } = executeTxResult.logs[0].eventsByType;
  cacheContent.program.tokens_minted.push(token_id[0]);
  saveCache(cacheName, env, cacheContent);
  console.log("Successfully minted new NFT!")
  console.log("token_id:", token_id[0]);
  console.log("txhash:", executeTxResult.txhash);

  return token_id;
}
