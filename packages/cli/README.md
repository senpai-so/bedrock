# Bedrock CLI

## Getting started (locally)
1. Setup localterra as defined in bedrock readme
2. Install packages
```
yarn
```
3. Compile TypeScript to JavaScript
```
yarn build
```
4. Link bin to use 'bedrock'
```
npm link
```
5. Get encrypted private key from Terra Station
  - 
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

### Assets
For uploading, assets should be structured using `<assetKey>` pairs. Each pair should have a media file and a metadata file.
e.g.
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
