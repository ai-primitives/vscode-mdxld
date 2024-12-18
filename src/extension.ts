import * as vscode from 'vscode';
import { NamespaceProvider } from './providers/namespaceProvider';
import { MDXEditorProvider } from './providers/mdxEditorProvider';
import { ASTViewProvider } from './providers/astViewProvider';

export async function activate(extensionContext: vscode.ExtensionContext) {
  try {
    // Register providers
    const namespaceProvider = new NamespaceProvider(extensionContext);
    const astViewProvider = new ASTViewProvider(extensionContext);

    // Register MDX editor using its static register method
    const mdxEditorDisposable = MDXEditorProvider.register(extensionContext);

    // Register commands
    const searchDisposable = vscode.commands.registerCommand('mdxld.showSearch', async () => {
      const query = await vscode.window.showInputBox({
        placeHolder: 'Search namespaces and collections...',
        prompt: 'Enter search term',
      });
      if (query !== undefined) {
        namespaceProvider.setSearchQuery(query);
      }
    });

    const refreshDisposable = vscode.commands.registerCommand('mdxld.refreshNamespaces', () => {
      namespaceProvider.refresh();
    });

    extensionContext.subscriptions.push(
      mdxEditorDisposable,
      searchDisposable,
      refreshDisposable,
      vscode.window.registerTreeDataProvider('mdxldNamespaces', namespaceProvider),
      vscode.window.registerWebviewViewProvider('mdxld.astView', astViewProvider),
    );

    // Log successful activation
    console.log('MDX-LD extension activated successfully');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to activate MDX-LD extension: ${error}`);
    throw error; // Re-throw to ensure VS Code knows activation failed
  }
}

export function deactivate() {
  // Clean up resources if needed
  console.log('MDX-LD extension deactivated');
}
