#[cfg(test)]
mod tests {
    use crate::contract::{execute, instantiate, query};
    use crate::error::ContractError;

    use cosmwasm_std::from_binary;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cw721::{Cw721Query, NftInfoResponse};
    use cw721_base::MintMsg;
    use rest_nft::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
    use rest_nft::state::{Extension, Metadata, RestNFTContract};

    const CREATOR: &str = "creator";
    const PUBLIC: &str = "public";
    const OWNER: &str = "owner";

    #[test]
    fn init_mint() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            minter: CREATOR.to_string(),
            token_supply: None,
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: "john".to_string(),
            token_uri: None,
            extension: None,
        };
        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        execute(deps.as_mut(), mock_env(), info, exec_msg).unwrap();

        let query_msg: QueryMsg = QueryMsg::NftInfo {
            token_id: (&token_id).to_string(),
        };

        let res: NftInfoResponse<Extension> =
            from_binary(&query(deps.as_ref(), mock_env(), query_msg).unwrap()).unwrap();
        assert_eq!(res.extension, mint_msg.extension);
    }

    #[test]
    fn mint_limit() {
        let mut deps = mock_dependencies(&[]);
        let contract = RestNFTContract::default();

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            minter: CREATOR.to_string(),
            token_supply: Some(1),
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        let token_id = "Enterprise";
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: "john".to_string(),
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
    fn burn() {
        let mut deps = mock_dependencies(&[]);
        let contract = RestNFTContract::default();

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            minter: CREATOR.to_string(),
            token_supply: Some(1),
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();
        // Mint an NFT
        let token_id = "Enterprise";
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: OWNER.to_string(),
            token_uri: None,
            extension: None,
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        let token_count = contract.token_count(&deps.storage).unwrap();
        assert_eq!(token_count, 1);

        // Burn an NFT
        let info = mock_info(OWNER, &[]);
        let exec_msg = ExecuteMsg::Burn {
            token_id: token_id.to_string(),
        };

        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();
        let token_count = contract.token_count(&deps.storage).unwrap();
        // Token count decrements
        assert_eq!(token_count, 0);

        let res = RestNFTContract::default().nft_info(deps.as_ref(), token_id.into());
        match res {
            Ok(_) => panic!("Should not return token info"),
            Err(_) => {}
        }
    }

    #[test]
    fn update() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            minter: CREATOR.to_string(),
            token_supply: Some(1),
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        // Mint an NFT
        let token_id = "Enterprise";
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: "john".to_string(),
            token_uri: None,
            extension: None,
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        let res = RestNFTContract::default()
            .nft_info(deps.as_ref(), token_id.into())
            .unwrap();
        assert_eq!(None, res.token_uri);

        // Update NFT Metadata
        let exec_msg = ExecuteMsg::Update {
            token_id: token_id.to_string(),
            token_uri: Some("https://moon.com".to_string()),
            extension: Some(Metadata {
                image: None,
                image_data: None,
                external_url: None,
                description: None,
                name: None,
                attributes: None,
                background_color: None,
                animation_url: None,
                youtube_url: None,
            }),
        };

        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        let res = RestNFTContract::default()
            .nft_info(deps.as_ref(), token_id.into())
            .unwrap();
        assert_eq!(Some("https://moon.com".to_string()), res.token_uri);

        // Freeze all nft metadata
        let exec_msg = ExecuteMsg::Freeze {};
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        // Should not be updatable
        let exec_msg = ExecuteMsg::Update {
            token_id: token_id.to_string(),
            token_uri: Some("https://moonit.com".to_string()),
            extension: Some(Metadata {
                image: None,
                image_data: None,
                external_url: None,
                description: None,
                name: None,
                attributes: None,
                background_color: None,
                animation_url: None,
                youtube_url: None,
            }),
        };

        let res = execute(deps.as_mut(), mock_env(), info.clone(), exec_msg);
        assert_eq!(ContractError::ContractFrozen {}, res.unwrap_err());
    }

    #[test]
    fn set_minter() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            minter: CREATOR.to_string(),
            token_supply: Some(1),
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

        // Public cannot set minter
        let info = mock_info(PUBLIC, &[]);
        let exec_msg = ExecuteMsg::SetMinter {
            minter: OWNER.to_string(),
        };
        let res = execute(deps.as_mut(), mock_env(), info.clone(), exec_msg);
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // Only minter can set new minter
        let info = mock_info(CREATOR, &[]);
        let exec_msg = ExecuteMsg::SetMinter {
            minter: OWNER.to_string(),
        };
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        // Old minter cannot update
        let exec_msg = ExecuteMsg::Update {
            token_id: token_id.to_string(),
            token_uri: Some("https://moonit.com".to_string()),
            extension: Some(Metadata {
                image: None,
                image_data: None,
                external_url: None,
                description: None,
                name: None,
                attributes: None,
                background_color: None,
                animation_url: None,
                youtube_url: None,
            }),
        };

        let res = execute(deps.as_mut(), mock_env(), info.clone(), exec_msg.clone());
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // New minter can update
        let info = mock_info(OWNER, &[]);
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();
    }

    #[test]
    fn unauthorized() {
        let mut deps = mock_dependencies(&[]);

        let info = mock_info(CREATOR, &[]);
        let init_msg = InstantiateMsg {
            name: "SpaceShips".to_string(),
            symbol: "SPACE".to_string(),
            minter: CREATOR.to_string(),
            token_supply: Some(1),
        };

        instantiate(deps.as_mut(), mock_env(), info.clone(), init_msg).unwrap();

        // Mint an NFT
        let token_id = "Enterprise";
        let mint_msg = MintMsg {
            token_id: token_id.to_string(),
            owner: CREATOR.to_string(),
            token_uri: None,
            extension: None,
        };

        let exec_msg = ExecuteMsg::Mint(mint_msg.clone());
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        let res = RestNFTContract::default()
            .nft_info(deps.as_ref(), token_id.into())
            .unwrap();
        assert_eq!(None, res.token_uri);

        let info = mock_info(PUBLIC, &[]);
        // Only minter can freeze metadata
        let exec_msg = ExecuteMsg::Freeze {};
        let res = execute(deps.as_mut(), mock_env(), info.clone(), exec_msg);
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // Public cannot update metadata
        let exec_msg = ExecuteMsg::Update {
            token_id: token_id.to_string(),
            token_uri: Some("https://moonit.com".to_string()),
            extension: Some(Metadata {
                image: None,
                image_data: None,
                external_url: None,
                description: None,
                name: None,
                attributes: None,
                background_color: None,
                animation_url: None,
                youtube_url: None,
            }),
        };
        let res = execute(deps.as_mut(), mock_env(), info.clone(), exec_msg);
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // Public cannot burn tokens
        let info = mock_info(PUBLIC, &[]);
        let exec_msg = ExecuteMsg::Burn {
            token_id: token_id.to_string(),
        };
        let res = execute(deps.as_mut(), mock_env(), info.clone(), exec_msg);
        assert_eq!(ContractError::Unauthorized {}, res.unwrap_err());

        // Transfer to new owner
        let info = mock_info(CREATOR, &[]);
        let exec_msg = ExecuteMsg::TransferNft {
            recipient: OWNER.to_string(),
            token_id: token_id.to_string(),
        };
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();

        // new owner can burn token
        let info = mock_info(OWNER, &[]);
        let exec_msg = ExecuteMsg::Burn {
            token_id: token_id.to_string(),
        };
        execute(deps.as_mut(), mock_env(), info.clone(), exec_msg).unwrap();
    }
}
