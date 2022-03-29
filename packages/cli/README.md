# Bedrock CLI

## Getting started (locally)

1. Complete setup instructions from [Bedrock Readme](../../README.md)
2. Setup LocalTerra from this [tutorial](https://docs.terra.money/Tutorials/Smart-contracts/Overview.html)
3. Install packages

```
yarn
```

3. Compile TypeScript to JavaScript

```
yarn build
```

4. Link bin to use `bedrock` command

```
npm link
```

5. Get encrypted private key from Terra Station
   https://docs.terra.money/How-to/Terra-Station/Wallet.html#export-your-private-key

6. Upload contract

```
bedrock upload <asset_path> \
	-e <network> \
	-k <encrypted_private_key> \
	-p <password_for_wallet> \
	-o <config_path>
```

7. Mint NFT

```
bedrock mint \
	-e <network> \
	-k <encrypted_private_key> \
	-p <password_for_wallet>
```

## Formatting

:warning: **Double check the asset and config formatting aligns with the following. Otherwise you could experience problems when minting your collection.**

### Assets

For uploading, assets should be structured using `<assetKey>` pairs. Each pair should have a media file and a metadata file. An example of this is is available [here](example/assets)

```
assets
  0.jpg   <--- media
  0.json  <--- metadata
  1.jpg
  1.json
  2.jpg
  2.json
  ...
```

Metadata must follow [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards) in order to be properly indexed.
e.g.

```
{
  "manifest": {
    "token_id": "to0HpOKp8F",
    "name": "loonies1"
  },
  "metadata": {
    "description": "OG loonie",
    "name": "loonie1",
    "image": "",
    "attributes": [
      { "trait_type": "Type", "value": "pedestrian" },
      { "trait_type": "Background", "value": "blue cosmos" },
      { "trait_type": "Body", "value": "yellow" },
      { "trait_type": "Eyes", "value": "glasses,reading" },
      { "trait_type": "Mouth", "value": "loonie smile" },
      { "trait_type": "Headwear", "value": "construction helmet,earplug" },
      { "trait_type": "Outfit", "value": "blue overalls" },
      { "trait_type": "Items", "value": "map" }
    ]
  }
}
```

### Config File

The config file is used to configure your NFT collection. An example of how this file should be structure is available [here](example/config.json)
| Setting | Properties | Accepted Values | Required | Description |
|------------------ |------------ |----------------- |---------- |------------------------------------------------------------------------------------------------------------------- |
| name | | string | Yes | The name of the NFT collection |
| symbol | | string | Yes | The symbol of the NFT collection |
| price | | Object | No | Object storing the price information |
| | amount | string | | The number of tokens required to mint |
| | denom | string | | The token used in minting |
| treasury_account | | string | Yes | The address that can withdraw proceeds from the contract. In most cases this will be you. |
| *start_date | | integer | No | The unix timestamp when minting becomes available. (This feature has not been tested) |
| *end_date | | integer | No | The unix timestemp when minting is no longer available. (This feature has not been tested) |
| max_token_count | | integer | Yes | Maximum number of tokens that can be minted. In most cases this should be the number of assets you are uploading. |
| is_mint_public | | boolean | Yes | Whether or not someone other than the owner can mint |

## Commands

### upload

Uploads the images and metadata to IPFS, uploads contract code, and creates the contract.

### mint

Randomly mints one NFT from the collection.

### transfer

Transfers the NFT to recipient. This sets the metadata `owner` field to the recipient.

## Troubleshooting

There is a known issue with sequences on testnet. This is caused by the lower number of validators on the testnet, which leads to unprocessed transactions. This issue has not been encountered on mainnet. If you run into this issue on testnet, create a new wallet to continue testing.

```
'account sequence mismatch, expected 13, got 14: incorrect account sequence: invalid request'
```
