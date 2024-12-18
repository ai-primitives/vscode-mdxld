// Mock types based on @mdxdb interfaces
export interface FetchProviderConfig {
  endpoint: string;
  token: string;
}

export interface FSProviderConfig {
  path?: string;
  openaiApiKey: string;
}

export interface ClickHouseProviderConfig {
  url: string;
  username: string;
  password: string;
  database: string;
  oplogTable: string;
  dataTable: string;
  openaiApiKey: string;
}

export interface BaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  list(): Promise<string[]>;
}

export interface FetchProvider extends BaseProvider {
  config: FetchProviderConfig;
}

export interface FSProvider extends BaseProvider {
  config: FSProviderConfig;
}

export interface ClickHouseProvider extends BaseProvider {
  config: ClickHouseProviderConfig;
}
