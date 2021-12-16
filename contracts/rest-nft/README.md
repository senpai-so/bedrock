# REST NFT
An extended CW721 (v0.9.2) with update, burn, freeze, set_minter functionalities.

## Methods
1. `burn`
    Destroys a token, decreasing token count.
    ```
    Burn {
        token_id: String,
    }
    ```
2. `update` Updates token metadata
   ```
    Update {
        token_id: String,
        token_uri: Option<String>,
        extension: Extension,
    }
   ```
3. `freeze`
   Freezes changes to all token metadata.
   ```
   Freeze {}
   ```
4. `set_minter`
    Current minter can transfer minter rights to others.
    ```
    SetMinter {
        minter: String,
    }
    ```
 
## Config
Stores token_supply limit & frozen state

```
pub struct Config {
    /// The maximum allowed number of tokens
    pub token_supply: Option<u64>,
    pub frozen: bool,
}
```

## Usage

Contract are used for by all [REST-verse](http://redeyedspacetoads.io) NFTs (tadpoles, toads).
It supports a mint, burn, update and freeze launch mechanic.

## Known Issue
- all_tokens query fails as it inherits cw-nft v0.9.2 bug

## References

- https://github.com/collectxyz/collectxyz-nft-contract
- https://github.com/CosmWasm/cw-nfts
