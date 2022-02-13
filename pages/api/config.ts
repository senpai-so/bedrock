import type { NextApiRequest, NextApiResponse } from 'next'

import * as fs from 'fs';
import path from 'path';

import { CacheContent, CacheResponse } from 'lib/types';

const loadCache = (name: string) => {
  const filePath = `./lib/${name}.json`; //path.join(dir, `${name}.json`)
  if (!fs.existsSync(filePath)) return undefined;
  return JSON.parse(fs.readFileSync(filePath).toString()) as CacheContent;
}

const isString = (input: any) => {
  return typeof input === 'string' || input instanceof String;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CacheResponse>
) {
  if (req.method === 'GET') {
    // const { path } = req.query;

    // if (!isString(path) || path === '') {
    //   res.status(404).json({ success: false, error: 'PATH NOT PROVIDED' });
    // }

    const cache = loadCache("cache") as CacheContent | undefined;

    if (typeof cache === 'undefined') {
      res.status(404).json({ success: false, error: "CACHE NOT FOUND"});
      return;
    }

    res.status(200).json({ success: true, cacheStr: JSON.stringify(cache) });
    return;
  }

  // catch-all
  res.status(404).json({ success: false, error: 'NOT FOUND' })
  return
}
