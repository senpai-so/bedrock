import { createWill, Will } from 'lib/models'
import { parseCookies, setCookie } from 'nookies'

export type Opts = { maxAge: number; path: string }

export const opts: Opts = {
  maxAge: 30 * 24 * 60 * 60,
  path: '/'
}

export function fetchOrSetTempWill(): Will {
  const { will } = parseCookies()

  // upsert
  if (!will) {
    const newWill = createWill()
    setCookie(null, 'will', JSON.stringify(newWill), opts)
    return newWill
  }

  return JSON.parse(will)
}

export function updateTempWill(will: Will): void {
  setCookie(null, 'will', JSON.stringify(will), opts)
}
