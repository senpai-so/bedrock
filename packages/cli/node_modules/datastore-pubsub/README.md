# datastore-pubsub

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/codecov/c/github/ipfs/js-datastore-pubsub.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-datastore-pubsub)
[![](https://img.shields.io/travis/ipfs/js-datastore-pubsub.svg?style=flat-square)](https://travis-ci.com/ipfs/js-datastore-pubsub)
[![Dependency Status](https://david-dm.org/ipfs/js-datastore-pubsub.svg?style=flat-square)](https://david-dm.org/ipfs/js-datastore-pubsub)
[![standard-readme](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> provides an implementation of an api for pubsub to be used as a datastore with TieredDatastore

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

## Table of Contents

  - [Lead Maintainer](#lead-maintainer)
  - [Table of Contents](#table-of-contents)
    - [Install](#install)
  - [Usage](#usage)
  - [API](#api)
      - [Setup](#setup)
      - [Get](#get)
      - [Put](#put)
      - [Unsubscribe](#unsubscribe)
  - [Contribute](#contribute)
  - [License](#license)

### Install

> npm install datastore-pubsub

## Usage

```js
import { PubsubDatastore } from 'datastore-pubsub'

const dsPubsub = new PubsubDatastore(pubsub, datastore, peerId, validator)
```

## API

#### Setup

```js
new PubsubDatastore(pubsub, datastore, peerId, validator, subscriptionKeyFn)
```

Creates a DatastorePubsub instance.

Arguments:

- `pubsub` (Object): implementation of a pubsub (must have publish and subscribe functions), such as [libp2p/pubsub](https://github.com/libp2p/js-libp2p/blob/master/src/pubsub.js).
- `datastore` (Object): datastore compliant with [interface-datastore](https://github.com/ipfs/interface-datastore), such as [datastore-fs](https://github.com/ipfs/js-datastore-fs).
- `peerId` (`PeerId` [Instance](https://github.com/libp2p/js-peer-id)): peer identifier object.
- `validator` (Object): containing validate function and select function.
- `subscriptionKeyFn` (function): function to manipulate the key topic received according to the needs, as well as to block the message received to be published.

Note: `validator` object must be composed by two functions, `validate (record: uint8Array, peerId: PeerId) => boolean` and `select (received: uint8Array, current: uint8Array) => boolean`. `validate` aims to verify if a new record received by pubsub is valid to be stored locally by the node. If it is valid and the node already has a local record stored, `select` is the function provided to be responsible for deciding which record is the best (newer) between the already stored and the received through pubsub. A `validator` example can be found at: TODO (js-ipns)

```js
const dsPubsub = new DatastorePubsub(pubsub, datastore, peerId, validator)
```

#### Get

```js
const buf = await dsPubsub.get(key)
```

Try to subscribe a topic with Pubsub and receive the current local value if available.

Arguments:

- `key` (Uint8Array): a key representing a unique identifier of the object to subscribe.

Returns `Promise<Uint8Array>` containing the most recent known record stored.

#### Put

```js
await dsPubsub.put(key, val)
```

Publishes a value through pubsub.

Arguments:

- `key` (Uint8Array): a key representing a unique identifier of the object to publish.
- `val` (Uint8Array): value to be propagated.

Returns `Promise<void>`

#### Unsubscribe

```js
await dsPubsub.unsubscribe(key)
```

Unsubscribe a previously subscribe value.

Arguments:

- `key` (Uint8Array): a key representing a unique identifier of the object to publish.

Returns `Promise<void>`

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipns/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

Copyright (c) Protocol Labs, Inc. under the **MIT License**. See [LICENSE file](./LICENSE) for details.
