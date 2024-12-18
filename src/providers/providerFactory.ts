import * as vscode from 'vscode'
import type { BaseProvider } from './types/mdxdb'
import { MockFetchProvider, MockFSProvider, MockClickHouseProvider } from './mockProviders'
import { ProviderType } from '../config/providerConfig'

export class ProviderFactory {
  static async createProvider(): Promise<BaseProvider> {
    const isWeb = vscode.env.uiKind === vscode.UIKind.Web
    const config = vscode.workspace.getConfiguration('mdxld')

    // Get required configurations with type safety
    function getConfigValue<T>(key: string, defaultValue?: T): T {
      const value = config.get<T>(key, defaultValue!)
      if (value === undefined || value === null) {
        throw new Error(`Missing required configuration: mdxld.${key}`)
      }
      return value
    }

    // In web environment, only fetch provider is supported
    if (isWeb) {
      const endpoint = getConfigValue<string>('fetch.endpoint')
      const token = getConfigValue<string>('fetch.token')
      return new MockFetchProvider({ endpoint, token })
    }

    // In desktop environment, all providers are supported
    const providerType = getConfigValue<ProviderType>('provider', 'fetch')

    switch (providerType) {
      case 'fetch': {
        const endpoint = getConfigValue<string>('fetch.endpoint')
        const token = getConfigValue<string>('fetch.token')
        return new MockFetchProvider({ endpoint, token })
      }

      case 'fs': {
        const path = getConfigValue<string>('fs.path', '.')
        const openaiApiKey = getConfigValue<string>('openaiApiKey')
        return new MockFSProvider({ path, openaiApiKey })
      }

      case 'clickhouse': {
        const url = getConfigValue<string>('clickhouse.url')
        const username = getConfigValue<string>('clickhouse.username')
        const password = getConfigValue<string>('clickhouse.password')
        const database = getConfigValue<string>('clickhouse.database')
        const oplogTable = getConfigValue<string>('clickhouse.oplogTable', 'mdxld_oplog')
        const dataTable = getConfigValue<string>('clickhouse.dataTable', 'mdxld_data')
        const openaiApiKey = getConfigValue<string>('openaiApiKey')

        return new MockClickHouseProvider({
          url,
          username,
          password,
          database,
          oplogTable,
          dataTable,
          openaiApiKey,
        })
      }

      default:
        throw new Error(`Unsupported provider type: ${providerType}`)
    }
  }
}
