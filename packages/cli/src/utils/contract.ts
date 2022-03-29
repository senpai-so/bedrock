import fs from 'fs'

import {
  isTxError,
  LCDClient,
  MsgExecuteContract,
  MsgStoreCode,
  Wallet
} from '@terra-money/terra.js'
import { getClient } from '../lib/getClient'
import { encryptedToRawKey } from './keys'

export const executeTransaction = async (
  terra: LCDClient,
  wallet: Wallet,
  contract_address: string,
  execMsg: Object
) => {
  const execute = new MsgExecuteContract(
    wallet.key.accAddress,
    contract_address,
    execMsg
  )
  const executeTx = await wallet.createAndSignTx({ msgs: [execute] })
  const executeTxResult = await terra.tx.broadcast(executeTx)

  if (isTxError(executeTxResult)) {
    console.log('Mint failed.')
    throw new Error(
      `mint failed. code: ${executeTxResult.code}, codespace: ${executeTxResult.codespace}, raw_log: ${executeTxResult.raw_log}`
    )
  }

  return executeTxResult
}

// Helper function for updating builds
const storeCode = async (env: string, pk: string, pass: string) => {
  const terra = await getClient(env)
  const key = encryptedToRawKey(pk, pass)
  const wallet = terra.wallet(key)

  const wasm = fs
    .readFileSync('../../contracts/bedrock/artifacts/bedrock_base.wasm')
    .toString('base64')
  const storeCode = new MsgStoreCode(wallet.key.accAddress, wasm)
  const storeCodeTx = await wallet.createAndSignTx({ msgs: [storeCode] })
  const txResult = await terra.tx.broadcast(storeCodeTx)

  if (isTxError(txResult)) throw new Error('store code failed')
  const {
    store_code: { code_id }
  } = txResult.logs[0].eventsByType
  console.log(env, code_id)

  return code_id
}
