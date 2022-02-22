import type { NextApiRequest, NextApiResponse } from 'next'

export type ConfigResponse = {
  success: boolean
  cacheStr?: string | null
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>
) {
  if (req.method === 'POST') {
    res.status(200).json({ success: true, cacheStr: JSON.stringify({}) })

    return
  }

  if (req.method === 'GET') {
  }

  // catch-all
  res.status(404).json({ success: false, error: 'NOT FOUND' })
  return
}
