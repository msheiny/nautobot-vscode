import * as vscode from 'vscode';
import { invokeRunner, openDocs, openVNC, openWeb, startServices } from './commands';
import { NautobotCodeLensProvider } from './utils/docviewer';

export function activate(context: vscode.ExtensionContext) {

	console.log('"nautobot" extension activated');

	const codeLensProvider = new NautobotCodeLensProvider();

	context.subscriptions.push(openWeb,
		startServices,
		invokeRunner,
		openVNC,
		openDocs,
		vscode.languages.registerCodeLensProvider({ language: 'python' }, codeLensProvider)
	);
}
