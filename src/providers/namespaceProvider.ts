import * as vscode from 'vscode'
import type { BaseProvider } from './types/mdxdb'
import { ProviderFactory } from './providerFactory'

interface NamespaceItem extends vscode.TreeItem {
  uri: string
  type: 'namespace' | 'collection'
  namespace?: string
  collectionName?: string
  provider?: BaseProvider
}

export class NamespaceProvider implements vscode.TreeDataProvider<NamespaceItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<NamespaceItem | undefined | null | void> = new vscode.EventEmitter<
    NamespaceItem | undefined | null | void
  >()
  readonly onDidChangeTreeData: vscode.Event<NamespaceItem | undefined | null | void> = this._onDidChangeTreeData.event

  private searchQuery: string = ''
  private providers: BaseProvider[] = []

  constructor(private readonly _context: vscode.ExtensionContext) {
    this.initializeProviders()
  }

  private async initializeProviders() {
    try {
      const provider = await ProviderFactory.createProvider()
      this.providers = [provider]
      this.refresh()
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to initialize provider: ${error}`)
    }
  }

  getTreeItem(element: NamespaceItem): vscode.TreeItem {
    return element
  }

  async getChildren(element?: NamespaceItem): Promise<NamespaceItem[]> {
    if (!element) {
      return this.getNamespaces()
    }
    return this.getCollections(element)
  }

  private async getNamespaces(): Promise<NamespaceItem[]> {
    const items: NamespaceItem[] = []

    for (const provider of this.providers) {
      const namespaces = await provider.list()
      for (const namespace of namespaces) {
        const item = new vscode.TreeItem(namespace, vscode.TreeItemCollapsibleState.Collapsed)
        Object.assign(item, {
          uri: namespace,
          type: 'namespace',
          provider,
        } as Partial<NamespaceItem>)
        items.push(item as NamespaceItem)
      }
    }

    if (this.searchQuery) {
      return items.filter((item) => (item as vscode.TreeItem).label?.toString().toLowerCase().includes(this.searchQuery.toLowerCase()))
    }

    return items
  }

  private async getCollections(element: NamespaceItem): Promise<NamespaceItem[]> {
    if (!element.provider) return []

    try {
      const collections = await element.provider.list()
      const items = collections.map((name: string) => {
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None)
        Object.assign(item, {
          uri: `${element.uri}/${name}`,
          type: 'collection',
          namespace: element.uri,
          collectionName: name,
        } as Partial<NamespaceItem>)
        return item as NamespaceItem
      })

      if (this.searchQuery) {
        return items.filter((item) => (item as vscode.TreeItem).label?.toString().toLowerCase().includes(this.searchQuery.toLowerCase()))
      }

      return items
    } catch (error) {
      console.error('Error fetching collections:', error)
      vscode.window.showErrorMessage(`Failed to fetch collections: ${error}`)
      return []
    }
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query
    this.refresh()
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }
}
