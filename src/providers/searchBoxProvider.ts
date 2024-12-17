import * as vscode from 'vscode';

export class SearchBoxProvider {
    private _onDidChangeSearch: vscode.EventEmitter<string> = new vscode.EventEmitter<string>();
    readonly onDidChangeSearch: vscode.Event<string> = this._onDidChangeSearch.event;

    constructor(private context: vscode.ExtensionContext) {}

    public static register(context: vscode.ExtensionContext): SearchBoxProvider {
        const provider = new SearchBoxProvider(context);
        const searchBox = vscode.window.createInputBox();

        searchBox.placeholder = 'Search namespaces and collections...';
        searchBox.onDidChangeValue(value => {
            provider._onDidChangeSearch.fire(value);
        });

        // Show the input box in the title of the namespace view
        const namespaceView = vscode.window.createTreeView('mdxldNamespaces', {
            treeDataProvider: undefined, // Will be set by the namespace provider
            showCollapseAll: true
        });

        namespaceView.title = 'MDX-LD Namespaces';
        namespaceView.description = 'Search and browse namespaces';

        // Add the search box to the view's title
        context.subscriptions.push(
            vscode.window.registerTreeDataProvider('mdxldNamespaces', {
                getTreeItem: () => new vscode.TreeItem(''),
                getChildren: () => Promise.resolve([]),
                onDidChangeTreeData: new vscode.EventEmitter<void>().event
            })
        );

        return provider;
    }
}
