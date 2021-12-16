use cosmwasm_std::{Deps, DepsMut, Env, MessageInfo, Response};

use cw721_base::state::TokenInfo;
use cw721_base::MintMsg;
use rest_nft::state::{Extension, RestNFTContract};

use crate::error::ContractError;
use crate::state::{Config, CONFIG};

pub fn execute_burn(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  token_id: String,
) -> Result<Response, ContractError> {
  let cw721_contract = RestNFTContract::default();

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

// Copied private cw721 check here
fn _check_can_send<T>(
  cw721_contract: &RestNFTContract,
  deps: Deps,
  env: &Env,
  info: &MessageInfo,
  token: &TokenInfo<T>,
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

pub fn execute_update(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
  token_id: String,
  token_uri: Option<String>,
  extension: Extension,
) -> Result<Response, ContractError> {
  let cw721_contract = RestNFTContract::default();
  let minter = cw721_contract.minter.load(deps.storage)?;
  if info.sender != minter {
    return Err(ContractError::Unauthorized {});
  }

  let config = CONFIG.load(deps.storage)?;

  if config.frozen {
    return Err(ContractError::ContractFrozen {});
  }

  cw721_contract
    .tokens
    .update(deps.storage, &token_id, |token| match token {
      Some(mut token_info) => {
        // token_info.token_uri = token_uri;
        token_info.extension = extension;
        Ok(token_info)
      }
      None => return Err(ContractError::TokenNotFound {}),
    })?;

  Ok(
    Response::new()
      .add_attribute("action", "update")
      .add_attribute("token_id", token_id),
  )
}

pub fn execute_freeze(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
) -> Result<Response, ContractError> {
  let cw721_contract = RestNFTContract::default();
  let minter = cw721_contract.minter.load(deps.storage)?;
  if info.sender != minter {
    return Err(ContractError::Unauthorized {});
  }

  CONFIG.update(
    deps.storage,
    |mut config| -> Result<Config, ContractError> {
      config.frozen = true;
      Ok(config)
    },
  )?;

  Ok(Response::new().add_attribute("action", "freeze"))
}

pub fn execute_mint(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  mint_msg: MintMsg<Extension>,
) -> Result<Response, ContractError> {
  let cw721_contract = RestNFTContract::default();

  let config = CONFIG.load(deps.storage)?;
  let current_count = cw721_contract.token_count(deps.storage)?;

  if config.token_supply.is_some() && current_count >= config.token_supply.unwrap() {
    return Err(ContractError::MaxTokenSupply {});
  }

  let response = cw721_contract.mint(deps, env, info, mint_msg)?;
  Ok(response)
}

pub fn execute_set_minter(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
  new_minter: String,
) -> Result<Response, ContractError> {
  let cw721_contract = RestNFTContract::default();
  let minter = cw721_contract.minter.load(deps.storage)?;
  if info.sender != minter {
    return Err(ContractError::Unauthorized {});
  }

  let new_minter = deps.api.addr_validate(&new_minter)?;
  cw721_contract.minter.save(deps.storage, &new_minter)?;

  Ok(Response::new().add_attribute("action", "set_minter"))
}
