// because ts compiler complains about using empty `{}` in props
export type EmptyProps = Record<string, unknown>

// Cache

export type CacheContent = {
  assets: string[]
  cid: string
  contract_addr: string
  chain_id: string
  config: Config
}

export type CacheResponse = {
  success: boolean
  cacheStr?: string | null
  error?: string
}

// Contract Messages
export type MintMsg = {
  token_id: string
  owner: string | undefined
  token_uri: string | undefined
  extension: Metadata | undefined
}

export type Metadata = {
  animation_url: string | undefined
  attributes: Trait[] | undefined
  background_color: string | undefined
  description: string | undefined
  external_url: string | undefined
  image: string | undefined
  image_data: string | undefined
  name: string | undefined
  youtube_url: string | undefined
}

export type Trait = {
  trait_type: string
  value: string
  display_type: string | undefined
}

export type Config = {
  name: string
  symbol: string
  price: Coin
  treasury_account: string
  start_time?: number | undefined
  end_time?: number | undefined
  max_token_count: number
  is_mint_public: boolean
}

// Responses

export type NftInfoResponse = {
  extension: Metadata | undefined
  // token_uri: string | undefined
}

// Helpers

export type Coin = {
  amount: string
  denom: string
}


/// Legacy

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

export interface OwnerOf {
  owner: string
}

export interface NumTokensResponse {
  count: number
}