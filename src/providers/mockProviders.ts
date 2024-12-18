import type { BaseProvider, FetchProvider, FSProvider, ClickHouseProvider } from './types/mdxdb'

class BaseMockProvider implements BaseProvider {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async list(): Promise<string[]> {
    return ['mock-namespace-1', 'mock-namespace-2']
  }
}

export class MockFetchProvider extends BaseMockProvider implements FetchProvider {
  constructor(public config: { endpoint: string; token: string }) {
    super()
  }
}

export class MockFSProvider extends BaseMockProvider implements FSProvider {
  constructor(public config: { path?: string; openaiApiKey: string }) {
    super()
  }
}

export class MockClickHouseProvider extends BaseMockProvider implements ClickHouseProvider {
  constructor(
    public config: {
      url: string
      username: string
      password: string
      database: string
      oplogTable: string
      dataTable: string
      openaiApiKey: string
    },
  ) {
    super()
  }
}
