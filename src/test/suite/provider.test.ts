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
            get: (key: string) => Promise.resolve(undefined),
            store: (key: string, value: string) => Promise.resolve()
        },
        extensionUri: { path: '/test' }
    } as unknown as vscode.ExtensionContext;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Web Environment Only Allows Fetch Provider', async () => {
        const vscodeModule = await import('vscode');
        (vscodeModule.env as any).uiKind = vscodeModule.UIKind.Web;

        const config = {
            get: (key: string) => {
                switch (key) {
                    case 'fetch.endpoint':
                        return 'https://api.test.com';
                    case 'fetch.token':
                        return 'test-token';
                    default:
                        return undefined;
                }
            }
        };
        (vscodeModule.workspace.getConfiguration as any).mockReturnValue(config);

        const provider = await ProviderFactory.createProvider(mockContext);
        expect(provider).toBeInstanceOf(MockFetchProvider);
    });

    it('Desktop Environment Supports All Providers', async () => {
        const vscodeModule = await import('vscode');
        (vscodeModule.env as any).uiKind = vscodeModule.UIKind.Desktop;

        const testCases = [
            {
                type: 'fetch',
                config: {
                    'provider': 'fetch',
                    'fetch.endpoint': 'https://api.test.com',
                    'fetch.token': 'test-token'
                },
                expectedClass: MockFetchProvider
            },
            {
                type: 'fs',
                config: {
                    'provider': 'fs',
                    'fs.path': '/test/path',
                    'openaiApiKey': 'test-key'
                },
                expectedClass: MockFSProvider
            },
            {
                type: 'clickhouse',
                config: {
                    'provider': 'clickhouse',
                    'clickhouse.url': 'http://localhost:8123',
                    'clickhouse.username': 'default',
                    'clickhouse.password': 'password',
                    'clickhouse.database': 'test',
                    'clickhouse.oplogTable': 'oplog',
                    'clickhouse.dataTable': 'data',
                    'openaiApiKey': 'test-key'
                },
                expectedClass: MockClickHouseProvider
            }
        ];

        for (const testCase of testCases) {
            const config = {
                get: (key: string) => testCase.config[key as keyof typeof testCase.config] ?? undefined
            };
            (vscodeModule.workspace.getConfiguration as any).mockReturnValue(config);

            const provider = await ProviderFactory.createProvider(mockContext);
            expect(provider).toBeInstanceOf(testCase.expectedClass);
        }
    });

    it('Invalid Configuration Throws Error', async () => {
        const vscodeModule = await import('vscode');
        const config = {
            get: () => undefined
        };
        (vscodeModule.workspace.getConfiguration as any).mockReturnValue(config);

        await expect(ProviderFactory.createProvider(mockContext)).rejects.toThrow(/Missing required configuration/);
    });
});
