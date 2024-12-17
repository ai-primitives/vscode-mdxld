import * as vscode from 'vscode';
import { NamespaceProvider } from './providers/namespaceProvider';
import { MDXEditorProvider } from './providers/mdxEditorProvider';
import { ASTViewProvider } from './providers/astViewProvider';

export function activate(extensionContext: vscode.ExtensionContext) {
    // Register providers
    const namespaceProvider = new NamespaceProvider(extensionContext);
    const mdxEditorProvider = new MDXEditorProvider(extensionContext);
    const astViewProvider = new ASTViewProvider(extensionContext);

    // Register commands
    const searchDisposable = vscode.commands.registerCommand('mdxld.showSearch', async () => {
        const query = await vscode.window.showInputBox({
            placeHolder: 'Search namespaces and collections...',
            prompt: 'Enter search term'
        });
        if (query !== undefined) {
            namespaceProvider.setSearchQuery(query);
        }
    });

    const refreshDisposable = vscode.commands.registerCommand('mdxld.refreshNamespaces', () => {
        namespaceProvider.refresh();
    });

    extensionContext.subscriptions.push(
        searchDisposable,
        refreshDisposable,
        vscode.window.registerTreeDataProvider('mdxldNamespaces', namespaceProvider),
        vscode.window.registerCustomEditorProvider('mdxld.editor', mdxEditorProvider),
        vscode.window.registerWebviewViewProvider('mdxld.astView', astViewProvider)
    );
}

export function deactivate() {}
