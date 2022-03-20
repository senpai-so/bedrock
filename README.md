# Bedrock

🗿 🌔 Bedrock helps you launch NFT's on Terra blockchain.

Our main features are

- [x] _Create_ NFT collections
- [x] _Mint and Sell_ NFT's on storefront

Bedrock is meant to be a single repo with three components: a front-end, and set of COSMWASM contracts deployable on Terra.

## Getting Started

### Install dependencies

```shell
yarn
```

### Deploy NFT contract

We store a custom fork of the [CW721 standard](https://github.com/CosmWasm/cw-nfts). Specifically, we extend the `cw721-base` contract to enforce a max token supply, a payable function, and a variety of configurable setting. This avoids the need to create a separate contract for purchasing NFT's. We also ensure that this contract is deployable on the Terra ecosystem.

To set up, navigate to `packages/cli` and follow the [instructions](packages/cli/README.md). You should be able to deploy to testnet.

### NextJS dApp

Coming 🔜 !

## Contributing

If you'd like to make changes or contribute:

#### a) Set up local Terra Stack

Follow the [tutorial](https://docs.terra.money/Tutorials/Smart-contracts/Overview.html) to set up LocalTerra and learn to deploy an example contract.

#### b) Run changes against local stack

After you make changes, run them agains the local stack by issuing commands with the CLI.

## Roadmap and Team

You can view [our team and roadmap here](https://www.notion.so/senpai-inc/Bedrock-Terra-NFT-Tools-1a360fafc49248e69ead3b10b4af9e94).
