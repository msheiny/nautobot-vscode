import { exec } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { openNautobotApp as openNautobotSystemApp } from './utils/docker';
import { gatherTaskFiles } from './utils/utils';

export const openVNC = vscode.commands.registerCommand('nautobot.openSeleniumVNC', () => {
	/*
	Pop open whatever system application handle VNC connections to the selected selenium container.
	*/
	openNautobotSystemApp({privatePort: 5900, containerName: 'selenium', uriPrefix: 'vnc://:secret@'});
});

export const openWeb = vscode.commands.registerCommand('nautobot.openWeb', () => {
	/*
	Pop open system web browser to the chosen nautobot console page.
	*/
	openNautobotSystemApp({privatePort: 8080, containerName: '-nautobot', uriPrefix: 'http://'});
});

export const startServices = vscode.commands.registerCommand('nautobot.start', async () => {
	const tasksPyFiles = await gatherTaskFiles();
	if (tasksPyFiles.length === 0) { return; }

	// If theres more than one, filter to tasks.py files that includes a line
	// that has "def debug(context" in it. If that includes more than one prompt
	// user which one to use.
	const debugTasksPyFiles = [];
	for (const file of tasksPyFiles) {
		const document = await vscode.workspace.openTextDocument(file);
		const text = document.getText();
		if (text.includes('def debug(context')) {
			debugTasksPyFiles.push(file);
		}
	}

	let selectedFile;
	if (debugTasksPyFiles.length > 1) {
		const fileOptions = debugTasksPyFiles.map(file => ({
			label: file.fsPath,
			file
		}));
		const selected = await vscode.window.showQuickPick(fileOptions, { placeHolder: 'Select a tasks.py file to use' });
		if (!selected) {
			return;
		}
		selectedFile = selected.file;
	} else if (debugTasksPyFiles.length === 1) {
		selectedFile = debugTasksPyFiles[0];
	} else {
		vscode.window.showErrorMessage('No tasks.py files with "def debug(context" found');
		return;
	}

	// Ask user whether they want to start in "debug" mode or "normal" mode
	const mode = await vscode.window.showQuickPick(['debug', 'normal'], { placeHolder: 'Select mode to start services' });
	if (!mode) {
		return;
	}

	const command = mode === 'debug' ? 'poetry run inv debug' : 'poetry run inv start';
	const cwd = selectedFile.fsPath.replace('/tasks.py', '');

	if (mode === 'debug') {
		const terminal = vscode.window.createTerminal('Nautobot Debug');
		terminal.sendText(`cd ${selectedFile.fsPath.replace('/tasks.py', '')}`);
		terminal.sendText('poetry run inv debug');
		terminal.show();
	} else {
		exec(command, { cwd }, (error, stdout, stderr) => {
			console.log(stdout);
			if (error) {
				vscode.window.showErrorMessage(`Failed to start Nautobot services: ${stderr}`);
				return;
			}
			vscode.window.showInformationMessage('Nautobot services started successfully');
		});
	}
	});

export const invokeRunner = vscode.commands.registerCommand('nautobot.invoke', async () => {
	const tasksPyFiles = await gatherTaskFiles();
	if ( tasksPyFiles.length === 0) { return; }

	var cdPath: string;

	if (tasksPyFiles.length > 1) {
		const fileOptions = tasksPyFiles.map(file => ({
			label: path.basename(path.dirname(file.fsPath)),
			file: path.dirname(file.fsPath)
		}));
		const filePath = await vscode.window.showQuickPick(fileOptions, { placeHolder: 'Select project to run against' });
		if (!filePath) {
			return;
		}
		cdPath = filePath.file;
	} else {
		cdPath = path.dirname(tasksPyFiles[0].fsPath);
	}

	exec("poetry run inv --complete", { cwd: cdPath}, async (error, stdout, stderr) => {
		console.log(stdout);
		if (error) {
			vscode.window.showErrorMessage(`Failed to get invoke tasks: ${stderr}`);
			return;
		}
		const invokeTasks = stdout.trim().split('\n').map(line => ({label: line, task: line}));
		const invTask = await vscode.window.showQuickPick(invokeTasks, { placeHolder: 'Select task to run' });

		if (!invTask) {
			return;
		}

		const terminal = vscode.window.createTerminal({cwd: cdPath, name: 'Nautobot Invoke'});
		terminal.sendText(`poetry run inv ${invTask.task}`);
		terminal.show();
	});

});
