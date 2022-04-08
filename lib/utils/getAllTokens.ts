import { LCDClient } from "@terra-money/terra.js";

const BATCH_SIZE = 25

export const getAllTokens = async (lcd: LCDClient, contract_address: string) => {
  const { count } = await lcd.wasm.contractQuery(contract_address, { num_tokens: {} }) 
  const iters = Math.ceil(count / BATCH_SIZE)
  
  let all_tokens: string[] = []
  let last_token = undefined

  for (let i=0; i<iters; i++) {
    console.log(`Loading tokens ${i*BATCH_SIZE+1}-${(i+1)*BATCH_SIZE}`)
    const { tokens } = (await lcd.wasm.contractQuery(contract_address, { all_tokens: { limit: BATCH_SIZE, start_after: last_token } })) as { tokens: string[] }
    if (!isArrayOfStrings(tokens)) return;
    all_tokens = all_tokens.concat(tokens)
    last_token = tokens.slice(-1)[0]
  }

  return all_tokens
}

export const getMyTokens = async (lcd: LCDClient, contract_address: string, owner: string) => {
  let myTokens: string[] = [];
  let last_token = undefined
  while (true) {
    const msg = { tokens: { limit: BATCH_SIZE, owner: owner, start_after: last_token } }
    const { tokens } = (await lcd.wasm.contractQuery(contract_address, msg)) as { tokens: string[] }
    last_token = tokens.slice(-1)[0]
    myTokens = myTokens.concat(tokens)
  }
  
  return myTokens
}

function isArrayOfStrings(value: any): boolean {
   return Array.isArray(value) && value.every(item => typeof item === "string");
}