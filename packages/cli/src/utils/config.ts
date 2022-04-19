import fs from 'fs'
import { Config } from '../lib/types'

export function loadConfig(path: string) {
  if (!fs.existsSync(path)) {
    return undefined
  }

  return JSON.parse(fs.readFileSync(path).toString()) as Config
}
