import { LCDClient } from "@terra-money/terra.js";

export const getClient = async (network: string): Promise<LCDClient> => {
  let url: string, chainId: string;

  switch(network) {
    case 'mainnet':
      url = 'https://lcd.terra.dev';
      chainId = 'columbus-5';
      break;
    case 'testnet':
      url = 'https://bombay-lcd.terra.dev';
      chainId = 'bombay-12';
      break;
    case 'local':
      url = 'http://localhost:1317';
      chainId = 'localterra';
      break;
    default:
      console.log("Invalid value for \'env\'");
      console.log("Using values for localterra");
      url = 'http://localhost:1317';
      chainId = 'localterra';
      break;
  }
  
  const client = new LCDClient({
    URL: url,
    chainID: chainId
  });

  return client
}