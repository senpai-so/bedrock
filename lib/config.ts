export const isServer = typeof window === 'undefined'
export const isDev =
  process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
export const isPreview =
  process.env.NODE_ENV !== 'development' && process.env.IS_PREVIEW

export const domain = getEnv('DOMAIN', 'loonies.world')
export const port = getEnv('PORT', '3000')
export const host = isDev ? `http://localhost:${port}` : `https://${domain}`

export const fathomId = isDev ? null : process.env.NEXT_PUBLIC_FATHOM_ID

const excludedDomains = {
  excludedDomains: ['localhost', 'localhost:3000']
}

export const fathomConfig = fathomId ? excludedDomains : undefined

export const apiBaseUrl = `${host}/api`

export const api = {
  todo: `${apiBaseUrl}/todo`
}

// ----------------------------------------------------------------------------

export const mnemonic = process.env.SIGNER_WALLET_MNEMONIC || ''

export const contractAddress =
  process.env.NFT_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
  ''

export const ownerAddress =
  process.env.SIGNER_WALLET_ADDRESS ||
  process.env.NEXT_PUBLIC_SIGNER_WALLET_ADDRESS ||
  ''

export function getEnv(
  key: string,
  defaultValue?: string,
  env = process.env
): string {
  const value = env[key]

  if (value !== undefined) {
    return value
  }

  if (defaultValue !== undefined) {
    return defaultValue
  }

  throw new Error(`Config error: missing required env variable "${key}"`)
}

export const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || ''
