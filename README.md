# bedrock

_This is alpha software_

🗿 🌔 Bedrock helps you launch NFT's on Terra blockchain.

Our main features are:

- [X] _Create/Mint_ NFT's
- [ ] Pay using Fiat (or Luna/UST)
- [ ] _Create auctions_ for secondary markets for NFT's

Bedrock is meant to be a single repo with three components: a front-end, set of COSMWASM contracts deployable on Terra, and
a payments integration.

Requires Node v15.3+. We try to stay up to date with latest, so v16.0+ is ideal.

## Getting Started

### Part 1: Install dependencies
```shell
yarn
```

### Part 2: Set up Terra Dapp stack

Follow the [tutorial](https://docs.terra.money/Tutorials/Smart-contracts/Overview.html) to set up LocalTerra and learn to deploy an example contract.

### Part 2: Deploy NFT contract

We store a custom fork of the [CW721 standard](https://github.com/CosmWasm/cw-nfts). Specifically, we extend the `cw721-base` contract to enforce a max token supply, a payable function, and a variety of configurable setting. This avoids the need to create a separate contract for purchasing NFT's. We also ensure that this contract is deployable on the Terra ecosystem.

To set up, navigate to `packages/cli` and follow the [instructions](packages/cli/readme.md):

### Part 3: Web app

Coming soon...


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

TODO
