use cosmwasm_std::{Deps, DepsMut, Env, MessageInfo, Response, Coin, StdError, BankMsg, Empty};

use cw721_base::state::{TokenInfo, Cw721Contract};
use bedrock::msg::MintMsg;
use bedrock::state::{Extension};

use crate::error::ContractError;
use crate::state::{CONFIG, OWNER};

/// Execute functions

pub fn execute_burn(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  token_id: String,
) -> Result<Response, ContractError> {
  let cw721_contract = Cw721Contract::<Extension, Empty>::default(); //RestNFTContract::default();

  let token = cw721_contract.tokens.load(deps.storage, &token_id)?;
  // validate send permissions
  _check_can_send(&cw721_contract, deps.as_ref(), &env, &info, &token)?;

  cw721_contract.tokens.remove(deps.storage, &token_id)?;
  cw721_contract
    .token_count
    .update(deps.storage, |count| -> Result<u64, ContractError> {
      Ok(count - 1)
    })?;

  Ok(
    Response::new()
      .add_attribute("action", "burn")
      .add_attribute("token_id", token_id),
  )
}

pub fn execute_mint(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  msg: MintMsg,
) -> Result<Response, ContractError> {
  let cw721_contract = Cw721Contract::<Extension, Empty>::default();

  let owner = OWNER.load(deps.storage)?;
  let config = CONFIG.load(deps.storage)?;
  let current_count = cw721_contract.token_count(deps.storage)?;

  if current_count >= config.token_supply {
    return Err(ContractError::MaxTokenSupply {});
  }

  // Check if sender can mint
    // if not, throw an error
  if info.sender != owner {
    if !config.is_mint_public {
      return Err(ContractError::Unauthorized {});
    }
    // If price is set, make sure sender payed enough
    if config.price.is_some() {
      check_sufficient_funds(info.funds, config.price.unwrap())?;
    }

    // Block minting if before start time
    if config.start_time.is_some() && env.block.time.seconds() < config.start_time.unwrap() {
      return Err(ContractError::Unauthorized {});
    }

    // Block minting if after end time
    if config.end_time.is_some() && env.block.time.seconds() > config.end_time.unwrap() {
      return Err(ContractError::Unauthorized {});
    }

    

    // Custom check for Alex's NFTs
    let ext = msg.extension.as_ref();
    if ext.is_some() && ext.unwrap().image.is_some() {
      println!("ext & image are not None");
      if !ext.unwrap().image.as_ref().unwrap().contains(&String::from("QmQwkiEyiCuuHXGnfaXfsWRAuKRJZbiTP1yf1qXzYwHC6V")) {
        println!("does not contain hash");
        println!("{}", ext.unwrap().image.as_ref().unwrap());
        return Err(ContractError::Unauthorized {});
      }
    } else {
      println!("ext or image is None");
      return Err(ContractError::Unauthorized {});
    }
  }

  // Create the NFT
  let token = TokenInfo::<Extension> {
    owner: deps.api.addr_validate(&msg.owner)?,
    approvals: vec![],
    token_uri: msg.token_uri,
    extension: msg.extension,
  };
  
  // Update CW721 contract to reflect the new mint
  cw721_contract
    .tokens
    // Ensure token has not been minted
    .update(deps.storage, &msg.token_id, |old| match old {
      Some(_) => Err(ContractError::Claimed {}),
      None => Ok(token),
    })?;
  cw721_contract.increment_tokens(deps.storage)?;

  Ok(Response::new()
    .add_attribute("action", "mint")
    .add_attribute("minter", info.sender)
    .add_attribute("token_id", msg.token_id))
}

// Source: https://github.com/collectxyz/collectxyz-nft-contract/blob/main/contracts/collectxyz-nft-contract/src/execute.rs#L253
pub fn execute_withdraw(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
  amount: Vec<Coin>
) -> Result<Response, ContractError> {
  let owner = OWNER.load(deps.storage)?;
  let config = CONFIG.load(deps.storage)?;
  
  if info.sender != owner {
    return Err(ContractError::Unauthorized {});
  }

  Ok(Response::new().add_message(BankMsg::Send {
    amount,
    to_address: config.treasury_account
  }))
}

/// Helpers

fn check_sufficient_funds(funds: Vec<Coin>, required: Coin) -> Result<(), ContractError> {
  if required.amount.u128() == 0 {
    return Ok(());
  }
  let sent_sufficient_funds = funds.iter().any(|coin| {
    // check if denom and amount are right
    coin.denom == required.denom && coin.amount.u128() == required.amount.u128()
  });
  if sent_sufficient_funds{
    Ok(())
  } else {
    Err(ContractError::Std(StdError::generic_err(
      "insufficient funds sent"
    )))
  }
}

// Copied private cw721 check here
fn _check_can_send(
  cw721_contract: &Cw721Contract<Extension, Empty>,
  deps: Deps,
  env: &Env,
  info: &MessageInfo,
  token: &TokenInfo<Extension>,
) -> Result<(), ContractError> {
  // owner can send
  if token.owner == info.sender {
    return Ok(());
  }

  // any non-expired token approval can send
  if token
    .approvals
    .iter()
    .any(|apr| apr.spender == info.sender && !apr.is_expired(&env.block))
  {
    return Ok(());
  }

  // operator can send
  let op = cw721_contract
    .operators
    .may_load(deps.storage, (&token.owner, &info.sender))?;
  match op {
    Some(ex) => {
      if ex.is_expired(&env.block) {
        Err(ContractError::Unauthorized {})
      } else {
        Ok(())
      }
    }
    None => Err(ContractError::Unauthorized {}),
  }
}
