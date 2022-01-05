import fs from 'fs';
import path from 'path';
// import { CACHE_PATH } from './constants';

const CACHE_PATH = "./"; // CHANGE

export type CacheContent = { 
  program: Object,
  items: Object,
  env: string | undefined,
  cacheName: string | undefined,
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
  legacy: boolean = false,
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