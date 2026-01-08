# Update GitHub Wiki
# This script copies wiki files to the wiki repository and pushes changes

param(
    [string]$WikiRepoPath = "",
    [string]$CommitMessage = "Update documentation",
    [switch]$Clone,
    [switch]$Init,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$WikiSourceDir = Join-Path $ProjectRoot "wiki"
$DefaultWikiRepo = "https://github.com/Kanin/New-Python-Package.wiki.git"

# Colors for output
function Write-Status($msg) { Write-Host "→ $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "! $msg" -ForegroundColor Yellow }

# Determine wiki repo path
if (-not $WikiRepoPath) {
    $WikiRepoPath = Join-Path $ProjectRoot ".wiki-repo"
}

Write-Host "`nNew Python Package - Wiki Updater`n" -ForegroundColor Magenta

# Initialize new wiki repo (for when GitHub wiki doesn't exist yet)
if ($Init) {
    Write-Status "Initializing new wiki repository..."
    
    if (Test-Path $WikiRepoPath) {
        Remove-Item -Recurse -Force $WikiRepoPath
    }
    
    if ($DryRun) {
        Write-Warn "[DRY RUN] Would initialize new repo at: $WikiRepoPath"
    } else {
        New-Item -ItemType Directory -Path $WikiRepoPath -Force | Out-Null
        Push-Location $WikiRepoPath
        try {
            git init
            git remote add origin $DefaultWikiRepo
        }
        finally {
            Pop-Location
        }
        Write-Success "Initialized wiki repo"
    }
}
# Clone wiki repo if requested or doesn't exist
elseif ($Clone -or -not (Test-Path $WikiRepoPath)) {
    if (Test-Path $WikiRepoPath) {
        Write-Status "Removing existing wiki repo..."
        Remove-Item -Recurse -Force $WikiRepoPath
    }
    
    Write-Status "Cloning wiki repository..."
    if ($DryRun) {
        Write-Warn "[DRY RUN] Would clone: $DefaultWikiRepo"
    } else {
        git clone $DefaultWikiRepo $WikiRepoPath 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Wiki repository not found. The GitHub wiki may not exist yet."
            Write-Host ""
            Write-Host "To create the wiki for the first time, either:" -ForegroundColor Yellow
            Write-Host "  1. Go to https://github.com/Kanin/New-Python-Package/wiki" -ForegroundColor Gray
            Write-Host "     Click 'Create the first page' and save it" -ForegroundColor Gray
            Write-Host "     Then run: .\scripts\update-wiki.ps1 -Clone" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  2. Or run: .\scripts\update-wiki.ps1 -Init" -ForegroundColor Gray
            Write-Host "     This will create and push the wiki from scratch" -ForegroundColor Gray
            Write-Host ""
            exit 1
        }
    }
}

# Verify directories exist
if (-not (Test-Path $WikiSourceDir)) {
    Write-Error "Wiki source directory not found: $WikiSourceDir"
}

if (-not $DryRun -and -not (Test-Path $WikiRepoPath)) {
    Write-Error "Wiki repo directory not found: $WikiRepoPath"
}

# Copy wiki files
Write-Status "Copying wiki files..."
$files = Get-ChildItem -Path $WikiSourceDir -Filter "*.md"

foreach ($file in $files) {
    $dest = Join-Path $WikiRepoPath $file.Name
    if ($DryRun) {
        Write-Host "  [DRY RUN] $($file.Name)" -ForegroundColor Gray
    } else {
        Copy-Item $file.FullName $dest -Force
        Write-Host "  $($file.Name)" -ForegroundColor Gray
    }
}

Write-Success "Copied $($files.Count) files"

if ($DryRun) {
    Write-Warn "`n[DRY RUN] Would commit and push with message: '$CommitMessage'"
    exit 0
}

# Git operations
Push-Location $WikiRepoPath
try {
    # Check for changes
    $status = git status --porcelain
    if (-not $status) {
        Write-Warn "No changes detected"
        exit 0
    }

    Write-Status "Staging changes..."
    git add -A

    Write-Status "Committing..."
    git commit -m $CommitMessage

    Write-Status "Pushing to GitHub..."
    if ($Init) {
        # Force push to main branch for initial setup
        git branch -M main
        git push -u origin main 2>&1 | Out-Host
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Warn "Push failed! GitHub requires you to create the wiki first."
            Write-Host ""
            Write-Host "To fix this:" -ForegroundColor Yellow
            Write-Host "  1. Go to: https://github.com/Kanin/New-Python-Package/wiki" -ForegroundColor Gray
            Write-Host "  2. Click 'Create the first page'" -ForegroundColor Gray
            Write-Host "  3. Enter anything and click 'Save Page'" -ForegroundColor Gray
            Write-Host "  4. Run: .\scripts\update-wiki.ps1 -Clone" -ForegroundColor Gray
            Write-Host ""
            exit 1
        }
    } else {
        git push
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to push to GitHub"
        }
    }

    Write-Success "`nWiki updated successfully! 🎉"
    Write-Host "View at: https://github.com/Kanin/New-Python-Package/wiki`n" -ForegroundColor Blue
}
finally {
    Pop-Location
}
