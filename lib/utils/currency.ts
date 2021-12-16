const DOLLARS_TO_CENTS = 100

export function dollarsToCents(dollars: number) {
  return dollars * DOLLARS_TO_CENTS
}

export function centsToDollars(cents: number) {
  return Math.round(cents / DOLLARS_TO_CENTS)
}

const ONE_LUNA_TO_ULUNA = 1000000

export function toULuna(nLuna: number) {
  return Math.round(nLuna * ONE_LUNA_TO_ULUNA)
}

const ONE_UST_TO_UUST = 1000000

export function toUUST(nUST: number) {
  return Math.round(nUST * ONE_UST_TO_UUST)
}
