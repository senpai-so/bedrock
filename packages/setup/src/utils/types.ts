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

export type InitMsg = {
  name: string;
  symbol: string;
  price: Coin;
  treasury_account: string; 
  start_time: number | undefined;
  end_time: number | undefined;
  max_token_count: number;
  is_mint_public: boolean;
}

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


// Helpers

type Coin = {
  amount: string;
  denom: string;
}
