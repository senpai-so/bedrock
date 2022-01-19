import fs from 'fs';
import { InitMsg } from '../lib/types';


export function loadConfig(
  path: string,
): InitMsg | undefined {
  
  if (!fs.existsSync(path)) {
    return undefined;
  }

  return JSON.parse(fs.readFileSync(path).toString());
}