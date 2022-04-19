import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { create, CID } from 'ipfs-http-client'

export const getFiles = async (cid: string) => {
  const url = 'https://dweb.link/api/v0'
  const ipfs = create({ url })

  const docs = []
  for await (const doc of ipfs.ls(cid)) {
    docs.push(doc)
  }
  return docs
}

export const getFileContents = async (path: string) => {
  const url = 'https://dweb.link/api/v0'
  if (true) console.log('')
  const ipfs = create({ url })

  const bufs: Uint8Array[] = []
  for await (const buf of ipfs.cat(path)) {
    bufs.push(buf)
  }
  const data = uint8ArrayConcat(bufs)
  return uint8ArrayToString(data)
}

export const parseFiles = (
  files: {
    cid: CID
    name: string
    path: string
    size: number
    type: string
  }[]
) => {
  const images: string[] = []
  for (const file of files) {
    if (file.name.endsWith('.json')) continue
    images.push(file.name)
  }
  return images
}
