import * as vscode from 'vscode';
import JSON5 from 'json5';

export class ASTViewProvider implements vscode.WebviewViewProvider {
    // TODO: Implement WebviewViewProvider interface
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        // Implementation coming soon
    }
}
