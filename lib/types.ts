// because ts compiler complains about using empty `{}` in props
export type EmptyProps = Record<string, unknown>

export interface NFTContract {
  contract: string
  symbol: string
  name: string
  icon: string
  homepage: string
  marketplace: string[]
}

export interface NFTMarketplace {
  link: string
  name: string
}

// Prisma schema
export interface NftTokens {
  id: number
  token_id: string
  name: string
  description: string
  extension_name: string
  extension_image: string
  image_uri: string
  isMinted: boolean
}

export interface NFTTokenItem {
  name?: string
  description?: string
  image?: string
  extension: Extension
}

export interface Extension {
  name?: string
  description?: string
  image?: string
}

export interface OwnerOf {
  owner: string
}
