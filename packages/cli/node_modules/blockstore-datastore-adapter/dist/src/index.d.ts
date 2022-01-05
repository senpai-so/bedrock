/**
 * @typedef {import('interface-blockstore').Query} Query
 * @typedef {import('interface-blockstore').KeyQuery} KeyQuery
 * @typedef {import('interface-blockstore').Pair} Pair
 * @typedef {import('interface-blockstore').Options} Options
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 */
/**
 * @implements {Blockstore}
 */
export class BlockstoreDatastoreAdapter extends BaseBlockstore implements Blockstore {
    /**
     * @param {Datastore} datastore
     */
    constructor(datastore: Datastore);
    child: import("interface-datastore").Datastore;
}
export type Query = import('interface-blockstore').Query;
export type KeyQuery = import('interface-blockstore').KeyQuery;
export type Pair = import('interface-blockstore').Pair;
export type Options = import('interface-blockstore').Options;
export type Datastore = import('interface-datastore').Datastore;
export type Blockstore = import('interface-blockstore').Blockstore;
import { BaseBlockstore } from "blockstore-core/base";
//# sourceMappingURL=index.d.ts.map