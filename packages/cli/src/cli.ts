#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { mint } from './commands/mint';
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
      cred: {
        type: "string",
        alias: "m",
        demandOption: true,
        description: "Path to mnemonic file"
      },
      config: {
        type: "string",
        alias: "o",
        demandOption: true,
        description: "Path to config file"
      },
      // cache: {
      //   type: "string",
      //   alias: "a",
      //   demandOption: true,
      //   description: "Cache name"
      // }
    })
    // .example("$0 upload ./assets -e local -m ./mnemonic -cp ./config.json -c cache", "Upload assets and mint contract")
  })
  .command("verify", "verifies successful upload", yargs => {
    yargs.options({
      env: { 
        type: "string",
        alias: "e",
        demandOption: true,
        description: "Chain environment",
        choices: ["local", "testnet", "mainnet"],
      },
      cred: {
        type: "string",
        alias: "m",
        demandOption: true,
        description: "Path to mnemonic"
      },
      // cache: {
      //   type: "string",
      //   alias: "a",
      //   demandOption: true,
      //   description: "Cache name"
      // }
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
      cred: {
        type: "string",
        alias: "m",
        demandOption: true,
        description: "Path to mnemonic"
      },
      // cache: {
      //   type: "string",
      //   alias: "a",
      //   demandOption: true,
      //   description: "Cache name"
      // }
    })
  })
  .command("mint-multiple", "mints multiple NFTs", yargs => {
    yargs.positional("count", {
      type: "number",
      demandOption: true,
      description: "number of NFTs to mint"
    })
    .options({
      env: { 
        type: "string",
        alias: "e",
        demandOption: true,
        description: "Chain environment",
        choices: ["local", "testnet", "mainnet"],
      },
      cred: {
        type: "string",
        alias: "m",
        demandOption: true,
        description: "Path to mnemonic"
      },
      // cache: {
      //   type: "string",
      //   alias: "a",
      //   demandOption: true,
      //   description: "Cache name"
      // }
    })
  })
  .command("update", "updates owner address or config", yargs => {
    yargs.positional("address", {
      type: "string",
      demandOption: false,
      description: "New owner address"
    })
    .options({
      env: { 
        type: "string",
        alias: "e",
        demandOption: true,
        description: "Chain environment",
        choices: ["local", "testnet", "mainnet"],
      },
      cred: {
        type: "string",
        alias: "m",
        demandOption: true,
        description: "Path to mnemonic"
      },
      config: {
        type: "string",
        alias: "o",
        demandOption: true,
        description: "Config file path"
      },
      // cache: {
      //   type: "string",
      //   alias: "a",
      //   demandOption: true,
      //   description: "Cache name"
      // }
    })
  })
  .help()
  .parse();

const main = async () => {
  const args = await argv;

  const command = args._[0];
  const env = args.e as string;
  const mnemonic = args.m as string;
  const config = args.o as string;
  const cache = "cache"; //args.a as string;

  if (typeof command === "string" && command === "upload") {
    const path = args._[1] as string;
    await upload(cache, env, path, mnemonic);
  } else if (typeof command === "string" && command === "mint") {
    await mint(env, mnemonic, cache);
  }
  process.exit(0); // ensure smooth exit
}

main();