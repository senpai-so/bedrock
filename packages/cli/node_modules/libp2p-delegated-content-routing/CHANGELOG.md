## [0.11.2](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.11.0...v0.11.2) (2021-12-15)



## [0.11.1](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.11.0...v0.11.1) (2021-12-02)



# [0.11.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.10.0...v0.11.0) (2021-07-07)


### chore

* update to new multiformats ([#52](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/52)) ([f34c7d2](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/f34c7d29e1c2016242a13e23799e428d2a751e6f))


### BREAKING CHANGES

* uses the CID class from the new multiformats module



# [0.10.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.9.0...v0.10.0) (2021-04-09)



# [0.9.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.8.1...v0.9.0) (2021-01-20)


### Features

* allow providing non-dag-pb nodes ([#47](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/47)) ([28d3a45](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/28d3a456bc8aaaa359586a056b5366d89fc5e738))



## [0.8.2](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.8.1...v0.8.2) (2020-11-30)



## [0.8.1](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.4.1...v0.8.1) (2020-11-27)


### Bug Fixes

* accept http client instance ([#43](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/43)) ([003888a](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/003888a8eab1c8bd5aaed7adec58e8722ec4b2ff))
* catch find providers error ([#37](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/37)) ([9cc766c](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/9cc766cb6ee9525f46843f2cbb30802f7da0f039))
* replace node buffers with uint8arrays ([#42](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/42)) ([381815e](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/381815e0cd10cba6ee4d21ba46f8ddda9df4da83))


### chore

* make ipfs-http-client a peer dependency ([#39](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/39)) ([0c0f304](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/0c0f304217eb40fe96278b6f7bfafb6a77900a83))
* remove peer-info from api ([#34](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/34)) ([2c97221](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/2c972211b002ecc9f3a9cd2fa0fba04b08b854f8))


### BREAKING CHANGES

* - An instance of ipfs http client is now a required argument

* chore: update node versions

* chore: update readme

* chore: restore peer deps
* - all useage of node Buffers has been replaced with Uint8Arrays
- all deps now use Uint8Arrays instead of node Buffers

* test: fix provide test

Co-authored-by: Jacob Heun <jacobheun@gmail.com>
* The ipfs-http-client must now be installed
as a peer dependency. It is no longer included as a dependency
of this module.

The reason the http-client should be a peerDependency and
not a dependency is that its API requires knowledge of the
http-client (we pass in the api endpoint details).
* findProviders returns id and addrs properties instead of peer-info instance

* chore: address review



# [0.8.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.7.0...v0.8.0) (2020-10-21)



<a name="0.7.0"></a>
# [0.7.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.6.0...v0.7.0) (2020-08-26)


### Bug Fixes

* accept http client instance ([#43](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/43)) ([003888a](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/003888a))


### BREAKING CHANGES

* - An instance of ipfs http client is now a required argument

* chore: update node versions

* chore: update readme

* chore: restore peer deps



<a name="0.6.0"></a>
# [0.6.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.5.0...v0.6.0) (2020-08-12)


### Bug Fixes

* replace node buffers with uint8arrays ([#42](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/42)) ([381815e](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/381815e))


### BREAKING CHANGES

* - all useage of node Buffers has been replaced with Uint8Arrays
- all deps now use Uint8Arrays instead of node Buffers

* test: fix provide test

Co-authored-by: Jacob Heun <jacobheun@gmail.com>



<a name="0.5.0"></a>
# [0.5.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.4.5...v0.5.0) (2020-04-23)


### Chores

* make ipfs-http-client a peer dependency ([#39](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/39)) ([0c0f304](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/0c0f304))
* remove peer-info from api ([#34](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/34)) ([2c97221](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/2c97221))


### BREAKING CHANGES

* The ipfs-http-client must now be installed
as a peer dependency. It is no longer included as a dependency
of this module.

The reason the http-client should be a peerDependency and
not a dependency is that its API requires knowledge of the
http-client (we pass in the api endpoint details).
* findProviders returns id and addrs properties instead of peer-info instance

* chore: address review



<a name="0.4.5"></a>
## [0.4.5](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.4.4...v0.4.5) (2020-04-16)


### Bug Fixes

* catch find providers error ([#37](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/37)) ([9cc766c](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/9cc766c))



<a name="0.4.4"></a>
## [0.4.4](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.4.3...v0.4.4) (2020-04-09)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.4.2...v0.4.3) (2020-02-04)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.4.1...v0.4.2) (2019-12-20)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.4.0...v0.4.1) (2019-12-01)


### Bug Fixes

* async it refs ([#19](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/19)) ([b2690c7](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/b2690c7))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.3.1...v0.4.0) (2019-11-29)


### Chores

* rename timeout option ([#18](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/18)) ([22ff40c](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/22ff40c))


### BREAKING CHANGES

* maxTimeout option renamed to timeout



<a name="0.3.1"></a>
## [0.3.1](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.3.0...v0.3.1) (2019-07-24)


### Bug Fixes

* limit concurrent HTTP requests ([#16](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/16)) ([55d6108](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/55d6108)), closes [#12](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/12) [/github.com/libp2p/js-libp2p-delegated-content-routing/issues/12#issuecomment-514591525](https://github.com//github.com/libp2p/js-libp2p-delegated-content-routing/issues/12/issues/issuecomment-514591525)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.2.3...v0.3.0) (2019-07-12)


### Features

* refactor to use async/await ([#7](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/7)) ([0e2d91f](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/0e2d91f))


### BREAKING CHANGES

* API refactored to use async/await



<a name="0.2.3"></a>
## [0.2.3](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.2.2...v0.2.3) (2019-07-11)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.2.1...v0.2.2) (2018-09-27)


### Features

* add timeout defaults ([#6](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/6)) ([84acddc](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/84acddc))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/libp2p/js-libp2p-delegated-content-routing/compare/v0.2.0...v0.2.1) (2018-08-30)


### Bug Fixes

* better support peer ids ([1f872f3](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/1f872f3))



<a name="0.2.0"></a>
# 0.2.0 (2018-08-28)


### Bug Fixes

* comply with the dht findProviders interface ([3188be0](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/3188be0))
* linting ([01408cd](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/01408cd))
* resolve inconsistency with peerInfo and peerId usage ([dd4d8c3](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/dd4d8c3))
* use an actual peer-id ([b10dd04](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/b10dd04))
* use cid consistently ([52e0292](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/52e0292))


### Features

* initial implementation ([#1](https://github.com/libp2p/js-libp2p-delegated-content-routing/issues/1)) ([011adc9](https://github.com/libp2p/js-libp2p-delegated-content-routing/commit/011adc9))



