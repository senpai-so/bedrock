# bedrock

*This is alpha software*

🗿 🌔 Bedrock helps you launch NFT's on Terra blockchain.

Our main features are:
* *Create/Mint* NFT's
* Pay using Fiat (or Luna/UST)
* *Create auctions* for secondary markets for NFT's

Bedrock is meant to be a single repo with three components: a front-end, set of COSMWASM contracts deployable on Terra, and
a payments integration.

Requires Node v15.3+. We try to stay up to date with latest, so v16.0+ is ideal.

## Getting Started

### Part 1: Set up Terra Dapp stack

Follow the [tutorial](https://docs.terra.money/Tutorials/Smart-contracts/Overview.html) to set up LocalTerra and learn to deploy an example contract.

### Part 2: Deploy NFT contract

We store a custom fork of the [CW721 standard](https://github.com/CosmWasm/cw-nfts). Specifically, we extend the `cw721-base` contract to enforce a max token supply and a payable function. This avoids the need to create a separate contract for purchasing NFT's. We also ensure that this contract is deployable on the Terra ecosystem.

To set up, navigate to `contracts/cw721-base` and run

```
cargo test
```

This installs packages and runs tests. Once tests pass, compile the contract using:

```
RUSTFLAGS='-C link-arg=-s' cargo wasm
cp ../../target/wasm32-unknown-unknown/release/cw721_base.wasm .
ls -l cw721_base.wasm
sha256sum cw721_base.wasm
```

Then, make sure a local Terra node is running (for instructions, see Part 1) and deploy the contract using:

```
terrad tx wasm store cw721_base.wasm --from test1 --chain-id=localterra --gas=auto --fees=100000uluna --broadcast-mode=block
```

And to instantiate the contract, use:

```
terrad tx wasm instantiate 2 '{"name": "LooniesCore", "symbol": "LOON", "minter": "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8" "max_token_count": 10000}' --from test1 --chain-id=localterra --fees=10000uluna --gas=auto --broadcast-mode=block
```

Then, to make sure the instantiation is correct, run

```
terrad query wasm contract-store CONTRACT_ADDRESS '{"num_tokens":{}}'
```

where `CONTRACT_ADDRESS` is the address of the contract instantiated from above command.

### Part 3: Web app

Finally, to interact with the contract, start the web app. We use NextJS with Typescript.

Install packages:

```bash
yarn
```

Then, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

TODO
