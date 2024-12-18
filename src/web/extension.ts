import * as vscode from 'vscode'
import { activate as commonActivate } from '../extension'

export function activate(context: vscode.ExtensionContext) {
  // Web version only supports fetch provider
  if (vscode.env.uiKind !== vscode.UIKind.Web) {
    vscode.window.showErrorMessage('This version is only for web environments')
    return
  }
  return commonActivate(context)
}

export function deactivate() {
  // Clean up resources
}
