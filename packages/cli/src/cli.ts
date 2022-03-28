#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { migrate } from './commands/migrate';

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
        description: "The ecnrytped private key from Terra Station"
      },
      pass: {
        type: "string",
        alias: "p",
        demandOption: true,
        description: "The password for your Terra Station wallet"
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
        description: "The ecnrytped private key from Terra Station"
      },
      pass: {
        type: "string",
        alias: "p",
        demandOption: true,
        description: "The password for your Terra Station wallet"
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
        description: "The ecnrytped private key from Terra Station"
      },
      pass: {
        type: "string",
        alias: "p",
        demandOption: true,
        description: "The password for your Terra Station wallet"
      },
      recipient: {
        type: "string",
        alias: "r",
        demandOption: true,
        description: "Address of the recipient"
      },
      token_id: {
        type: "string",
        alias: "t",
        demandOption: true,
        description: "ID of the token to transfer"
      },
    })
  })
  .command("migrate", "migrate contract to a new code id", yargs => {
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
        description: "The ecnrytped private key from Terra Station"
      },
      pass: {
        type: "string",
        alias: "p",
        demandOption: true,
        description: "The password for your Terra Station wallet"
      },
      code_id: {
        type: "number",
        alias: "c",
        demandOption: true,
        description: "The new code's storage ID"
      },
      contract_address: {
        type: "string",
        alias: "a",
        demandOption: true,
        description: "The address of the contract to update"
      },
      version: {
        type: "string",
        alias: "v",
        demandOption: true,
        description: "The new version for the contract"
      },
      config_path: {
        type: "string",
        demandOption: false,
        description: "The path to the new contract configuration JSON file"
      },
    })
  })
  .help()
  .parse();

const main = async () => {
  const args = await argv;

  const command = args._[0] as string;
  const env = args.e as string;
  const pk = args.k as string;
  const pass = args.p as string;

  const cache = "cache";

  switch(command) {
    case "upload":
      const path = args._[1] as string;
      const config = args.o as string;
      const pinata_key = args.pinata_key as string;
      const pinata_secret = args.pinata_secret as string;

      await upload(cache, env, path, pk, pass, config, pinata_key, pinata_secret);

      break;
    case "mint":
      await mint(env, pk, pass, cache);

      break;
    case "transfer":
      const recipient = args.r as string;
      const token_id = args.t as string;
      
      await transfer(env, pk, pass, cache, recipient, token_id);

      break;
    case "migrate":
      const code_id = args.c as number;
      const contract_address = args.a as string;
      const version = args.v as string;
      const config_path = args.config_path as string | undefined;

      await migrate(env, pk, pass, code_id, contract_address, version, config_path);
    
      break;
    default:
      console.error("Invalid command");
  }

  process.exit(0); // ensure smooth exit
}

main()
  .catch((reason) => {
    console.error(reason);
  });