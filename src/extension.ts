import * as vscode from 'vscode';
import { NamespaceProvider } from './providers/namespaceProvider';
import { MDXEditorProvider } from './providers/mdxEditorProvider';
import { ASTViewProvider } from './providers/astViewProvider';

export function activate(extensionContext: vscode.ExtensionContext) {
    // Register providers
    const namespaceProvider = new NamespaceProvider();
    const mdxEditorProvider = new MDXEditorProvider();
    const astViewProvider = new ASTViewProvider();

    extensionContext.subscriptions.push(
        vscode.window.registerTreeDataProvider('mdxldNamespaces', namespaceProvider),
        vscode.window.registerCustomEditorProvider('mdxld.editor', mdxEditorProvider),
        vscode.window.registerWebviewViewProvider('mdxld.astView', astViewProvider)
    );
}

export function deactivate() {}
