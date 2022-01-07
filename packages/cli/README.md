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
4. Upload contract
```
node ./build/src/cli.js upload ./assets -e localterra -m ./mnemonic.txt -o config -a cache
```

e.g. metadata:
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
5. Mint NFT
```
node ./build/src/cli.js mint -e localterra -m ./mnemonic.txt -a cache
```
