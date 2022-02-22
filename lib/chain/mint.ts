import { getClient } from './getClient';
import { CacheContent } from 'lib/types';
import { encryptedToRawKey } from '../../packages/cli/src/utils/keys'
import { MintMsg } from "../../packages/cli/src/lib/types";
import { isTxError, LCDClient, MsgExecuteContract } from "@terra-money/terra.js";
import { create } from 'ipfs-http-client';
import { concat as uint8ArrayConcat, toString as uint8ArrayToString } from 'uint8arrays'
import { contractAddress } from 'lib/config';


export const mint = async (
  wallet: any,
  cacheContent: CacheContent,
) => {
  if (cacheContent.contract_addr == '') return;
  if (cacheContent.assets.length == 0) return;
  if (cacheContent.chain_id == '') return;

  // Load wallet & LCD client 
  const lcd = await getClient(cacheContent.chain_id);

  const { tokens } = await lcd.wasm.contractQuery(cacheContent.contract_addr, {
    all_tokens: { limit: undefined, start_after: undefined } // ensure all_tokens isn't bugged
  });
 
  console.log()

  // Select our NFT to mint
  let mintMsg: MintMsg = { token_id: "", owner: undefined, token_uri: undefined, extension: undefined };
  const newAssets = cacheContent.assets.filter(asset => !tokens.includes(asset.split('.')[0]));

  if (newAssets.length === 0) {
    console.log("No NFTs left to mint :(")
    return;
  }

  const assetJson = `${newAssets[0].split('.')[0]}.json`
  const ipfsPath = `${cacheContent.cid}/${assetJson}`
  const tokenData = JSON.parse(await getIPFSContents(ipfsPath));

  mintMsg = {
    token_id: newAssets[0].split('.')[0],
    owner: wallet.walletAddress,
    token_uri: `ipfs://${cacheContent.cid}/${assetJson}`,
    extension: tokenData.metadata
  };

  const execMsg = { mint: mintMsg };
  console.log("ExecMsg:", execMsg);
  if (cacheContent.contract_addr === '') return;
  
  const execute = new MsgExecuteContract(
    wallet.walletAddress, 
    cacheContent.contract_addr, 
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

  return token_id[0];
}

const getIPFSContents = async (path: string) => {
  const url = 'https://dweb.link/api/v0';
  if (true) console.log("");
  const ipfs = create({ url });

  const bufs: Uint8Array[] = []
  for await (const buf of ipfs.cat(path)) {
    bufs.push(buf);
  }
  const data = uint8ArrayConcat(bufs);
  return uint8ArrayToString(data);
}