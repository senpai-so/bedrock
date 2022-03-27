import { getClient } from '../lib/getClient';
import { TransferNftMsg } from '../lib/types';
import { loadCache } from '../utils/cache';
import { executeTransaction } from '../utils/contract';
import { encryptedToRawKey } from '../utils/keys';

export const transfer = async (
  env: string,
  pk: string,
  pass: string,
  cacheName: string,
  _recipient: string,
  _token_id: string
) => { 
  const cachedContent = loadCache(cacheName, env);
  if (typeof cachedContent === 'undefined') 
    throw new Error("cache content not found");

  const terra = await getClient(env);
  const key = encryptedToRawKey(pk, pass);
  const wallet = terra.wallet(key);

  const { contract_address } = cachedContent.program;
  if (typeof contract_address === 'undefined')
    throw new Error("contract_address not found");

  let transferMsg: TransferNftMsg = {
    recipient: _recipient,
    token_id: _token_id,
  }
  let execMsg = { transfer_nft: transferMsg }
  console.log("ExecMsg:", transferMsg);

  const result = await executeTransaction(terra, wallet, contract_address, execMsg);

  console.log("Transfer successful!");
  console.log("txhash:", result.txhash);
}