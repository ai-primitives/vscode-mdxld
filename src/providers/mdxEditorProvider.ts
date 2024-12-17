import * as vscode from 'vscode';

export class MDXEditorProvider implements vscode.CustomTextEditorProvider {
    // TODO: Implement CustomTextEditorProvider interface
    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Implementation coming soon
    }
}
