import type { DatabaseProvider, Document, CollectionProvider, FilterQuery, SearchOptions, SearchResult, VectorSearchOptions } from './types';

class MockCollectionProvider implements CollectionProvider {
  constructor(public path: string) {}

  async create(): Promise<void> {}

  /**
   * Get documents from a collection
   * @param _collection Collection name (unused in mock implementation)
   */
  async get(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _collection: string
  ): Promise<Document[]> {
    return [
      {
        $type: 'https://schema.org/Article',
        $context: 'https://schema.org',
        content: '# Sample MDX\n\nThis is a sample document',
        data: {
          title: 'Sample Document',
          id: 'doc1',
          collections: ['docs'],
          documentType: 'documentation'
        },
        collections: ['docs'],
        metadata: { type: 'documentation' }
      },
      {
        $type: 'https://schema.org/BlogPosting',
        $context: 'https://schema.org',
        content: '# Another MDX\n\nThis is another sample',
        data: {
          title: 'Another Document',
          id: 'doc2',
          collections: ['blog'],
          documentType: 'blog'
        },
        collections: ['blog'],
        metadata: { type: 'blog' }
      }
    ];
  }

  async add(): Promise<void> {}
  async update(): Promise<void> {}
  async delete(): Promise<void> {}

  async find(_filter: FilterQuery<Document>, options?: SearchOptions): Promise<Document[]> {
    return this.get(options?.collection || '');
  }

  async search(_query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const docs = await this.get(options?.collection || '');
    return docs.map(doc => ({ document: doc, score: 1.0 }));
  }

  async vectorSearch(_options: VectorSearchOptions & SearchOptions): Promise<SearchResult[]> {
    const docs = await this.get(_options?.collection || '');
    return docs.map(doc => ({ document: doc, score: 1.0 }));
  }
}

export class MockDatabaseProvider implements DatabaseProvider {
  collections: CollectionProvider;

  constructor(public namespace: string) {
    this.collections = new MockCollectionProvider(namespace);
  }

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}

  async list(): Promise<string[]> {
    return ['docs', 'blog', 'components'];
  }

  collection(name: string): CollectionProvider {
    return new MockCollectionProvider(`${this.namespace}/${name}`);
  }
}
