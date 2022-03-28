#[cfg(not(feature = "library"))]
use cosmwasm_std::{entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, Empty, StdResult };

use cw721::ContractInfoResponse;
pub use cw721_base::{MintMsg, MinterResponse, Cw721Contract};
use bedrock::msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg};
use bedrock::state::{Extension};

use crate::execute::{execute_mint, execute_withdraw};

use crate::query::{query_config, query_frozen};
use crate::state::{Config, CONFIG, OWNER};

use crate::{error::ContractError, execute::execute_burn};

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let cw721_contract = Cw721Contract::<Extension, Empty>::default();
    let config = Config {
        name: msg.name.clone(),
        symbol: msg.symbol.clone(),
        price: msg.price,
        treasury_account: msg.treasury_account,
        start_time: msg.start_time,
        end_time: msg.end_time,
        token_supply: msg.max_token_count,
        frozen: false,
        is_mint_public: msg.is_mint_public,
    };

    let contract_info = ContractInfoResponse {
        name: msg.name.clone(),
        symbol: msg.symbol.clone(),
    };

    cw721_contract
        .contract_info
        .save(deps.storage, &contract_info)?;

    CONFIG.save(deps.storage, &config)?;
    OWNER.save(deps.storage, &info.sender.to_string())?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {

        // Destroys the NFT permanently.
        ExecuteMsg::Burn { token_id } => execute_burn(deps, env, info, token_id),

        // Mint token
        ExecuteMsg::Mint(mint_msg) => execute_mint(deps, env, info, mint_msg),

        // Withdraw funds to 
        ExecuteMsg::Withdraw { amount } => execute_withdraw(deps, env, info, amount),

        // CW721 methods
        _ => Cw721Contract::<Extension, Empty>::default()
            .execute(deps, env, info, msg.into())
            .map_err(|err| err.into()),
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_binary(&query_config(deps)?),
        QueryMsg::Frozen {} => to_binary(&query_frozen(deps)?),
        // CW721 methods
        _ => Cw721Contract::<Extension, Empty>::default()
            .query(deps, env, msg.into()),
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(
    _deps: DepsMut,
    _env: Env,
    _msg: MigrateMsg, 
) -> StdResult<Response> {
    Ok(Response::default())
}
