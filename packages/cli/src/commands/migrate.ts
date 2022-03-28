import fs from 'fs';
import path from 'path';

import { MsgMigrateContract, Wallet } from '@terra-money/terra.js';

import { Config, MigrateMsg } from '../lib/types';
import { getClient } from '../lib/getClient';
import { encryptedToRawKey } from '../utils/keys';

export const migrate = async (
  env: string,
  pk: string,
  pass: string,
  codeId: number,
  contractAddr: string,
  version: string,
  configPath?: string,
) => {
  const terra = await getClient(env);
  const key = encryptedToRawKey(pk, pass);
  const wallet = new Wallet(terra, key);
  let migrateMsg: MigrateMsg = { version, config: undefined };

  if (configPath) {
    const content = fs.readFileSync(path.resolve(configPath), 'utf8');
    migrateMsg.config = JSON.parse(content) as Config;
  }

  const msg = new MsgMigrateContract(
    wallet.key.accAddress,
    contractAddr,
    codeId,
    migrateMsg
  )
  
  const tx = await wallet.createAndSignTx({ msgs: [msg] });
  const txResult = await terra.tx.broadcast(tx);
}

