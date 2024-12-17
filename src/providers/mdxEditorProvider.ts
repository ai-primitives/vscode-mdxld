import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { MDXLD } from 'mdxld';
import { validateAgainstSchema, enrichMetadata } from '../schemas';

export class MDXEditorProvider implements vscode.CustomTextEditorProvider {
    private static readonly viewType = 'mdxld.editor';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new MDXEditorProvider(context);
        return vscode.window.registerCustomEditorProvider(
            MDXEditorProvider.viewType,
            provider,
            {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false,
            }
        );
    }

    /**
     * Resolves a custom text editor for MDX files
     * @param document The document to resolve
     * @param webviewPanel The webview panel to use
     * @param _token Cancellation token (unused but required by VS Code API)
     */
    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist')
            ]
        };

        const monacoScriptUri = webviewPanel.webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                'node_modules',
                'monaco-editor',
                'min',
                'vs',
                'loader.js'
            )
        );

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, monacoScriptUri);

        const _changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.updateWebview(webviewPanel.webview, document);
                this.validateDocument(document);
            }
        });

        webviewPanel.webview.onDidReceiveMessage(
            async message => {
                switch (message.type) {
                    case 'update':
                        this.updateTextDocument(document, message.content);
                        break;
                    case 'validate':
                        await this.validateSchema(document, message.frontmatter);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );

        this.updateWebview(webviewPanel.webview, document);
        await this.validateDocument(document);
    }

    private getHtmlForWebview(webview: vscode.Webview, monacoScriptUri: vscode.Uri): string {
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'editor.css')
        );

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="${styleUri}">
                <title>MDX Editor</title>
            </head>
            <body>
                <div class="editor-container">
                    <div id="editor"></div>
                </div>
                <script src="${monacoScriptUri}"></script>
                <script>
                    require.config({ paths: { vs: 'vs' } });
                    require(['vs/editor/editor.main'], function() {
                        const editor = monaco.editor.create(document.getElementById('editor'), {
                            value: '',
                            language: 'markdown',
                            theme: 'vs-dark',
                            automaticLayout: true,
                            minimap: { enabled: true },
                            wordWrap: 'on'
                        });

                        window.addEventListener('message', event => {
                            const message = event.data;
                            switch (message.type) {
                                case 'update':
                                    const content = message.content;
                                    if (content !== editor.getValue()) {
                                        editor.setValue(content);
                                    }
                                    break;
                            }
                        });

                        editor.onDidChangeModelContent(() => {
                            const content = editor.getValue();
                            vscode.postMessage({
                                type: 'update',
                                content
                            });
                        });
                    });
                </script>
            </body>
            </html>
        `;
    }

    private updateWebview(webview: vscode.Webview, document: vscode.TextDocument): void {
        const content = document.getText();
        webview.postMessage({
            type: 'update',
            content,
        });
    }

    private updateTextDocument(document: vscode.TextDocument, content: string): void {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            content
        );
        vscode.workspace.applyEdit(edit);
    }

    private async validateDocument(document: vscode.TextDocument): Promise<void> {
        try {
            const content = document.getText();
            const [yamlContent, ...mdxContent] = content.split('---\n').filter(Boolean);

            if (!yamlContent) return;

            const frontmatter = yaml.parse(yamlContent);
            if (!frontmatter || typeof frontmatter !== 'object') return;

            await this.validateSchema(document, frontmatter);

            if (mdxContent.join('---\n').includes('export const layout') || mdxContent.join('---\n').includes('export const components')) {
                vscode.window.showInformationMessage('UI components detected. Validation will be added in a future update.');
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Validation failed: ${error.message}`);
            } else {
                vscode.window.showErrorMessage('Validation failed with unknown error');
            }
        }
    }

    private async validateSchema(document: vscode.TextDocument, frontmatter: unknown): Promise<void> {
        if (!frontmatter || typeof frontmatter !== 'object') return;

        const metadata = frontmatter as Record<string, unknown>;

        if ('$type' in metadata) {
            const type = metadata.$type as string;
            try {
                const mdxldContent: MDXLD = {
                    $type: type,
                    $context: metadata.$context as string,
                    data: metadata,
                    content: document.getText()
                };

                const validationResult = await validateAgainstSchema(type, mdxldContent);
                if (!validationResult.isValid && validationResult.errors) {
                    validationResult.errors.forEach(error => {
                        vscode.window.showErrorMessage(`Schema validation error: ${error}`);
                    });
                }

                if ('$context' in metadata) {
                    const enriched = await enrichMetadata(mdxldContent, metadata.$context as string);
                    console.log('Enriched metadata:', enriched);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    vscode.window.showErrorMessage(`Schema validation failed: ${error.message}`);
                } else {
                    vscode.window.showErrorMessage('Schema validation failed with unknown error');
                }
            }
        }
    }
}
