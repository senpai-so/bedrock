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
  const env = args.e as string;
  const pk = args.k as string;
  const pass = args.p as string;
  const config = args.o as string;

  const cache = "cache";

  if (typeof command === "string" && command === "upload") {
    const path = args._[1] as string;
    await upload(cache, env, path, pk, pass, config);
  } else if (typeof command === "string" && command === "mint") {
    // await mint(env, pk, pass, cache);
  } else if (typeof command === "string" && command === "transfer") {
    const recipient = args.r as string;
    const token_id = args.t as string;
    await transfer(env, pk, pass, cache, recipient, token_id);
  } else {
    console.error("Invalid command");
  }
  process.exit(0); // ensure smooth exit
}

main();