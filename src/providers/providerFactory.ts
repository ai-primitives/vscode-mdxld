import * as vscode from 'vscode';
import type { BaseProvider } from './types/mdxdb';
import { MockFetchProvider, MockFSProvider, MockClickHouseProvider } from './mockProviders';
import { ProviderType, validateConfig } from '../config/providerConfig';

export class ProviderFactory {
  static async createProvider(context: vscode.ExtensionContext): Promise<BaseProvider> {
    const isWeb = context.extensionKind === vscode.ExtensionKind.Workspace;
    const config = vscode.workspace.getConfiguration('mdxld');

    // Get required configurations with type safety
    const getConfigValue = <T>(key: string, defaultValue?: T): T => {
      const value = config.get<T>(key, defaultValue);
      if (value === undefined) {
        throw new Error(`Missing required configuration: mdxld.${key}`);
      }
      return value;
    };

    // In web environment, only fetch provider is supported
    if (isWeb) {
      const endpoint = getConfigValue<string>('fetch.endpoint');
      const token = getConfigValue<string>('fetch.token');
      return new MockFetchProvider({ endpoint, token });
    }

    // In desktop environment, all providers are supported
    const providerType = getConfigValue<ProviderType>('provider', 'fetch');
    const openaiApiKey = getConfigValue<string>('openaiApiKey');

    switch (providerType) {
      case 'fetch': {
        const endpoint = getConfigValue<string>('fetch.endpoint');
        const token = getConfigValue<string>('fetch.token');
        return new MockFetchProvider({ endpoint, token });
      }

      case 'fs': {
        const path = config.get<string>('fs.path', '.');
        return new MockFSProvider({ path, openaiApiKey });
      }

      case 'clickhouse': {
        const url = getConfigValue<string>('clickhouse.url');
        const username = getConfigValue<string>('clickhouse.username');
        const password = getConfigValue<string>('clickhouse.password');
        const database = getConfigValue<string>('clickhouse.database');
        const oplogTable = getConfigValue<string>('clickhouse.oplogTable', 'mdxld_oplog');
        const dataTable = getConfigValue<string>('clickhouse.dataTable', 'mdxld_data');

        return new MockClickHouseProvider({
          url,
          username,
          password,
          database,
          oplogTable,
          dataTable,
          openaiApiKey
        });
      }

      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }
}
