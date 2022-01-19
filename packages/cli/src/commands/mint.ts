import { getClient } from '../lib/getClient';
import { CacheContent, loadCache, saveCache } from "../utils/cache";
import { encryptedToRawKey } from "../utils/keys";
import { MintMsg } from "../lib/types";
import { executeTransaction } from "../utils/contract";


export const mint = async (
  env: string,
  pk: string,
  pass: string,
  cacheName: string,
) => {
  // Choose next asset
  const savedContent = loadCache(cacheName, env);
  const cacheContent: CacheContent = savedContent || { program: { contract_address: undefined, tokens_minted: [] }, items: undefined, env: env, cacheName: cacheName };
  if (typeof cacheContent.items === 'undefined') return;

  if (typeof cacheContent.program.tokens_minted === 'undefined') {
    cacheContent.program.tokens_minted = []
  }

  // Select our NFT to mint
  let mintMsg: MintMsg = { token_id: "", owner: undefined, token_uri: undefined, extension: undefined };
  const newAssets = cacheContent.items.filter(x => !cacheContent.program.tokens_minted.includes(x.token_id));

  if (newAssets.length === 0) {
    console.log("No NFTs left to mint :(")
    return;
  }

  // Load wallet & LCD client 
  const terra = await getClient(env);
  const key = encryptedToRawKey(pk, pass);
  const wallet = terra.wallet(key);

  const idx = Math.floor(Math.random() * newAssets.length)
  mintMsg = cacheContent.items[idx];
  mintMsg.owner = wallet.key.accAddress;

  const execMsg = { mint: mintMsg };
  console.log("ExecMsg:", execMsg);

  const { contract_address } = cacheContent.program;
  if (typeof contract_address === 'undefined') return;
  
  const result = await executeTransaction(terra, wallet, contract_address, execMsg);
  
  // If we reach here, mint succeeded
  const { wasm: { token_id } } = result.logs[0].eventsByType;
  cacheContent.program.tokens_minted.push(token_id[0]);
  saveCache(cacheName, env, cacheContent);
  console.log("Successfully minted new NFT!")
  console.log("token_id:", token_id[0]);
  console.log("txhash:", result.txhash);
}
