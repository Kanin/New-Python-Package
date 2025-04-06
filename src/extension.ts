import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "new-python-package.generatePackage",
    async (uri: vscode.Uri) => {
      if (!uri) {
        return;
      }

      const parentPath = uri.fsPath;
      const initialFolders = getFolders(parentPath);

			let timeout: NodeJS.Timeout | null = null;

      const watcher = fs.watch(
        parentPath,
        { persistent: false },
        (eventType, filename) => {
          if (eventType === "rename" && filename) {
            const fullPath = path.join(parentPath, filename);

            if (
              fs.existsSync(fullPath) &&
              fs.statSync(fullPath).isDirectory() &&
              !initialFolders.includes(filename)
            ) {
              createPythonPackage(fullPath);

							if (timeout !== null) {
                clearTimeout(timeout);
              }

              watcher.close();
            }
          }
        }
      );
      timeout = setTimeout(() => {
				watcher.close();
			}, 30000); // 30 seconds

			await vscode.commands.executeCommand("explorer.newFolder", uri);
		}
	);
  context.subscriptions.push(disposable);
}

function createPythonPackage(folderPath: string): void {
  try {
    const initFilePath = path.join(folderPath, "__init__.py");
    fs.writeFileSync(initFilePath, "");

		revealPackageInExplorer(initFilePath);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to create Python package: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function revealPackageInExplorer(filePath: string): Promise<void> {
  try {
    const fileUri = vscode.Uri.file(filePath);
    await vscode.commands.executeCommand("workbench.files.action.refreshFilesExplorer");
    await vscode.commands.executeCommand("revealInExplorer", fileUri);
  } catch (error) {
    console.error("Error revealing package in explorer:", error);
  }
}

function getFolders(directoryPath: string): string[] {
  try {
    return fs
      .readdirSync(directoryPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
