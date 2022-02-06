import { LCDClient } from "@terra-money/terra.js";
import VARS from '../env.config';

export const getClient = async (env: string): Promise<LCDClient> => {
  let client: LCDClient;
  let url: string;
  let chainId: string;

  switch(env.toLowerCase()) {
    case 'mainnet':
      url = VARS.MAINNET_URL;
      chainId = VARS.MAINNET_CHAIN_ID;
      break;
    case 'testnet':
      url = VARS.TESTNET_URL;
      chainId = VARS.TESTNET_CHAIN_ID;
      break;
    case 'local':
      url = VARS.LOCALTERRA_URL;
      chainId = VARS.LOCALTERRA_CHAIN_ID;
      break;
    default:
      console.log("Invalid value for \'env\'");
      console.log("Using values for local");
      url = VARS.LOCALTERRA_URL;
      chainId = VARS.LOCALTERRA_CHAIN_ID;
      break;
  }
  
  client = new LCDClient({
    URL: url,
    chainID: chainId
  });

  return client
}