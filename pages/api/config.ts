import type { NextApiRequest, NextApiResponse } from 'next'

import * as fs from 'fs';

import { MnemonicKey, MsgExecuteContract } from '@terra-money/terra.js'

import { getLCD } from '../../lib/utils/terra'
import { mnemonic, ownerAddress, contractAddress } from '../../lib/config'
import { toULuna } from '../../lib/utils/currency'

import { PrismaClient } from '@prisma/client'
import pickRandom from 'pick-random'
import { NftToken } from '../../lib/types'

import { loadCache, saveCache } from '../../packages/cli/src/utils/cache';

const prisma = new PrismaClient()

export type ConfigResponse = {
  success: boolean
  cacheStr?: string | null
  error?: string
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>
) {
  if (req.method === 'GET') {
    const { path, env } = req.body

    const cache = loadCache("cache", env);
    if (typeof cache === 'undefined') {
      res.status(404).json({ success: false, error: "CACHE NOT FOUND"});
      return
    }

    res.status(200).json({ success: true, cacheStr: JSON.stringify(cache) });

    return
  }

  // catch-all
  res.status(404).json({ success: false, error: 'NOT FOUND' })
  prisma.$disconnect()
  return
}
