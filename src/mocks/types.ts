import type { MDXLD } from 'mdxld'

export interface Document extends MDXLD {
  embeddings?: number[]
  collections?: string[]
  metadata?: Record<string, unknown>
}

export interface DatabaseProvider<T extends Document = Document> {
  namespace: string
  collections: CollectionProvider<T>
  connect(): Promise<void>
  disconnect(): Promise<void>
  list(): Promise<string[]>
  collection(name: string): CollectionProvider<T>
}

export interface CollectionProvider<T extends Document = Document> {
  path: string
  create(collection: string): Promise<void>
  get(collection: string): Promise<T[]>
  add(collection: string, document: T): Promise<void>
  update(collection: string, id: string, document: T): Promise<void>
  delete(collection: string, id: string): Promise<void>
  find(filter: FilterQuery<T>, options?: SearchOptions<T>): Promise<T[]>
  search(query: string, options?: SearchOptions<T>): Promise<SearchResult<T>[]>
  vectorSearch(options: VectorSearchOptions & SearchOptions<T>): Promise<SearchResult<T>[]>
}

export interface SearchOptions<T extends Document = Document> {
  filter?: FilterQuery<T>
  threshold?: number
  limit?: number
  offset?: number
  includeVectors?: boolean
  collection?: string
}

export interface SearchResult<T extends Document = Document> {
  document: T
  score: number
  vector?: number[]
}

export type FilterQuery<T> = {
  [K in keyof T]?: T[K] | {
    $eq?: T[K]
    $gt?: T[K]
    $gte?: T[K]
    $lt?: T[K]
    $lte?: T[K]
    $in?: T[K][]
    $nin?: T[K][]
  }
}

export interface VectorSearchOptions {
  vector?: number[]
  query?: string
  filter?: Record<string, unknown>
  k?: number
  threshold?: number
}
