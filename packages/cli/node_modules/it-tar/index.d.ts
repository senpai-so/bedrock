import BufferList from 'bl/BufferList'

export interface TarEntryHeader {
  name: string,
  uid: number,
  gid: number,
  size: number,
  mode: number,
  mtime: Date,
  type: 'file' | 'link' | 'symlink' | 'character-device' | 'block-device' | 'directory' | 'fifo' | 'contiguous-file' | 'pax-header' | 'pax-global-header' | 'gnu-long-link-path' | 'gnu-long-path',
  linkname: string | null,
  uname: string,
  gname: string,
  devmajor: number,
  devminor: number
}

export interface TarEntry {
  header: TarEntryHeader
  body: AsyncIterable<Uint8Array>
}

export interface TarImportCandidate {
  header: Partial<TarEntryHeader> & { name: string }
  body?: AsyncIterable<Uint8Array>
}

export interface ExtractOptions {
  highWaterMark: number
  filenameEncoding: string
}

export function extract (options?: ExtractOptions): (source: AsyncIterable<Uint8Array>) => AsyncIterable<TarEntry>
export function pack (): (source: AsyncIterable<TarImportCandidate>) => AsyncIterable<BufferList>
