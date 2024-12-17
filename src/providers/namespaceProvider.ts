import * as vscode from 'vscode';
import type { DatabaseProvider, Document } from '../mocks/types';
import { MockDatabaseProvider } from '../mocks/mockDb';
import { filterItems, SearchableItem } from '../utils/search';

interface NamespaceItem extends SearchableItem {
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

    constructor(private readonly _context: vscode.ExtensionContext) {
        this.initializeProviders();
    }

    private async initializeProviders() {
        const localProvider = new MockDatabaseProvider('file://local');
        const remoteProvider = new MockDatabaseProvider('https://mdx.org.ai');
        const clickhouseProvider = new MockDatabaseProvider('clickhouse://default');

        this.providers.push(localProvider, remoteProvider, clickhouseProvider);
        this.refresh();
    }

    getTreeItem(element: NamespaceItem): vscode.TreeItem {
        const item = element;

        if (element.type === 'namespace') {
            item.iconPath = new vscode.ThemeIcon('symbol-namespace');
            item.tooltip = `Namespace: ${element.uri}\nClick to expand collections`;
        } else {
            item.iconPath = new vscode.ThemeIcon('symbol-field');
            item.tooltip = `Collection: ${element.collectionName}\nNamespace: ${element.namespace}\nURI: ${element.uri}`;
        }

        return item;
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

        return filterItems(items, this.searchQuery);
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

            return filterItems(items, this.searchQuery);
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
