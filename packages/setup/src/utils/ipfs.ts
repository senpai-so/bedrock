// import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
// import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

export const getFiles = async (cid: string) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid: cid, assets: generateAssets() })
  }

  return fetch('http://localhost:3001/saveCid', requestOptions)
}

const generateAssets = () => {
  let result: string[] = [];
  for (let i=1; i<10; i++) {
    for (let j=1; j<556; j++) {
      result.push(`${i}-${j}.json`)
    }
  }
  return result
}

// export const getFileContents = async (path: string) => {
//   const url = 'https://bedrock.mypinata.cloud/ipfs'
//   if (true) console.log('')
//   const ipfs = await create()

//   const bufs: Uint8Array[] = []
//   for await (const buf of ipfs.cat(path)) {
//     bufs.push(buf)
//   }
//   const data = uint8ArrayConcat(bufs)
//   return uint8ArrayToString(data)
// }

// export const parseFiles = (
//   files: {
//     cid: CID
//     name: string
//     path: string
//     size: number
//     type: string
//   }[]
// ) => {
//   const images: string[] = []
//   for (const file of files) {
//     if (file.name.endsWith('.json')) continue
//     images.push(file.name)
//   }
//   return images
// }
