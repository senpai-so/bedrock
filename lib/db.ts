import { Will, createWill } from './models'

export function fetchWills(): Will[] {
  return fetchWillsLocal()
}

export function saveWills(wills: Will[]): boolean {
  return saveWillsLocal(wills)
}

function fetchWillsLocal(): Will[] {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wills')
      ? JSON.parse(localStorage.getItem('wills') as string)
      : []
  }

  return []
}

function saveWillsLocal(wills: Will[]): boolean {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('wills', JSON.stringify(wills))
      return true
    } catch (e) {
      return false
    }
  }

  return false
}
