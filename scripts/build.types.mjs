import { generate } from 'cosmwasm-typescript-generator'
import { ROOT } from './env.mjs'

generate({
  schemaDir: path.resolve(ROOT, 'contracts/cw721-base/schema'),
  outFile: [
    path.resolve(ROOT, 'lib/contract.ts')
    // path.resolve(ROOT, 'test/src/contract.ts')
  ]
})
