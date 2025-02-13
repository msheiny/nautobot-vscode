import * as vscode from 'vscode';
import { invokeRunner, openVNC, openWeb, startServices } from './commands';

export function activate(context: vscode.ExtensionContext) {

	console.log('"nautobot" extension activated');

	context.subscriptions.push(openWeb, startServices, invokeRunner, openVNC);
}

// This method is called when your extension is deactivated
export function deactivate() {}
