import { isTxError, LCDClient, MsgInstantiateContract, MsgStoreCode } from "@terra-money/terra.js";
import { ConnectedWallet } from "@terra-money/wallet-provider";
import axios from 'axios';
import { InitMsg } from "types";

const MAINNET_CODE_ID = 2351;

export const createContract = async (
  wallet: ConnectedWallet,
  terra: LCDClient,
  msg: InitMsg,
  ): Promise<string> => {
  // const [config, setConfig] = useState<Object | undefined>();

  let CODE_ID = MAINNET_CODE_ID;

  if (!wallet.availableSign) throw Error("SIGNING NOT AVAILABLE");
  else console.log("signing available");

  
  console.log(wallet.network.chainID);

  if (!wallet.network.chainID.startsWith('columbus')) {
    const res = await axios("/getWasm", { method: 'GET', headers: { "Accept": 'application/json' } })
    console.log(0);
    const storeCode = new MsgStoreCode(
      wallet.walletAddress, 
      res.data.wasm
    );
    console.log(1);

    const storeCodeTx = await wallet.sign({ msgs: [storeCode] });
    console.log(2);
    const txResult = await terra.tx.broadcast(storeCodeTx.result);
    console.log(3);
    console.log(txResult);

    if (isTxError(txResult)) {
      throw new Error(
        `store code failed. code: ${txResult.code}, codespace: ${txResult.codespace}, raw_log: ${txResult.raw_log}`
      );
    }

    const { store_code: { code_id } } = txResult.logs[0].eventsByType;
    CODE_ID = parseInt(code_id[0]);
  }


  // Use uploaded code to create a new contract
  const instantiate = new MsgInstantiateContract(
    wallet.walletAddress,
    undefined, // Add admin address
    CODE_ID, // Add option to update the code
    { 
      name: msg.name,
      symbol: msg.symbol,
      price: msg.price, // Refactor to avoid this
      treasury_account: msg.treasury_account,
      start_time: msg.start_time,
      end_time: msg.end_time,
      max_token_count: msg.max_token_count,
      is_mint_public: msg.is_mint_public,
    },
  );

  if (!wallet.availableSign) {
    throw Error("signing not available in wallet");
  }

  
  const instantiateTx = await wallet.sign({ msgs: [instantiate] });
  const instantiateTxResult = await terra.tx.broadcast(instantiateTx.result);

  if (isTxError(instantiateTxResult)) {
    throw new Error(
      `instantiate failed. code: ${instantiateTxResult.code}, codespace: ${instantiateTxResult.codespace}, raw_log: ${instantiateTxResult.raw_log}`
    );
  }
  const { instantiate_contract: { contract_address } } = instantiateTxResult.logs[0].eventsByType;
  console.log("Contract instantiated");
  console.log("Contract address:", contract_address[0]);

  return contract_address[0];
}