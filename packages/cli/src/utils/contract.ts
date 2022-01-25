import { isTxError, LCDClient, MsgExecuteContract, Wallet } from "@terra-money/terra.js"
import { ConnectedWallet } from "@terra-money/wallet-provider";


export const executeTransaction = async (
  terra: LCDClient,
  wallet: Wallet,
  contract_address: string,
  execMsg: Object,
) => {
  const execute = new MsgExecuteContract(
    wallet.key.accAddress, 
    contract_address, 
    execMsg
  );
  const executeTx = await wallet.createAndSignTx({ msgs: [execute] });
  const executeTxResult = await terra.tx.broadcast(executeTx);

  if (isTxError(executeTxResult)) {
    console.log("Mint failed.")
    throw new Error(
      `mint failed. code: ${executeTxResult.code}, codespace: ${executeTxResult.codespace}, raw_log: ${executeTxResult.raw_log}`
    );
  }

  return executeTxResult;
}