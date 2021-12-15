import { PROJECT_NAME, ROOT } from './env.mjs';

// add rust wasm32-unknown-unknown if not exists
const { stdout: rustupTargetList } = await $`rustup target list --installed`;
const wasm32Exists = rustupTargetList
  .split('\n')
  .some((target) => target === 'wasm32-unknown-unknown');

if (!wasm32Exists) {
  await $`rustup target add wasm32-unknown-unknown`;
}

// create wasm files into /target
await $`cargo build --release --target wasm32-unknown-unknown`;

// create /artifacts
await $`docker run --rm -v "${ROOT}":/code \
  --mount type=volume,source="${PROJECT_NAME}_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.3;
`;
