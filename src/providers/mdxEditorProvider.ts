import * as vscode from 'vscode';

export class MDXEditorProvider implements vscode.CustomTextEditorProvider {
    // TODO: Implement CustomTextEditorProvider interface
    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Implementation coming soon
        if (!_token.isCancellationRequested) {
            const fileName = document.fileName.split('/').pop() || 'Untitled';
            webviewPanel.webview.html = `<h1>MDX Editor for ${fileName}</h1>`;
        }
    }
}
