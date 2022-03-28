export type Trait = {
  trait_type: string;
  value: string;
  display_type: string | undefined;
}

export type Metadata = {
  animation_url: string | undefined;
  attributes: Trait[] | undefined;
  background_color: string | undefined;
  description: string | undefined;
  external_url: string | undefined;
  image: string | undefined;
  image_data: string | undefined;
  name: string | undefined;
  youtube_url: string | undefined;
}


// Messages

export type MintMsg = {
  token_id: string;
  owner: string | undefined;
  token_uri: string | undefined;
  extension: Metadata | undefined;
}

export type TransferNftMsg = {
  recipient: string;
  token_id: string;
}

export type MigrateMsg = {
  version: string;
  config: Config | null;
}

export type Config = {
  /// Name of the collection
  name: string,
  /// Symbol for the collection
  symbol: string,
  /// Cost of minting if public
  price: Coin | undefined,
  /// Address to withdraw funds to
  treasury_account: string,
  /// Time when minting becomes available
  start_time: number | undefined,
  /// Time when minting becomes unavailable
  end_time: number | undefined,
  /// Maximum number of tokens to mint
  max_token_count: number,
  /// Whether NFTs can be updated
  frozen: boolean,
  /// Whether minting is public
  is_mint_public: boolean,
}


// Helpers

export type Input = {
  manifest: MintMsg;
  metadata: Metadata;
};

type Coin = {
  amount: string; // Uint128
  denom: string;
}
