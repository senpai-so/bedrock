import pinataSDK from '@pinata/sdk';
import { isTxError, LCDClient, MsgInstantiateContract, MsgStoreCode, Wallet } from '@terra-money/terra.js';

import fs from 'fs';
import util from 'util';

import { CacheContent, saveCache } from '../utils/cache';
import { getClient } from '../lib/getClient';
import { encryptedToRawKey } from '../utils/keys';
import { Input, MintMsg, Metadata } from '../lib/types';
import { loadConfig } from '../utils/config';
import VARS from '../../env.config';
import path from 'path';

const WASM_PATH = "../../contracts/bedrock/artifacts/bedrock_base.wasm";

// Functionality

export const upload = async (
  cacheName: string,
  env: string,
  path: string, 
  pk: string,
  pass: string,
  config: string,
  pinataKey: string,
  pinataSecret: string,
  ) => {
    const cacheContent: CacheContent = { program: { contract_address: undefined, tokens_minted: [] }, items: undefined, env: env, cacheName: cacheName };

    // Upload files to IPFS
    const { assets, cid } = await ipfsUpload(path, pinataKey, pinataSecret);
    console.log("Asset upload complete");
    console.log("IPFS CID:", cid);
    cacheContent.items = assets;
    saveCache(cacheName, env, cacheContent);

    // Load user creds
    const terra = await getClient(env);
    const key = encryptedToRawKey(pk, pass);
    const wallet = terra.wallet(key);

    // Create contract
    if (assets.length == 0) {
      throw new Error("Asset folder must contain 1 or more correctly formatted assets.\n\
      Please ensure the assets are correctly formatted.");
    }

    const contract_address = await createContract(wallet, terra, config);
    cacheContent.program = {...cacheContent.program, contract_address: contract_address }
    saveCache(cacheName, env, cacheContent);

    console.log("Contract created at", contract_address);
}



const ipfsUpload = async (dirPath: string, apiKey: string, apiSecret: string) => {

  console.log() // Break line before upload logs

  const pinata = pinataSDK(apiKey, apiSecret);

  const { authenticated } = await pinata.testAuthentication();
  if (!authenticated) throw new Error("Invalid Pinata JWT");

  // Grab all image files
  const files = fs.readdirSync(path.resolve(dirPath));
  const images = new Set(files.filter(name => !name.includes('.json')));
    
  // Upload in the format Storefront expects
  let cid: string;
  try {  
    cid = (await pinata.pinFromFS(path.resolve(dirPath))).IpfsHash;;
  } catch (error) {
    throw error;
  }
  const assets: MintMsg[] = [];
  
  images.forEach( (file, idx) => {
    console.log(`Uploading ${file}...`);
    const rootName = file.split('.')[0];
    if (files.includes(rootName + '.json')) {
      const contents = fs.readFileSync(dirPath + '/' + rootName + '.json', 'utf8');
      let msg: MintMsg = {
        token_id: rootName,
        owner: undefined,
        token_uri: undefined,
        extension: JSON.parse(contents) as Metadata,
      };
      if (msg.extension) {
        msg.extension = {...msg.extension, image: `https://ipfs.io/ipfs/${cid}/${file}`}
      }
      assets.push(msg);
    }
  });

  return { assets, cid };
}

const createContract = async (
  wallet: Wallet,
  terra: LCDClient,
  configPath: string,
  ): Promise<string> => {

  console.log() // Break line before contract logs
  
  const config = loadConfig(configPath)

  if (typeof config === 'undefined') {
    throw new Error("could not load config");
  }

  console.log("Config:", config);
  // Use uploaded code to create a new contract
  const instantiate = new MsgInstantiateContract(
    wallet.key.accAddress,
    wallet.key.accAddress,
    VARS.CODE_ID, // Add option to update the code
    { 
      name: config.name,
      symbol: config.symbol,
      price: config.price, // Refactor to avoid this
      treasury_account: config.treasury_account,
      start_time: config.start_time,
      end_time: config.end_time,
      max_token_count: config.max_token_count,
      is_mint_public: config.is_mint_public,
    },
  );

  const instantiateTx = await wallet.createAndSignTx({ 
    msgs: [instantiate],
  });
  const instantiateTxResult = await terra.tx.broadcast(instantiateTx);

  if (isTxError(instantiateTxResult)) {
    throw new Error(
      `instantiate failed. code: ${instantiateTxResult.code}, codespace: ${instantiateTxResult.codespace}, raw_log: ${instantiateTxResult.raw_log}`
    );
  }
  const { instantiate_contract: { contract_address } } = instantiateTxResult.logs[0].eventsByType;
  console.log("Contract instantiated");
  console.log("Contract address:", contract_address);

  return contract_address[0];
}
