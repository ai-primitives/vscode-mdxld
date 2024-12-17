import * as vscode from 'vscode';

export class ASTViewProvider implements vscode.WebviewViewProvider {
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        if (!_token.isCancellationRequested) {
            console.log('Context state:', !!_context);
            webviewView.webview.html = '<h1>AST View Coming Soon</h1>';
        }
    }
}
