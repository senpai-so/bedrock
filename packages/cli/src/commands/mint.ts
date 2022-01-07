import { isTxError, LCDClient, MnemonicKey, MsgExecuteContract } from "@terra-money/terra.js"
import fs from 'fs';

import { getClient } from '../lib/getClient';
import { CacheContent, loadCache, saveCache } from "../utils/cache";
import { Manifest } from "./upload";


export const mint = async (
  env: string,
  mnemonic: string,
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
  // need to randomly select the NFTs
  let mintMsg: Manifest = { token_id: "", name: "", token_uri: undefined, owner: undefined };
  for (const item of cacheContent.items) {
    if (!cacheContent.program.tokens_minted.includes(item.token_id)) {
      mintMsg = item;
      break;
    }
  }
  // no assets left to mint
  if (mintMsg.token_id == "" || mintMsg.name == "") {
    console.log("No NFTs left to mint :(")
    return;
  };

  // Load wallet & LCD client 
  const terra = await getClient(env);
  const mPhrase = fs.readFileSync(mnemonic).toString();
  const key = new MnemonicKey({mnemonic: mPhrase});
  const wallet = terra.wallet(key);
  mintMsg.owner = wallet.key.accAddress;

  const { contract_address } = cacheContent.program;
  const execMsg = { mint: mintMsg };
  if (typeof contract_address === 'undefined') return;

  const execute = new MsgExecuteContract(
    wallet.key.accAddress, 
    contract_address, 
    execMsg
  );
  const executeTx = await wallet.createAndSignTx({ msgs: [execute] });
  const executeTxResult = await terra.tx.broadcast(executeTx);

  if (isTxError(executeTxResult)) {
    console.log("Mint failed.")
    throw new Error(
      `mint failed. code: ${executeTxResult.code}, codespace: ${executeTxResult.codespace}, raw_log: ${executeTxResult.raw_log}`
    );
  }

  // Success
  cacheContent.program.tokens_minted.push(mintMsg.token_id);
  saveCache(cacheName, env, cacheContent);
  console.log("Successfully minted new NFT!")

  const { wasm: { token_id } } = executeTxResult.logs[0].eventsByType;
  console.log("token_id:", token_id);
}