#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { mint } from './commands/mint';
import { transfer } from './commands/transfer';
import { upload } from './commands/upload';


const argv = yargs(hideBin(process.argv))
  .command("upload", "uploads asset data", yargs => {
    yargs.positional("source", {
      require: true,
      describe: "File path to assets folder",
    })
    .options({
      env: { 
        type: "string",
        alias: "e",
        demandOption: true,
        description: "Chain environment",
        choices: ["local", "testnet", "mainnet"],
      },
      key: {
        type: "string",
        alias: "k",
        demandOption: true,
        description: "Private key from Terra Station"
      },
      pass: {
        type: "string",
        alias: "p",
        demandOption: true,
        description: "Password for Terra Station"
      },
      config: {
        type: "string",
        alias: "o",
        demandOption: true,
        description: "Path to config file"
      },
      pinata_key: {
        type: "string",
        demandOption: true,
        description: "Pinata public key"
      },
      pinata_secret: {
        type: "string",
        demandOption: true,
        description: "Pinata private key"
      },
    })
  })
  .command("mint", "mints a single NFT", yargs => {
    yargs.options({
      env: { 
        type: "string",
        alias: "e",
        demandOption: true,
        description: "Chain environment",
        choices: ["local", "testnet", "mainnet"],
      },
      key: {
        type: "string",
        alias: "k",
        demandOption: true,
        description: "Private key from Terra Station"
      },
      pass: {
        type: "string",
        alias: "p",
        demandOption: true,
        description: "Password for Terra Station"
      },
    })
  })
  .command("transfer", "transfers NFT to a recipient", yargs => {
    yargs.options({
      env: { 
        type: "string",
        alias: "e",
        demandOption: true,
        description: "Chain environment",
        choices: ["local", "testnet", "mainnet"],
      },
      key: {
        type: "string",
        alias: "k",
        demandOption: true,
        description: "Private key from Terra Station"
      },
      pass: {
        type: "string",
        alias: "p",
        demandOption: true,
        description: "Password for Terra Station"
      },
      recipient: {
        type: "string",
        alias: "r",
        demandOption: true,
        description: "Private key from Terra Station"
      },
      token_id: {
        type: "string",
        alias: "t",
        demandOption: true,
        description: "Password for Terra Station"
      },
    })
  })
  .help()
  .parse();

const main = async () => {
  const args = await argv;

  const command = args._[0];
  const env = args.e as string | undefined;
  const pk = args.k as string | undefined;
  const pass = args.p as string | undefined;
  const config = args.o as string | undefined;
  const recipient = args.r as string | undefined;
  const token_id = args.t as string | undefined;
  const pinata_key = args.pinata_key as string | undefined;
  const pinata_secret = args.pinata_secret as string | undefined;

  const cache = "cache";

  if (typeof command === "string" && command === "upload") {
    if (typeof env === 'undefined' || typeof pass === 'undefined' || typeof pk === 'undefined' || typeof pass === 'undefined' || typeof config === 'undefined' || typeof pinata_key === 'undefined' || typeof pinata_secret === 'undefined' ) return;
    const path = args._[1] as string;
    await upload(cache, env, path, pk, pass, config, pinata_key, pinata_secret);
  } else if (typeof command === "string" && command === "mint") {
    if (typeof env === 'undefined' || typeof pass === 'undefined' || typeof pk === 'undefined' || typeof pass === 'undefined') return;
    await mint(env, pk, pass, cache);
  } else if (typeof command === "string" && command === "transfer") {
    if (typeof env === 'undefined' || typeof pass === 'undefined' || typeof pk === 'undefined' || typeof pass === 'undefined' || typeof config === 'undefined' || typeof recipient === 'undefined' || typeof token_id === 'undefined') return;
    await transfer(env, pk, pass, cache, recipient, token_id);
  } else {
    console.error("Invalid command");
  }
  process.exit(0); // ensure smooth exit
}

main()
  .catch((reason) => {
    console.error(reason);
  });