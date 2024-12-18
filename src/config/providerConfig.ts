export type ProviderType = 'fetch' | 'fs' | 'clickhouse'

export interface ProviderConfig {
  type: ProviderType
  // Fetch provider options
  endpoint?: string
  token?: string

  // FS provider options
  path?: string

  // Common options
  openaiApiKey?: string

  // Clickhouse specific options
  clickhouse?: {
    url: string
    username: string
    password: string
    database: string
    oplogTable: string
    dataTable: string
  }
}

export function validateConfig(config: ProviderConfig): void {
  const required = ['url', 'username', 'password', 'database', 'oplogTable', 'dataTable'] as const
  let missing: (typeof required)[number][] = []

  switch (config.type) {
    case 'fetch':
      if (!config.endpoint || !config.token) {
        throw new Error('Fetch provider requires endpoint and token')
      }
      break
    case 'fs':
      if (!config.openaiApiKey) {
        throw new Error('FS provider requires openaiApiKey')
      }
      break
    case 'clickhouse':
      if (!config.clickhouse || !config.openaiApiKey) {
        throw new Error('Clickhouse provider requires clickhouse configuration and openaiApiKey')
      }
      missing = required.filter((field) => !(field in config.clickhouse!))
      if (missing.length > 0) {
        throw new Error(`Clickhouse provider missing required fields: ${missing.join(', ')}`)
      }
      break
  }
}

export function createProviderConfig(type: ProviderType, options: Partial<ProviderConfig>): ProviderConfig {
  const config: ProviderConfig = { type, ...options }
  validateConfig(config)
  return config
}
