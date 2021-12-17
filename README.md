# bedrock

_This is alpha software_

🗿 🌔 Bedrock helps you launch NFT's on Terra blockchain. Right now, it's tailored to the Loonies launch.

Our main features are:

- _Create/Mint_ NFT's
- Pay using Fiat (or Luna/UST)
- _Create auctions_ for secondary markets for NFT's

Bedrock is meant to be a single repo with three components: a front-end, set of COSMWASM contracts deployable on Terra, and
a payments integration.

Requires Node v15.3+. We try to stay up to date with latest, so v16.0+ is ideal.

## Getting Started

### Part 1: Set up Terra Dapp stack

Follow the [tutorial](https://docs.terra.money/Tutorials/Smart-contracts/Overview.html) to set up LocalTerra and learn to deploy an example contract.

### Part 2: Deploy NFT contract

We store a custom fork of the [CW721 standard](https://github.com/CosmWasm/cw-nfts). Specifically, we extend the `cw721-base` contract to enforce a max token supply and a payable function. This avoids the need to create a separate contract for purchasing NFT's. We also ensure that this contract is deployable on the Terra ecosystem.

To set up, navigate to `contracts/rest-nft/contracts/rest-nft-base` and run the test command:

```
cd contracts/rest-nft/contracts/rest-nft-base
cargo test
```

This installs packages and runs tests. Once tests pass, compile the contract using:

```
RUSTFLAGS='-C link-arg=-s' cargo wasm
cp ../../target/wasm32-unknown-unknown/release/rest_nft_base.wasm .
ls -l rest_nft_base.wasm
sha256sum rest_nft_base.wasm
```

Then, make sure a local Terra node is running (for instructions, see Part 1) and deploy the contract using:

```bash
terrad tx wasm store rest_nft_base.wasm --from test1 --chain-id=localterra --gas=auto --fees=100000uluna --broadcast-mode=block
```

You should see a result like

```
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"/terra.wasm.v1beta1.MsgStoreCode"},{"key":"module","value":"wasm"}]},{"type":"store_code","attributes":[{"key":"sender","value":"terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"},{"key":"code_id","value":"3"}]}]}]'
```

Pay attention to the `code_id` value. Here, it's "3".

Great! You now have your contract template on the blockchain. You still need to instantiate it before you can start using. To instantiate the contract, use (replace CODE_VALUE):

```bash
terrad tx wasm instantiate CODE_VALUE '{"name": "LooniesCore", "symbol": "LOON", "minter": "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8", "max_token_count": 10000}' --from test1 --chain-id=localterra --fees=10000uluna --gas=auto --broadcast-mode=block
```

From our above example, this would be

```bash
terrad tx wasm instantiate 3 '{"name": "LooniesCore", "symbol": "LOON", "minter": "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8", "max_token_count": 10000}' --from test1 --chain-id=localterra --fees=10000uluna --gas=auto --broadcast-mode=block
```

You should see an output that looks like:

```
  msg_index: 0
raw_log: '[{"events":[{"type":"instantiate_contract","attributes":[{"key":"creator","value":"terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"},{"key":"admin"},{"key":"code_id","value":"2"},{"key":"contract_address","value":"terra1sshdl5qajv0q0k6shlk8m9sd4lplpn6gggfr86"}]},{"type":"message","attributes":[{"key":"action","value":"/terra.wasm.v1beta1.MsgInstantiateContract"},{"key":"module","value":"wasm"},{"key":"sender","value":"terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"}]}]}]'
timestamp: ""
tx: null
txhash: 1EFC78A141F0CABBD94627C745A5CFF4194663EEC92003923B525D4186404A65
```

Find the value corresponding to key "contract_address". In the above example, it is `terra1sshdl5qajv0q0k6shlk8m9sd4lplpn6gggfr86`.

Then, to make sure the instantiation is correct, run

```
terrad query wasm contract-store terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8 '{"num_tokens":{}}'
```

where `CONTRACT_ADDRESS` is the address of the contract instantiated from above command.

Bonus: test minting

To test minting, you can try this command

```
terrad tx wasm execute terra17dkr9rnmtmu7x4azrpupukvur2crnptyfvsrvr '{"mint":{"token_id": "DUCHTYTY3", "owner": "terra15048c7jn3hlz9ewsvuf6glhx6g88lg5tc22uvw", "name": "DTT", "image": "http://localhost:3000/loonies/DuchessTayTay.jpeg", "extension": {"name": "DTT", "image": "http://localhost:3000/loonies/DuchessTayTay.jpeg"}}}' --from test1 --chain-id=localterra --gas=auto --fees=1000000uluna --broadcast-mode=block
```

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

### Database
The backend postgres database is currently hosted on heroku.

Add the DATABASE_URL secret to your .env file. 

Run yarn prisma studio to view the database on http://localhost:5555


## Scripts

We keep convenient scripts to run in `scripts/`. They're written in Typescript and are hooked up to import from any existing path in the repo.

Note: for loading .env, you need to manually call `dotenv.config(...)` at the top of the file.

To execute locally>

Check your .env is populated correctly. Then run (no .ts extension at the end)

```
yarn run:<scriptName>
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

TODO
