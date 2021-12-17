#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult};

use cw2::{get_contract_version, set_contract_version};
pub use cw721_base::{MintMsg, MinterResponse};
use rest_nft::msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg};
use rest_nft::state::RestNFTContract;

use crate::execute::{execute_freeze, execute_mint, execute_set_minter, execute_update};

use crate::query::{query_config, query_frozen};
use crate::state::{Config, CONFIG};
use crate::{error::ContractError, execute::execute_burn};

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let config = Config {
        token_supply: msg.token_supply,
        frozen: false,
    };

    CONFIG.save(deps.storage, &config)?;

    RestNFTContract::default().instantiate(deps, env, info, msg.into())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Update {
            token_id,
            image,
            extension,
        } => execute_update(deps, env, info, token_id, image, extension),
        // Freeze token metadata
        ExecuteMsg::Freeze {} => execute_freeze(deps, env, info),

        // Destroys the NFT permanently.
        ExecuteMsg::Burn { token_id } => execute_burn(deps, env, info, token_id),

        // Mint token
        ExecuteMsg::Mint(mint_msg) => execute_mint(deps, env, info, mint_msg),

        // Set minter
        ExecuteMsg::SetMinter { minter } => execute_set_minter(deps, env, info, minter),

        // CW721 methods
        _ => RestNFTContract::default()
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
        _ => RestNFTContract::default().query(deps, env, msg.into()),
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(
    deps: DepsMut,
    _env: Env,
    msg: MigrateMsg<Config>,
) -> Result<Response, ContractError> {
    match msg {
        MigrateMsg { version, config } => try_migrate(deps, version, config),
    }
}

fn try_migrate(
    deps: DepsMut,
    version: String,
    config: Option<Config>,
) -> Result<Response, ContractError> {
    let contract_version = get_contract_version(deps.storage)?;
    set_contract_version(deps.storage, contract_version.contract, version)?;

    if config.is_some() {
        CONFIG.save(deps.storage, &config.unwrap())?
    }

    Ok(Response::new()
        .add_attribute("method", "try_migrate")
        .add_attribute("version", contract_version.version))
}
