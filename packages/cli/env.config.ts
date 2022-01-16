import dotenv from 'dotenv';
dotenv.config({ path: '.env'});

export default {
  MAINNET_URL: process.env.MAINNET_URL ?? 'https://lcd.terra.dev',
  MAINNET_CHAIN_ID: process.env.MAINNET_CHAIN_ID ?? 'columbus-5',

  TESTNET_URL: process.env.TESTNET_URL ?? 'https://bombay-lcd.terra.dev',
  TESTNET_CHAIN_ID: process.env.TESTNET_CHAIN_ID ?? 'bombay-12',

  LOCALTERRA_URL: process.env.LOCALTERRA_URL ?? 'http://localhost:1317',
  LOCALTERRA_CHAIN_ID: process.env.LOCALTERRA_CHAIN_ID ?? 'http://localhost:1317',

  CODE_ID: 2351,
}