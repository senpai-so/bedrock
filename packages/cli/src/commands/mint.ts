import { isTxError, LCDClient, MnemonicKey, MsgExecuteContract, RawKey } from "@terra-money/terra.js"
import { create } from 'ipfs-core';
import axios from 'axios';

import fs from 'fs';

import { getClient } from '../lib/getClient';
import { CacheContent, loadCache, saveCache } from "../utils/cache";
import { encryptedToRawKey } from "../utils/keys";
import { MintMsg } from "../lib/types";


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

  const idx = Math.floor(Math.random() * newAssets.length) // random idx 
  mintMsg = cacheContent.items[idx];

  // Load wallet & LCD client 
  const terra = await getClient(env);
  const key = encryptedToRawKey(pk, pass);
  const wallet = terra.wallet(key);
  mintMsg.owner = wallet.key.accAddress;

  const { contract_address } = cacheContent.program;
  const execMsg = { mint: mintMsg };

  console.log("ExecMsg:", execMsg);

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

  console.log("token_id:", token_id[0]);
  console.log("txhash:", executeTxResult.txhash);
}
