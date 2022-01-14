import { IPFS, create } from 'ipfs-core';
import { Coin, isTxError, LCDClient, MsgInstantiateContract, MsgStoreCode, Wallet } from '@terra-money/terra.js';

import fs from 'fs';
import path from 'path';

import { CacheContent, saveCache } from '../utils/cache';
import { getClient } from '../lib/getClient';
import { encryptedToRawKey } from '../utils/keys';
import { Input, MintMsg, Metadata, InitMsg } from '../lib/types';
import { loadConfig } from '../utils/config';
import { config } from 'yargs';


const IMG_TYPE = ".jpg";
const WASM_PATH = "../../contracts/bedrock/contracts/bedrock-base/bedrock_base.wasm";


// Functionality

export const upload = async (
  cacheName: string,
  env: string,
  path: string, 
  pk: string,
  pass: string,
  config: string,
  ) => {
    const node = await create();
    const cacheContent: CacheContent = { program: { contract_address: undefined, tokens_minted: [] }, items: undefined, env: env, cacheName: cacheName };

    // Upload files to IPFS
    const assets = await ipfsUpload(node, path);
    cacheContent.items = assets;
    saveCache(cacheName, env, cacheContent);

    // Load user creds
    const terra = await getClient(env);

    const key = encryptedToRawKey(pk, pass);
    const wallet = terra.wallet(key);

    // Create contract
    if (assets.length == 0) {
      throw new Error("Asset folder must contain 1 or more correctly formatted assets. \
      Please ensure the assets are correctly formatted.");
    }
    const contract_address = await createContract(wallet, terra, assets.length, config);
    cacheContent.program = {...cacheContent.program, contract_address: contract_address }
    saveCache(cacheName, env, cacheContent);
}

const ipfsUpload = async (node: IPFS, dirPath: string) => {

  console.log() // Break line before upload logs

  const uploadToIpfs = async (source: any) => {
    const { cid } = await node.add(source).catch();
    return cid;
  }

  const names = new Set(
    fs
    .readdirSync(dirPath) // will these be relative or absolute???
    .map( fName => fName.split('.')[0])
  );
  
  const assets: MintMsg[] = [];

  for (const fName of Array.from(names)) {

    // Upload media to IPFS
    const media = fs.readFileSync(path.join(dirPath, fName + IMG_TYPE)).toString()
    const mediaHash = await uploadToIpfs(media);
    const mediaUrl = `https://ipfs.io/ipfs/${mediaHash}`;

    // Read metadata & manifest from the input
    const input: Input = JSON.parse(fs.readFileSync(path.join(dirPath, fName + '.json')).toString());
    const metadata: Metadata = input.metadata;
    metadata.image = mediaUrl;

    // Upload metadata to IPFS
    const metadataHash = await uploadToIpfs(Buffer.from(JSON.stringify(metadata)));
    const metadataUrl = `https://ipfs.io/ipfs/${metadataHash}`;
    
    // Store token details
    const msg: MintMsg = {...input.manifest, token_uri: metadataUrl};
    msg.token_uri = metadataUrl;
    assets.push(msg);
  };

  return assets
}

const createContract = async (
  wallet: Wallet,
  terra: LCDClient,
  tokenSupply: number,
  configPath: string,
  ): Promise<string> => {

  console.log() // Break line before contract logs

  // Upload code for contract
  const storeCode = new MsgStoreCode(
    wallet.key.accAddress,
    fs.readFileSync(WASM_PATH).toString('base64')
  );
  const storeCodeTx = await wallet.createAndSignTx({ msgs: [storeCode] });
  const storeCodeTxResult = await terra.tx.broadcast(storeCodeTx);

  if (isTxError(storeCodeTxResult)) {
    throw new Error(
      `store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`
    );
  }
  const { store_code: { code_id } } = storeCodeTxResult.logs[0].eventsByType;

  const msg = loadConfig(configPath)

  if (typeof msg === 'undefined') {
    throw new Error("could not load config");
  }

  console.log("InitMsg:", msg);
  // Use uploaded code to create a new contract
  const instantiate = new MsgInstantiateContract(
    wallet.key.accAddress,
    undefined,
    +code_id[0],
    { 
      name: msg.name,
      symbol: msg.symbol,
      price: msg.price, // Refactor to avoid this
      treasury_account: msg.treasury_account,
      start_time: msg.start_time,
      end_time: msg.end_time,
      max_token_count: msg.max_token_count,
      is_mint_public: msg.is_mint_public,
    },
  );

  const { sequence, account_number } = await wallet.accountNumberAndSequence();
  const instantiateTx = await wallet.createAndSignTx({ 
    msgs: [instantiate], 
    sequence: sequence + 1, 
    accountNumber: account_number
  });
  const instantiateTxResult = await terra.tx.broadcast(instantiateTx);

  if (isTxError(instantiateTxResult)) {
    throw new Error(
      `instantiate failed. code: ${instantiateTxResult.code}, codespace: ${instantiateTxResult.codespace}, raw_log: ${instantiateTxResult.raw_log}`
    );
  }
  const { instantiate_contract: { contract_address } } = instantiateTxResult.logs[0].eventsByType;
  console.log("Contract instantiated")
  console.log("Contract address:", contract_address);

  return contract_address[0];
}
