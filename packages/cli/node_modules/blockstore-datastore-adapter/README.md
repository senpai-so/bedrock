# blockstore-datastore-adapter <!-- omit in toc -->

> Wraps a [datastore](https://github.com/ipfs/js-ipfs-interfaces/tree/master/packages/interface-datastore) with a [blockstore](https://github.com/ipfs/js-ipfs-interfaces/tree/master/packages/interface-blockstore)

## Table of Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```sh
$ npm install blockstore-datastore-adapter
```

## Usage

```js
import { MemoryDatastore } from 'datastore-core/memory'
import { BlockstoreDatastoreAdapter } from 'blockstore-datastore-adapter'

const store = new BlockstoreDatastoreAdapter(new MemoryDatastore())
```

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-bitswap/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

[Apache-2.0](LICENSE-APACHE) OR [MIT](LICENSE-MIT)
