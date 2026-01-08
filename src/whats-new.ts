import * as vscode from "vscode";

const LAST_VERSION_KEY = "new-python-package.lastVersion";

interface ReleaseNote {
  version: string;
  date: string;
  changes: string[];
}

const releaseNotes: ReleaseNote[] = [
  {
    version: "1.1.3",
    date: "2026-01-08",
    changes: [
      "🐛 Fixed this page not showing on install/update... oops!",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-01-08",
    changes: [
      "<strong>🎯 Conditional Init File Rules</strong> — New <code>initFileRules</code> setting lets you define different <code>__init__.py</code> content based on where the package is created. Match by path glob, package name regex, or workspace file existence. First matching rule wins!",
      "<strong>📝 Variable System</strong> — Use <code>${name}</code>, <code>${parent}</code>, <code>${fullPath}</code>, <code>${relativePath}</code>, <code>${date}</code>, and <code>${year}</code> in any content field. Variables are interpolated at package creation time.",
      "<strong>🔄 Variable Transforms</strong> — Apply transforms like <code>${name:pascal}</code>, <code>${name:camel}</code>, <code>${name:snake}</code>, <code>${name:upper}</code>, <code>${name:lower}</code>. Also supports <code>:replace:old:new</code> and <code>:slice:start:end</code>. Chain multiple transforms!",
      "<strong>✂️ Snippet Support</strong> — Insert VS Code snippets with full tabstop and placeholder support. Works in <code>initFileSnippet</code>, <code>initFileRules</code>, and <code>additionalFiles</code>. Just reference your snippet by name.",
      "<strong>📄 Template Files</strong> — Use <code>templateFile</code> to load content from external files. Great for large boilerplate. Supports full variable interpolation.",
      "<strong>📁 Additional Files</strong> — Auto-generate extra files when creating packages. Conditional rules let you create different files based on location (e.g., router.py in routers/, cog.py in cogs/).",
      "<strong>📦 Parent Package Enforcement</strong> — Enable <code>ensureParentPackages</code> to automatically create <code>__init__.py</code> in all parent directories up to your workspace root.",
      "<strong>⏱️ Configurable Timeout</strong> — <code>watcherTimeout</code> lets you set how long (in seconds) to wait for folder naming. Default is 30 seconds.",
      "<strong>📂 Auto-Open Files</strong> — Enable <code>openFilesAfterCreation</code> to automatically open all created files in the editor.",
      "<strong>📖 Documentation</strong> — Comprehensive docs now available on the GitHub Wiki with examples for Discord.py, FastAPI, Django, and more.",
    ],
  },
  {
    version: "1.0.1",
    date: "2025-04-06",
    changes: [
      "🖼️ Updated example image to use a URL",
    ],
  },
  {
    version: "1.0.0",
    date: "2025-04-05",
    changes: [
      "🎉 Initial release",
      "📦 Added \"New Python Package...\" command to Explorer context menu",
      "📝 Creates folder with <code>__init__.py</code> file",
      "👁️ Automatically expands the new package in Explorer view",
    ],
  },
];

export function checkForUpdates(context: vscode.ExtensionContext): void {
  const currentVersion = context.extension.packageJSON.version;
  const lastVersion = context.globalState.get<string>(LAST_VERSION_KEY);

  if (lastVersion !== currentVersion) {
    // Show What's New page on first install or update
    showWhatsNew(context);
    context.globalState.update(LAST_VERSION_KEY, currentVersion);
  }
}

export function showWhatsNew(context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    "newPythonPackageWhatsNew",
    "New Python Package - What's New",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getWebviewContent(context);

  panel.webview.onDidReceiveMessage(
    (message) => {
      if (message.command === "openUrl") {
        vscode.env.openExternal(vscode.Uri.parse(message.url));
      }
    },
    undefined,
    context.subscriptions
  );
}

function getWebviewContent(context: vscode.ExtensionContext): string {
  const currentVersion = context.extension.packageJSON.version;

  const changesHtml = releaseNotes
    .map(
      (release) => `
      <div class="release">
        <h2>v${release.version} <span class="date">${release.date}</span></h2>
        <ul>
          ${release.changes.map((c) => `<li>${c}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>What's New</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px 40px;
      max-width: 800px;
      margin: 0 auto;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }
    
    h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 16px;
    }
    
    .icon {
      font-size: 32px;
    }
    
    .version-badge {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: normal;
    }
    
    .cta-section {
      background: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textLink-foreground);
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .cta-section h3 {
      margin-top: 0;
    }
    
    .button {
      display: inline-block;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      padding: 8px 16px;
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
      margin-right: 8px;
      margin-top: 8px;
      border: none;
      font-size: 14px;
    }
    
    .button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    
    .button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    
    .release {
      margin: 24px 0;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .release:last-child {
      border-bottom: none;
    }
    
    .release h2 {
      color: var(--vscode-textLink-foreground);
      margin-bottom: 12px;
    }
    
    .date {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      font-weight: normal;
    }
    
    .release ul {
      margin: 0;
      padding-left: 24px;
    }
    
    .release li {
      margin: 8px 0;
      line-height: 1.5;
    }
    
    code {
      background: var(--vscode-textCodeBlock-background);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }
    
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--vscode-panel-border);
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
    }
  </style>
</head>
<body>
  <h1>
    <span class="icon">📦</span>
    New Python Package
    <span class="version-badge">v${currentVersion}</span>
  </h1>
  
  <div class="cta-section">
    <h3>⭐ Enjoying this extension?</h3>
    <p>If this extension helps your workflow, consider starring the repo and leaving a review!</p>
    <button class="button" onclick="openUrl('https://github.com/kanin/new-python-package')">
      ⭐ Star on GitHub
    </button>
    <button class="button secondary" onclick="openUrl('https://marketplace.visualstudio.com/items?itemName=KaninDev.new-python-package&ssr=false#review-details')">
      📝 Write a Review
    </button>
    <button class="button secondary" onclick="openUrl('https://github.com/kanin/new-python-package/wiki')">
      📖 Documentation
    </button>
  </div>
  
  <h2>📋 Release Notes</h2>
  ${changesHtml}
  
  <div class="footer">
    Made with ❤️ by <a href="https://github.com/kanin">Kanin</a>
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    function openUrl(url) {
      vscode.postMessage({ command: 'openUrl', url: url });
    }
  </script>
</body>
</html>`;
}
