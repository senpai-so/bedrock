# js-libp2p-delegated-content-routing

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-delegated-content-routing.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-delegated-content-routing)
[![](https://img.shields.io/travis/libp2p/js-libp2p-delegated-content-routing.svg?style=flat-square)](https://travis-ci.com/libp2p/js-libp2p-delegated-content-routing)
[![Dependency Status](https://david-dm.org/libp2p/js-libp2p-delegated-content-routing.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-delegated-content-routing)

Leverage other peers in the network to perform Content Routing calls.

Requires access to `/api/v0/dht/findprovs` and `/api/v0/refs` HTTP API endpoints of the delegate node.

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun)

## Requirements

`libp2p-delegated-content-routing` leverages the `ipfs-http-client` library and requires an instance of it as a constructor argument.

```sh
npm install ipfs-http-client libp2p-delegated-content-routing
```

## Example

```js
const DelegatedContentRouting = require('libp2p-delegated-content-routing')
const ipfsHttpClient = require('ipfs-http-client')

// default is to use ipfs.io
const routing = new DelegatedContentRouting(peerId, ipfsHttpClient.create({
  // use default api settings
  protocol: 'https',
  port: 443,
  host: 'node0.delegate.ipfs.io' // In production you should setup your own delegates
}))
const cid = new CID('QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv')

for await (const { id, multiaddrs } of routing.findProviders(cid)) {
  console.log('found peer', id, multiaddrs)
}

await routing.provide(cid)
console.log('providing %s', cid.toBaseEncodedString())
```

## License

MIT
