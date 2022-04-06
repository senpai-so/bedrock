use cosmwasm_std::{Deps, StdResult, Empty, Order};
use cw721::{TokensResponse};
use cw721_base::{Cw721Contract};
use bedrock::state::{Extension};

use cw_storage_plus::Bound;

const DEFAULT_LIMIT: u32 = 10;
const MAX_LIMIT: u32 = 30;

use crate::state::{Config, CONFIG};

pub fn query_config(deps: Deps) -> StdResult<Config> {
    CONFIG.load(deps.storage)
}

pub fn query_frozen(deps: Deps) -> StdResult<bool> {
    let config = CONFIG.load(deps.storage)?;
    Ok(config.frozen)
}

pub fn query_all_tokens(
    deps: Deps,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<TokensResponse> {
    let contract = Cw721Contract::<Extension, Empty>::default();
    let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as usize;
    let start = start_after.map(|s| Bound::Exclusive(s.into())); // check diff between Exclusive & ExlusiveRaw

    let tokens: StdResult<Vec<String>> = contract
        .tokens
        .range(deps.storage, start, None, Order::Ascending)
        .take(limit)
        .map(|item| item.map(|(k,_)| String::from_utf8(k).unwrap()))
        .collect();
    
    Ok(TokensResponse { tokens: tokens? })
}
