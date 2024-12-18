import { describe, it, expect, vi, beforeEach } from 'vitest';
import type * as vscode from 'vscode';
import { ProviderFactory } from '../../providers/providerFactory';
import { MockFetchProvider, MockFSProvider, MockClickHouseProvider } from '../../providers/mockProviders';

// Mock vscode module
vi.mock('vscode', () => ({
  env: {
    uiKind: {
      Web: 1,
      Desktop: 2
    }
  },
  Uri: {
    file: (path: string) => ({ path })
  },
  workspace: {
    getConfiguration: vi.fn()
  },
  window: {
    showErrorMessage: vi.fn()
  },
  ExtensionContext: class {},
  UIKind: {
    Web: 1,
    Desktop: 2
  }
}));

describe('Provider Tests', () => {
    const mockContext = {
        extensionPath: '/test',
        subscriptions: [],
        workspaceState: {
            get: () => undefined,
            update: () => Promise.resolve()
        },
        globalState: {
            get: () => undefined,
            update: () => Promise.resolve()
        },
        secrets: {
            get: () => Promise.resolve(undefined),
            store: () => Promise.resolve()
        },
        extensionUri: { path: '/test' }
    } as unknown as vscode.ExtensionContext;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Web Environment Only Allows Fetch Provider', async () => {
        const vscodeModule = await import('vscode');
        (vscodeModule.env as { uiKind: number }).uiKind = vscodeModule.UIKind.Web;

        const config = {
            get: (key: string) => {
                const fullKey = key.startsWith('mdxld.') ? key : `mdxld.${key}`;
                switch (fullKey) {
                    case 'mdxld.provider':
                        return 'fetch';
                    case 'mdxld.fetch.endpoint':
                        return 'https://api.test.com';
                    case 'mdxld.fetch.token':
                        return 'test-token';
                    default:
                        return undefined;
                }
            }
        };
        ((vscodeModule.workspace.getConfiguration as unknown) as { mockReturnValue: (config: unknown) => void }).mockReturnValue(config);

        const provider = await ProviderFactory.createProvider(mockContext);
        expect(provider).toBeInstanceOf(MockFetchProvider);
    });

    it('Desktop Environment Supports All Providers', async () => {
        const vscodeModule = await import('vscode');
        (vscodeModule.env as { uiKind: number }).uiKind = vscodeModule.UIKind.Desktop;

        const testCases = [
            {
                type: 'fetch',
                config: {
                    'mdxld.provider': 'fetch',
                    'mdxld.fetch.endpoint': 'https://api.test.com',
                    'mdxld.fetch.token': 'test-token'
                },
                expectedClass: MockFetchProvider
            },
            {
                type: 'fs',
                config: {
                    'mdxld.provider': 'fs',
                    'mdxld.fs.path': '/test/path',
                    'mdxld.openaiApiKey': 'test-key'
                },
                expectedClass: MockFSProvider
            },
            {
                type: 'clickhouse',
                config: {
                    'mdxld.provider': 'clickhouse',
                    'mdxld.clickhouse.url': 'http://localhost:8123',
                    'mdxld.clickhouse.username': 'default',
                    'mdxld.clickhouse.password': 'password',
                    'mdxld.clickhouse.database': 'test',
                    'mdxld.clickhouse.oplogTable': 'oplog',
                    'mdxld.clickhouse.dataTable': 'data',
                    'mdxld.openaiApiKey': 'test-key'
                },
                expectedClass: MockClickHouseProvider
            }
        ];

        for (const testCase of testCases) {
            const config = {
                get: (key: string) => {
                    const fullKey = key.startsWith('mdxld.') ? key : `mdxld.${key}`;
                    return testCase.config[fullKey as keyof typeof testCase.config] ?? undefined;
                }
            };
            ((vscodeModule.workspace.getConfiguration as unknown) as { mockReturnValue: (config: unknown) => void }).mockReturnValue(config);

            const provider = await ProviderFactory.createProvider(mockContext);
            expect(provider).toBeInstanceOf(testCase.expectedClass);
        }
    });

    it('Invalid Configuration Throws Error', async () => {
        const vscodeModule = await import('vscode');
        const config = {
            get: () => undefined
        };
        ((vscodeModule.workspace.getConfiguration as unknown) as { mockReturnValue: (config: unknown) => void }).mockReturnValue(config);

        await expect(ProviderFactory.createProvider(mockContext)).rejects.toThrow(/Missing required configuration/);
    });
});
