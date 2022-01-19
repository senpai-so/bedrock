import { makePublicRouterInstance } from 'next/router'
import { v4 as uuidv4 } from 'uuid'

export interface User {
  firstName: string
  middleName: string
  lastName: string

  email: string
}

export interface Maker extends User {
  state: string
}

export interface TrackableContract {
  assetName: string
  contractAddress: string // where asset is stored on evm
  chainName: string // local | mainnet | testnet
  recipientAddress: string
}

export interface Asset extends TrackableContract {
  id: string
  assetValue: string
}

export interface Will {
  id: string
  createdAt: string
  status: string // draft | up for review | finalized | notarized
  notarized: boolean
  paid: boolean

  maker: Maker

  assets: Asset[]
  beneficiaries: User[]
}

export function createWill(): Will {
  const defaultMaker = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    state: 'Florida'
  }

  return {
    createdAt: new Date().toISOString(),
    id: uuidv4(),
    status: 'draft',
    notarized: false,
    paid: false,
    assets: [],
    beneficiaries: [],
    maker: defaultMaker
  }
}

export function createAsset(
  {
    assetName,
    contractAddress,
    chainName,
    recipientAddress
  }: TrackableContract,
  assetValue: string
): Asset {
  const existing = {
    assetName,
    contractAddress,
    chainName,
    recipientAddress
  }
  const id = uuidv4()
  return { ...existing, id, assetValue }
}
