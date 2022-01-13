use cw_storage_plus::Item;
use cosmwasm_std::Coin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    /// Name of the collection
    pub name: String,
    /// Symbol for the collection
    pub symbol: String,
    /// Cost of minting if public
    pub price: Option<Coin>,
    /// Address to withdraw funds to
    pub treasury_account: String,
    /// Time when minting becomes available
    pub start_time: Option<u64>,
    /// Time when minting becomes unavailable
    pub end_time: Option<u64>,
    /// Maximum number of tokens to mint
    pub token_supply: u64,
    /// Whether NFTs can be updated
    pub frozen: bool,
    /// Whether minting is public
    pub is_mint_public: bool,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const OWNER: Item<String> = Item::new("owner");
