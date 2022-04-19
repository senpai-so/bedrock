use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Binary, Coin};
use cw721::Expiration;
use cw721_base::{
  msg::{
    ExecuteMsg as CW721ExecuteMsg, /*InstantiateMsg as CW721InstantiateMsg,*/ QueryMsg as CW721QueryMsg,
  },
  MintMsg as CW721MintMsg,
};

use crate::state::Extension;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
  /// Name of the NFT contract
  pub name: String,
  /// Symbol of the NFT contract
  pub symbol: String,
  /// Cost of NFT with the coin denom
  pub price: Option<Coin>,
  /// Account receiving funds
  pub treasury_account: String,
  /// Time when minting becomes available
  pub start_time: Option<u64>,
  /// Time when minting becomes unavailable
  pub end_time: Option<u64>,
  /// Maximum token supply 
  pub max_token_count: u64,
  /// Whether minting is public
  pub is_mint_public: bool,
}


pub type MintMsg = CW721MintMsg<Extension>;

// Extended CW721 ExecuteMsg, added the ability to update, burn, and finalize nft
#[derive(Serialize, Deserialize, Clone, PartialEq, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {

  // Destroys the NFT permanently.
  Burn {
    token_id: String,
  },

  /// Mint a new NFT, can only be called by the contract minter
  Mint(MintMsg),

  /// Withdraw funds to treasury wallet
  Withdraw {
    amount: Vec<Coin>,
  },

  // Standard CW721 ExecuteMsg
  /// Transfer is a base message to move a token to another account without triggering actions
  TransferNft {
    recipient: String,
    token_id: String,
  },
  /// Send is a base message to transfer a token to a contract and trigger an action
  /// on the receiving contract.
  SendNft {
    contract: String,
    token_id: String,
    msg: Binary,
  },
  /// Allows operator to transfer / send the token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  Approve {
    spender: String,
    token_id: String,
    expires: Option<Expiration>,
  },
  /// Remove previously granted Approval
  Revoke {
    spender: String,
    token_id: String,
  },
  /// Allows operator to transfer / send any token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  ApproveAll {
    operator: String,
    expires: Option<Expiration>,
  },
  /// Remove previously granted ApproveAll permission
  RevokeAll {
    operator: String,
  },
}

impl From<ExecuteMsg> for CW721ExecuteMsg<Extension> {
  fn from(msg: ExecuteMsg) -> CW721ExecuteMsg<Extension> {
    match msg {
      ExecuteMsg::TransferNft {
        recipient,
        token_id,
      } => CW721ExecuteMsg::TransferNft {
        recipient,
        token_id,
      },
      ExecuteMsg::SendNft {
        contract,
        token_id,
        msg,
      } => CW721ExecuteMsg::SendNft {
        contract,
        token_id,
        msg,
      },
      ExecuteMsg::Approve {
        spender,
        token_id,
        expires,
      } => CW721ExecuteMsg::Approve {
        spender,
        token_id,
        expires,
      },
      ExecuteMsg::Revoke { spender, token_id } => CW721ExecuteMsg::Revoke { spender, token_id },
      ExecuteMsg::ApproveAll { operator, expires } => {
        CW721ExecuteMsg::ApproveAll { operator, expires }
      }
      ExecuteMsg::RevokeAll { operator } => CW721ExecuteMsg::RevokeAll { operator },
      _ => panic!("cannot covert {:?} to CW721ExecuteMsg", msg),
    }
  }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
  /// Returns the current contract config
  Config {},

  // Checks if contract is frozen/finalised
  Frozen {},

  // Standard cw721 queries
  OwnerOf {
    token_id: String,
    include_expired: Option<bool>,
  },
  NumTokens {},
  ContractInfo {},
  NftInfo {
    token_id: String,
  },
  AllNftInfo {
    token_id: String,
    include_expired: Option<bool>,
  },
  Tokens {
    owner: String,
    start_after: Option<String>,
    limit: Option<u32>,
  },
  AllTokens {
    start_after: Option<String>,
    limit: Option<u32>,
  },
}

impl From<QueryMsg> for CW721QueryMsg {
  fn from(msg: QueryMsg) -> CW721QueryMsg {
    match msg {
      QueryMsg::OwnerOf {
        token_id,
        include_expired,
      } => CW721QueryMsg::OwnerOf {
        token_id,
        include_expired,
      },
      QueryMsg::NumTokens {} => CW721QueryMsg::NumTokens {},
      QueryMsg::ContractInfo {} => CW721QueryMsg::ContractInfo {},
      QueryMsg::NftInfo { token_id } => CW721QueryMsg::NftInfo { token_id },
      QueryMsg::AllNftInfo {
        token_id,
        include_expired,
      } => CW721QueryMsg::AllNftInfo {
        token_id,
        include_expired,
      },
      QueryMsg::Tokens {
        owner,
        start_after,
        limit,
      } => CW721QueryMsg::Tokens {
        owner,
        start_after,
        limit,
      },
      QueryMsg::AllTokens { start_after, limit } => CW721QueryMsg::AllTokens { start_after, limit },
      _ => panic!("cannot covert {:?} to CW721QueryMsg", msg),
    }
  }
}

#[derive(Serialize, Deserialize, Clone, PartialEq, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub struct MigrateMsg {}
