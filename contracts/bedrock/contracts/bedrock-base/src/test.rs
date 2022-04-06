#[cfg(test)]
mod tests {
    use crate::contract::{execute, instantiate, query};
    use crate::error::ContractError;

    use cosmwasm_std::{from_binary, coin, Empty, Response, StdError};
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cw721::{Cw721Query, NftInfoResponse};
    use cw721_base::MintMsg;
    use cw721_base::state::Cw721Contract;
    use bedrock::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
    use bedrock::state::{Extension, Metadata, Trait};

    const CREATOR: &str = "creator";
    const PUBLIC: &str = "public";
    const OWNER: &str = "owner";

    // Mint tests

    #[test]
    fn init_mint() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 1, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: None, 
            end_time: None,
            price: None,
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let mint_info = mock_info(OWNER, &[]);
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: OWNER.to_string(),
            token_uri: Some("ipfs/QmQwkiEyiCuuHXGnfaXfsWRAuKRJZbiTP1yf1qXzYwHC6V/1-1.json".into()),
            extension: None,
        };
        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        execute(deps.as_mut(), mock_env(), mint_info, exec_msg).unwrap();

        let query_msg: QueryMsg = QueryMsg::NftInfo {
            token_id: (&token_id).to_string(),
        };

        let res: NftInfoResponse<Extension> =
            from_binary(&query(deps.as_ref(), mock_env(), query_msg).unwrap()).unwrap();
        assert_eq!(res.token_uri, mint_msg.token_uri);
    }

    #[test]
    fn mint_limit() {
        let mut deps = mock_dependencies(&[]);
        let contract = Cw721Contract::<Extension, Empty>::default();

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 1, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: None, 
            end_time: None,
            price: None,
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: CREATOR.to_string(),
            token_uri: None, 
            extension: None,
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        let token_count = contract.token_count(&deps.storage).unwrap();
        assert_eq!(token_count, 1);

        // Should not allow mints above supply
        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        let res = execute(deps.as_mut(), mock_env(), info.clone(), exec_msg);
        assert_eq!(ContractError::MaxTokenSupply {}, res.unwrap_err());
    }

    #[test]
    fn mint_not_public() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 1, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: false, 
            start_time: None, 
            end_time: None,
            price: None,
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let mint_info = mock_info(OWNER, &[]);
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: OWNER.to_string(),
            token_uri: None, 
            extension: None,
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        let res = execute(deps.as_mut(), mock_env(), mint_info.clone(), exec_msg);

        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());
    }

    #[test]
    fn mint_alex() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 1, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: None, 
            end_time: None,
            price: None,
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_id = "1-1";
        let mint_info = mock_info(OWNER, &[]);
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: OWNER.to_string(),
            token_uri: None, 
            extension: Some( Metadata {
                image: Some("ipfs://QmQwkiEyiCuuHXGndaXfsWRAuKRJZbiTP1yf1qXzYwHC6V/1.png".to_string()),
                image_data: None,
                external_url: None,
                description: None,
                name: Some("Token1-1".to_string()),
                attributes: Some(vec!( Trait { trait_type: "Room".to_string(), value: "1".to_string(), display_type: None })),
                background_color: None,
                animation_url: None,
                youtube_url: None,
            }),
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        let res = execute(deps.as_mut(), mock_env(), mint_info.clone(), exec_msg);

        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());
    }

    #[test]
    fn mint_funds() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 2, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: None, 
            end_time: None,
            price: Some(coin(1_000_000, "uluna")),
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_ids = ["1-1", "1-2"];
        let coins = [coin(1_000_000, "uluna")];
        let success_info = mock_info(OWNER, &coins);
        let failure_info = mock_info(OWNER, &[]);

        // sufficient coins
        let mint_msg1 = MintMsg {
            token_id: token_ids[0].to_string(),
            owner: OWNER.to_string(),
            token_uri: Some("ipfs/QmQwkiEyiCuuHXGnfaXfsWRAuKRJZbiTP1yf1qXzYwHC6V/1-1.json".into()),
            extension: None,
        };
        let exec_msg = ExecuteMsg::Mint(mint_msg1);
        let res = execute(deps.as_mut(), mock_env(), success_info, exec_msg.clone());
        assert!(res.is_ok());

        // insufficient coins
        let mint_msg2 = MintMsg {
            token_id: token_ids[1].to_string(),
            owner: OWNER.to_string(),
            token_uri: Some("ipfs/QmQwkiEyiCuuHXGnfaXfsWRAuKRJZbiTP1yf1qXzYwHC6V/1-2.json".into()),
            extension: None,
        };
        let exec_msg = ExecuteMsg::Mint(mint_msg2);
        let res = execute(deps.as_mut(), mock_env(), failure_info.clone(), exec_msg.clone());
        let err = ContractError::Std(StdError::generic_err("insufficient funds sent"));
        assert_eq!(err, res.unwrap_err());
    }

    #[test]
    fn mint_times() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let env = mock_env();
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 1, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: Some(env.block.time.minus_seconds(1000).seconds()), 
            end_time: Some(env.block.time.plus_seconds(1000).seconds()),
            price: None,
        };

        instantiate(deps.as_mut(), env.clone(), info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: OWNER.to_string(),
            token_uri: Some("ipfs/QmQwkiEyiCuuHXGnfaXfsWRAuKRJZbiTP1yf1qXzYwHC6V/1-1.json".into()),
            extension: None,
        };
        let exec_msg = ExecuteMsg::Mint(mint_msg);
        let mint_info = mock_info(OWNER, &[]);

        // Minting too early (fail)
        let mut early_env = mock_env();
        early_env.block.time = env.block.time.minus_seconds(1010); // 10 seconds before start_time
        let res = execute(deps.as_mut(), early_env, mint_info.clone(), exec_msg.clone());
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // Minting too late (fail)
        let mut late_env = mock_env();
        late_env.block.time = env.block.time.plus_seconds(1010); // 10 seconds after end_time
        let res = execute(deps.as_mut(), late_env, mint_info.clone(), exec_msg.clone());
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // Minting inbetween (success)
        let mut valid_env = mock_env();
        valid_env.block.time = env.block.time;
        let res = execute(deps.as_mut(), valid_env, mint_info, exec_msg);
        assert!(res.is_ok());
    }


    // Transfer tests
    #[test]
    fn transfer_nft() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 2, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: None, 
            end_time: None,
            price: None,
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let mint_info = mock_info(OWNER, &[]);

        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: OWNER.to_string(),
            token_uri: Some("ipfs/QmQwkiEyiCuuHXGnfaXfsWRAuKRJZbiTP1yf1qXzYwHC6V/1-1.json".into()),
            extension: None,
        };
        let exec_msg = ExecuteMsg::Mint(mint_msg);
        execute(deps.as_mut(), mock_env(), mint_info, exec_msg.clone()).unwrap();

        let transfer_msg = ExecuteMsg::TransferNft {
            recipient: PUBLIC.to_string(),
            token_id: token_id.to_string(),
        };

        // random can not transfer
        let random_info = mock_info(PUBLIC, &[]);
        let err = execute(deps.as_mut(), mock_env(), random_info, transfer_msg.clone()).unwrap_err();
        assert_eq!(err, ContractError::Unauthorized {});

        // but owner can transfer
        let owner_info = mock_info(OWNER, &[]);
        let res = execute(deps.as_mut(), mock_env(), owner_info, transfer_msg).unwrap();

        // and make sure this is the request sent by the contract
        assert_eq!(
            res,
            Response::new()
                .add_attribute("action", "transfer_nft")
                .add_attribute("sender", OWNER)
                .add_attribute("recipient", PUBLIC)
                .add_attribute("token_id", token_id)
        );
    }

    
    // Withdraw tests

    #[test]
    fn withdraw() {
        let mut deps = mock_dependencies(&[]);

        let creator_info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 1, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: None, 
            end_time: None,
            price: Some(coin(1_000_000, "uluna")),
        };

        instantiate(deps.as_mut(), mock_env(), creator_info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let coins = [coin(1_000_000, "uluna")];
        let success_info = mock_info(CREATOR, &coins);
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: OWNER.to_string(),
            token_uri: None, 
            extension: None,
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg);
        execute(deps.as_mut(), mock_env(), success_info, exec_msg.clone()).unwrap();

        let fail_info = mock_info(OWNER, &[]);
        let exec_msg = ExecuteMsg::Withdraw { amount: coins.to_vec() };
        
        // Unauthorized withdraw
        let res = execute(deps.as_mut(), mock_env(), fail_info, exec_msg.clone());
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // Owner withdraw
        let res = execute(deps.as_mut(), mock_env(), creator_info, exec_msg);
        assert!(res.is_ok());
    }


    // Burn tests

    #[test]
    fn burn() {
        let mut deps = mock_dependencies(&[]);
        let contract = Cw721Contract::<Extension, Empty>::default();

        // Instantiate the contract
        let init_info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            max_token_count: 1, 
            treasury_account: CREATOR.to_string(), 
            is_mint_public: true, 
            start_time: None, 
            end_time: None,
            price: None,
        };
        instantiate(deps.as_mut(), mock_env(), init_info.clone(), init_msg).unwrap();

        // Mint an NFT
        let token_id = "Enterprise";
        let mint_info = mock_info(OWNER, &[]);
        let mint_msg = MintMsg {
            token_id: token_id.into(),
            owner: OWNER.into(),
            token_uri: Some("ipfs/QmQwkiEyiCuuHXGnfaXfsWRAuKRJZbiTP1yf1qXzYwHC6V/1-1.json".into()),
            extension: None,
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        execute(deps.as_mut(), mock_env(), mint_info.clone(), exec_msg).unwrap();
        let token_count = contract.token_count(&deps.storage).unwrap();

        assert_eq!(token_count, 1);

        // Burn an NFT
        let burn_info = mock_info(OWNER, &[]);
        let exec_msg = ExecuteMsg::Burn {
            token_id: token_id.to_string(),
        };

        execute(deps.as_mut(), mock_env(), burn_info.clone(), exec_msg).unwrap();
        let token_count = contract.token_count(&deps.storage).unwrap();
        // Token count decrements
        assert_eq!(token_count, 0);
        let res = Cw721Contract::<Extension, Empty>::default().nft_info(deps.as_ref(), token_id.into());
        match res {
            Ok(_) => panic!("Should not return token info"),
            Err(_) => {}
        }
    }
}
