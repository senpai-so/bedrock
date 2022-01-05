import { IPFS, create, globSource } from 'ipfs-core';
import { CacheContent, loadCache, saveCache } from '../utils/cache';
import fs from 'fs';
import path from 'path';

// Types

type Manifest = {
  token_id: string,
  owner: string,
  name: string,
  description: string,
  image: string,
  extension: undefined,
}



const IMG_TYPE = ".jpg";


// Functionality

export const upload = async (
  cacheName: string,
  env: string,
  path: string, 
  ) => {
    const node = await create();
    const savedContent = loadCache(cacheName, env);
    const cacheContent: CacheContent = savedContent || { program: {}, items: {}, env: env, cacheName: cacheName };



    const assets = await ipfsUpload(node, path);
    cacheContent.items = assets;
    saveCache(cacheName, env, cacheContent);
    return;
}


const ipfsUpload = async (node: IPFS, dirPath: string) => {

  const uploadToIpfs = async (source: any) => {
    const { cid } = await node.add(source).catch();
    return cid;
  }

  const names = new Set(
    fs
    .readdirSync(dirPath) // will these be relative or absolute???
    .map( fName => fName.split('.')[0])
  );
  
  const assets = new Map<string, { mediaUrl: string, manifestUrl: string, name: string }>();

  names.forEach(async fName => {

    const media = fs.readFileSync(path.join(dirPath, fName + IMG_TYPE)).toString()

    const mediaHash = await uploadToIpfs(media);
    const mediaUrl = `https://ipfs.io/ipfs/${mediaHash}`;
    console.log('mediaUrl:', mediaUrl);

    // maybe sleep 500

    const manifestJson: Manifest = JSON.parse(
      JSON.stringify(
        fs.readFileSync(
          path.join(dirPath, fName + '.json')
      )));
    manifestJson.image = mediaUrl;

    const manifestHash = await uploadToIpfs(Buffer.from(JSON.stringify(manifestJson)));
    // maybe sleep 500

    const manifestUrl = `https://ipfs.io/ipfs/${manifestHash}`;
    console.log("manifestUrl:", manifestUrl);

    assets.set(fName, { mediaUrl: mediaUrl, manifestUrl: manifestUrl, name: manifestJson.name })
  });

  return assets
}
