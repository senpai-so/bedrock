use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
  #[error("{0}")]
  Std(#[from] StdError),

  #[error("Unauthorized")]
  Unauthorized {},

  #[error("token_id already claimed")]
  Claimed {},

  #[error("Cannot set approval that is already expired")]
  Expired {},

  #[error("max_tokens exceeded")]
  MaxTokensExceeded {},
}
