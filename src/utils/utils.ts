import * as vscode from "vscode";

export async function gatherTaskFiles(): Promise<vscode.Uri[]> {
  // Sift through the workspace to find relevant Invoke tasks.py files

  const tasksPyFiles = await vscode.workspace.findFiles("**/tasks.py");
  const tasksPyFilesWithInvoke: vscode.Uri[] = [];

  for (const file of tasksPyFiles) {
    const fileContents = (
      await vscode.workspace.openTextDocument(file.fsPath)
    ).getText();
    if (fileContents.includes("from invoke import")) {
      tasksPyFilesWithInvoke.push(file);
    }
  }
  if (tasksPyFilesWithInvoke.length === 0) {
    vscode.window.showErrorMessage("No tasks.py files found.");
    return [];
  }
  return tasksPyFilesWithInvoke;
}
