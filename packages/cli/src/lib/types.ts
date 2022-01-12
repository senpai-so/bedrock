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

export type MintMsg = {
  token_id: string;
  owner: string | undefined;
  name: string;
  description: string | undefined;
  image: string | undefined;
  extension: Metadata | undefined;
}

export type Input = {
  manifest: MintMsg;
  metadata: Metadata;
};

export type InitMsg = {
  name: string;
  symbol: string;
  price: number; // amount (Uint128)
  coin: string; // denom (String)
  max_token_supply: number; // int
  treasury_account: string; 
  start_date: Date;
  end_date: Date;
  minter: string;
}