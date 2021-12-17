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

export interface NFTTokenItem {
  name?: string
  description?: string
  image?: string
  extension: Extension
  owner: string
}

export interface Extension {
  name?: string
  description?: string
  image?: string
}
