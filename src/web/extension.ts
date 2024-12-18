import * as vscode from 'vscode';
import { activate as commonActivate } from '../extension';

export function activate(context: vscode.ExtensionContext) {
  // Web version only supports fetch provider
  if (context.extensionKind !== vscode.ExtensionKind.Workspace) {
    vscode.window.showErrorMessage('Web version only supports fetch provider');
    return;
  }
  return commonActivate(context);
}

export function deactivate() {
  // Clean up resources
}
