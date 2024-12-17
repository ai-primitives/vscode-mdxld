import * as vscode from 'vscode';
import type { DatabaseProvider, Document } from '../mocks/types';
import { MockDatabaseProvider } from '../mocks/mockDb';

interface NamespaceItem extends vscode.TreeItem {
    uri: string;
    type: 'namespace' | 'collection';
    namespace?: string;
    collectionName?: string;
    provider?: DatabaseProvider<Document>;
}

export class NamespaceProvider implements vscode.TreeDataProvider<NamespaceItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NamespaceItem | undefined | null | void> = new vscode.EventEmitter<NamespaceItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NamespaceItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private searchQuery: string = '';
    private providers: DatabaseProvider<Document>[] = [];

    constructor(private readonly context: vscode.ExtensionContext) {
        this.initializeProviders();
    }

    private async initializeProviders() {
        // Initialize with mock providers for development
        const localProvider = new MockDatabaseProvider('file://local');
        const remoteProvider = new MockDatabaseProvider('https://mdx.org.ai');

        this.providers.push(localProvider, remoteProvider);
        this.refresh();
    }

    getTreeItem(element: NamespaceItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: NamespaceItem): Promise<NamespaceItem[]> {
        if (!element) {
            return this.getNamespaces();
        }
        return this.getCollections(element);
    }

    private async getNamespaces(): Promise<NamespaceItem[]> {
        const items: NamespaceItem[] = [];

        for (const provider of this.providers) {
            const item = new vscode.TreeItem(provider.namespace, vscode.TreeItemCollapsibleState.Collapsed);
            (item as NamespaceItem).uri = provider.namespace;
            (item as NamespaceItem).type = 'namespace';
            (item as NamespaceItem).provider = provider;
            items.push(item as NamespaceItem);
        }

        if (this.searchQuery) {
            return items.filter((item: NamespaceItem) =>
                item.label?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        return items;
    }

    private async getCollections(element: NamespaceItem): Promise<NamespaceItem[]> {
        if (!element.provider) return [];

        try {
            const collections = await element.provider.list();
            const items = collections.map((name: string) => {
                const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
                (item as NamespaceItem).uri = `${element.uri}/${name}`;
                (item as NamespaceItem).type = 'collection';
                (item as NamespaceItem).namespace = element.uri;
                (item as NamespaceItem).collectionName = name;
                return item as NamespaceItem;
            });

            if (this.searchQuery) {
                return items.filter((item: NamespaceItem) =>
                    item.label?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            }

            return items;
        } catch (error) {
            console.error('Error fetching collections:', error);
            return [];
        }
    }

    setSearchQuery(query: string): void {
        this.searchQuery = query;
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}
