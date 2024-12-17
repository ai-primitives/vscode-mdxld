import * as vscode from 'vscode';
import type { DatabaseProvider, Document } from '@mdxdb/types';
import { FSCollection } from '@mdxdb/fs';
import { FetchProvider } from '@mdxdb/fetch';
import { createClickHouseClient } from '@mdxdb/clickhouse';

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

    constructor() {
        this.initializeProviders();
    }

    private async initializeProviders() {
        const fsProvider = new FSCollection(process.cwd(), 'mdx');
        const fetchProvider = new FetchProvider<Document>({
            namespace: 'http://mdx.org.ai',
            baseUrl: 'https://api.mdx.org.ai'
        });

        try {
            const clickhouseProvider = await createClickHouseClient({
                url: 'http://localhost:8123',
                database: 'mdx',
                username: 'default',
                password: ''
            });
            this.providers.push(clickhouseProvider);
        } catch (error) {
            console.warn('ClickHouse provider not available:', error);
        }

        this.providers.push(fsProvider as unknown as DatabaseProvider<Document>, fetchProvider);
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
