import * as vscode from "vscode";

export interface NautobotDocMapProp {
  regex: RegExp;
  url: string;
  docType: string;
}

// Map of filename patterns that will overlay documentation links in-line.
const documentationMap: NautobotDocMapProp[] = [
  {
    regex: /.*\/jobs\/.*\.py$/,
    docType: "Jobs",
    url: "https://docs.nautobot.com/projects/core/en/stable/development/jobs/",
  },
];

// Store global references to webview panels
const webviewPanels = new Map<string, vscode.WebviewPanel>();

export class NautobotCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = [];

    // Check if the file opened/navigated to, matches any regex pattern we care about
    for (const doc of documentationMap) {
      if (doc.regex.test(document.fileName)) {
        // Add a CodeLens at the top of the file
        const regex = /class\s+(\w+)\s*\(Job\):/g;
        const text = document.getText();
        let match: RegExpExecArray | null;
        const lines = text.split("\n");
        // Use regex.exec to find all matches in the document
        while ((match = regex.exec(text)) !== null) {
          const position = document.positionAt(match.index); // Get the position of the match
          const range = new vscode.Range(position, position); // Create a range for the match

          const command: vscode.Command = {
            title: `View ${doc.docType} Documentation`,
            command: "nautobot.openDocumentation",
            arguments: [doc],
            tooltip: "Open official nautobot documenation in a side panel.",
          };
          codeLenses.push(new vscode.CodeLens(range, command));
        }
      }
    }

    return codeLenses;
  }
}

export function openDocInWebview(docProps: NautobotDocMapProp) {
  // Check if we already have a panel for this document
  if (webviewPanels.has(docProps.docType)) {
    // If so, just reveal it
    webviewPanels.get(docProps.docType)!.reveal();
    return;
  }

  // Create a new panel
  const panel = vscode.window.createWebviewPanel(
    "nautobotDocs",
    `Nautobot: ${docProps.docType} Docs`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  // Store reference to panel
  webviewPanels.set(docProps.docType, panel);

  // Handle panel disposal
  panel.onDidDispose(() => {
    webviewPanels.delete(docProps.docType);
  });

  // Load content
  panel.webview.html = getWebviewContent(docProps.url);
}

function getWebviewContent(url: string): string {
  /* Embed provided URL in a simple HTML page, glorified iframe */
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nautobot Documentation</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100vh;
            border: none;
        }
    </style>
</head>
<body>
    <iframe src="${url}" title="Nautobot Documentation"></iframe>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
