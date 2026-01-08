import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { minimatch } from "minimatch";
import { PackageContext, applyTransform, interpolate } from "./utils";
import { checkForUpdates, showWhatsNew } from "./whats-new";

interface FileRule {
  name: string;
  content?: string;
  snippet?: string;
  templateFile?: string;
}

interface WhenCondition {
  pathMatches?: string;
  nameMatches?: string;
  workspaceContains?: string;
}

interface AdditionalFileRule {
  when?: WhenCondition;
  files: FileRule[];
}

interface InitFileRule {
  when?: WhenCondition;
  content?: string;
  snippet?: string;
  templateFile?: string;
}

function getConfig<T>(key: string): T {
  return vscode.workspace.getConfiguration("new-python-package").get<T>(key) as T;
}

async function checkConditions(condition: WhenCondition, context: PackageContext): Promise<boolean> {
  if (condition.pathMatches) {
    const normalizedPath = context.relativePath.replace(/\\/g, "/");
    if (!minimatch(normalizedPath, condition.pathMatches, { dot: true })) {
      return false;
    }
  }

  if (condition.nameMatches) {
    try {
      const regex = new RegExp(condition.nameMatches);
      if (!regex.test(context.name)) {
        return false;
      }
    } catch {
      console.error(`Invalid regex pattern: ${condition.nameMatches}`);
      return false;
    }
  }

  if (condition.workspaceContains) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return false;
    }
    
    const files = await vscode.workspace.findFiles(condition.workspaceContains, null, 1);
    if (files.length === 0) {
      return false;
    }
  }

  return true;
}

function getRelativePath(fullPath: string): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fullPath));
  if (workspaceFolder) {
    return path.relative(workspaceFolder.uri.fsPath, fullPath);
  }
  return path.basename(fullPath);
}

function createContext(folderPath: string): PackageContext {
  const now = new Date();
  return {
    name: path.basename(folderPath),
    parent: path.basename(path.dirname(folderPath)),
    fullPath: folderPath,
    relativePath: getRelativePath(folderPath),
    date: now.toISOString().split("T")[0],
    year: now.getFullYear().toString(),
  };
}

export function activate(context: vscode.ExtensionContext) {
  // Check for updates and show What's New page
  checkForUpdates(context);

  // Register What's New command
  context.subscriptions.push(
    vscode.commands.registerCommand("new-python-package.whatsNew", () => {
      showWhatsNew(context);
    })
  );

  const disposable = vscode.commands.registerCommand(
    "new-python-package.generatePackage",
    async (uri: vscode.Uri) => {
      if (!uri) {
        return;
      }

      const parentPath = uri.fsPath;
      const initialFolders = getFolders(parentPath);
      const timeoutSeconds = getConfig<number>("watcherTimeout") ?? 30;

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
      }, timeoutSeconds * 1000);

      await vscode.commands.executeCommand("explorer.newFolder", uri);
    }
  );
  context.subscriptions.push(disposable);
}

async function createPythonPackage(folderPath: string): Promise<void> {
  try {
    const ctx = createContext(folderPath);
    const createdFiles: string[] = [];

    // Ensure parent packages if enabled
    if (getConfig<boolean>("ensureParentPackages")) {
      await ensureParentPackages(folderPath);
    }

    // Create __init__.py
    const initFilePath = path.join(folderPath, "__init__.py");
    
    // Check initFileRules first (first match wins)
    const initRules = getConfig<InitFileRule[]>("initFileRules") ?? [];
    let initContent = "";
    let initSnippet = "";
    let matchedRule = false;
    
    for (const rule of initRules) {
      if (rule.when && !(await checkConditions(rule.when, ctx))) {
        continue;
      }
      
      // Found a matching rule
      matchedRule = true;
      if (rule.templateFile) {
        initContent = await readTemplateFile(rule.templateFile, ctx);
      } else if (rule.content) {
        initContent = interpolate(rule.content, ctx);
      }
      if (rule.snippet) {
        initSnippet = rule.snippet;
      }
      break; // First match wins
    }
    
    // Fall back to global settings if no rule matched
    if (!matchedRule) {
      const globalContent = getConfig<string>("initFileContent") ?? "";
      const globalSnippet = getConfig<string>("initFileSnippet") ?? "";
      initContent = interpolate(globalContent, ctx);
      initSnippet = globalSnippet;
    }
    
    fs.writeFileSync(initFilePath, initContent);
    createdFiles.push(initFilePath);

    // Insert snippet into __init__.py if configured
    if (initSnippet) {
      await insertSnippetInFile(initFilePath, initSnippet, ctx);
    }

    // Process additional file rules
    const rules = getConfig<AdditionalFileRule[]>("additionalFiles") ?? [];
    for (const rule of rules) {
      if (rule.when && !(await checkConditions(rule.when, ctx))) {
        continue;
      }

      for (const file of rule.files) {
        const fileName = interpolate(file.name, ctx);
        const filePath = path.join(folderPath, fileName);
        
        // Determine content source: templateFile > content > empty
        let fileContent = "";
        if (file.templateFile) {
          fileContent = await readTemplateFile(file.templateFile, ctx);
        } else if (file.content) {
          fileContent = interpolate(file.content, ctx);
        }
        
        fs.writeFileSync(filePath, fileContent);
        createdFiles.push(filePath);
        
        // If snippet is specified, we'll insert it after opening the file
        if (file.snippet) {
          await insertSnippetInFile(filePath, file.snippet, ctx);
        }
      }
    }

    // Open files if enabled
    if (getConfig<boolean>("openFilesAfterCreation") && createdFiles.length > 0) {
      for (const filePath of createdFiles) {
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true });
      }
    }

    await revealPackageInExplorer(initFilePath);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to create Python package: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function ensureParentPackages(folderPath: string): Promise<void> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(folderPath));
  if (!workspaceFolder) {
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  let currentDir = path.dirname(folderPath);

  while (currentDir.length > workspaceRoot.length && currentDir.startsWith(workspaceRoot)) {
    const initPath = path.join(currentDir, "__init__.py");
    if (!fs.existsSync(initPath)) {
      fs.writeFileSync(initPath, "");
    }
    currentDir = path.dirname(currentDir);
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

async function readTemplateFile(templatePath: string, ctx: PackageContext): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    console.error("No workspace folder found for template file");
    return "";
  }

  // Support variables in the template path itself
  const resolvedPath = interpolate(templatePath, ctx);
  const fullPath = path.isAbsolute(resolvedPath) 
    ? resolvedPath 
    : path.join(workspaceFolder.uri.fsPath, resolvedPath);

  try {
    const content = fs.readFileSync(fullPath, "utf-8");
    return interpolate(content, ctx);
  } catch (error) {
    console.error(`Failed to read template file: ${fullPath}`, error);
    vscode.window.showWarningMessage(`Template file not found: ${resolvedPath}`);
    return "";
  }
}

async function insertSnippetInFile(filePath: string, snippetName: string, ctx: PackageContext): Promise<void> {
  try {
    const doc = await vscode.workspace.openTextDocument(filePath);
    const editor = await vscode.window.showTextDocument(doc, { preview: false });
    
    // Interpolate variables into the snippet name if needed
    const resolvedSnippetName = interpolate(snippetName, ctx);
    
    // Use VS Code's built-in snippet insertion by triggering the snippet by prefix
    await vscode.commands.executeCommand("editor.action.insertSnippet", {
      name: resolvedSnippetName
    });
  } catch (error) {
    console.error(`Failed to insert snippet: ${snippetName}`, error);
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

export function deactivate() {}
