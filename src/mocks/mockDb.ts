import type { DatabaseProvider, Document, CollectionProvider, FilterQuery, SearchOptions, SearchResult, VectorSearchOptions } from './types';

class MockCollectionProvider implements CollectionProvider {
  constructor(public path: string) {}

  async create(collection: string): Promise<void> {}

  async get(collection: string): Promise<Document[]> {
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

  async add(collection: string, document: Document): Promise<void> {}
  async update(collection: string, id: string, document: Document): Promise<void> {}
  async delete(collection: string, id: string): Promise<void> {}

  async find(filter: FilterQuery<Document>, options?: SearchOptions): Promise<Document[]> {
    return this.get(options?.collection || '');
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const docs = await this.get(options?.collection || '');
    return docs.map(doc => ({ document: doc, score: 1.0 }));
  }

  async vectorSearch(options: VectorSearchOptions & SearchOptions): Promise<SearchResult[]> {
    const docs = await this.get(options?.collection || '');
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
