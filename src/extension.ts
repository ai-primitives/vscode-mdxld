import * as vscode from 'vscode';
import { NamespaceProvider } from './providers/namespaceProvider';
import { MDXEditorProvider } from './providers/mdxEditorProvider';
import { ASTViewProvider } from './providers/astViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register providers
    // TODO: Implement providers
    console.log('MDX-LD extension activated');
}

export function deactivate() {}
