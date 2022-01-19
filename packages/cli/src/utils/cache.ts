import fs from 'fs';
import path from 'path';
import { MintMsg } from '../lib/types';

const CACHE_PATH = "./";

type Program = {
  contract_address: string | undefined;
  tokens_minted: string[];
}

export type CacheContent = { 
  program: Program;
  items: MintMsg[] | undefined;
  env: string | undefined;
  cacheName: string | undefined;
}

export function cachePath(
  env: string,
  cacheName: string,
  cPath: string = CACHE_PATH,
) {
  const filename = `${env}-${cacheName}`;
  return path.join(cPath, `${filename}.json`);
}

export function loadCache(
  cacheName: string,
  env: string,
  cPath: string = CACHE_PATH,
): CacheContent | undefined {
  const path = cachePath(env, cacheName, cPath);

  if (!fs.existsSync(path)) {
    return undefined;
  }

  return JSON.parse(fs.readFileSync(path).toString());
}

export function saveCache(
  cacheName: string,
  env: string,
  cacheContent: CacheContent,
  cPath: string = CACHE_PATH,
) {
  cacheContent.env = env;
  cacheContent.cacheName = cacheName;
  fs.writeFileSync(
    cachePath(env, cacheName, cPath),
    JSON.stringify(cacheContent),
  );
}