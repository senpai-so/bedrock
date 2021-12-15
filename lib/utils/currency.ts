const DOLLARS_TO_CENTS = 100

export function dollarsToCents(dollars: number) {
  return dollars * DOLLARS_TO_CENTS
}

export function centsToDollars(cents: number) {
  return Math.round(cents / DOLLARS_TO_CENTS)
}
