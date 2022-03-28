import { MsgMigrateContract, Wallet } from '@terra-money/terra.js';

import { getClient } from '../lib/getClient';
import { encryptedToRawKey } from '../utils/keys';

export const migrate = async (
  env: string,
  pk: string,
  pass: string,
  codeId: number,
  contractAddr: string,
) => { 
  // old: 57733
  // new: 57734
  
  const terra = await getClient(env);
  const key = encryptedToRawKey(pk, pass);
  const wallet = new Wallet(terra, key);

  const msg = new MsgMigrateContract(
    wallet.key.accAddress,
    contractAddr,
    codeId,
    {}
  )
  
  const tx = await wallet.createAndSignTx({ msgs: [msg] });
  const txResult = await terra.tx.broadcast(tx);
}

