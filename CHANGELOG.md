# Change Log

All notable changes to the "New Python Package" extension will be documented in this file.

## [1.1.2] - 2026-01-08

### Fixed

- What's New page now shows on first install and updates (previously only showed on updates)

## [1.1.0] - 2026-01-08

### New Features

#### Variable System
A powerful variable interpolation system for dynamic content:
- `${name}` - Package folder name
- `${parent}` - Parent folder name
- `${fullPath}` - Full absolute path
- `${relativePath}` - Path relative to workspace
- `${date}` - Current date (YYYY-MM-DD)
- `${year}` - Current year

#### Variable Transforms
Apply transforms to any variable using `${var:transform}` syntax:
- `:upper` / `:lower` - Change case
- `:pascal` - PascalCase (my_thing → MyThing)
- `:camel` - camelCase (my_thing → myThing)
- `:snake` - snake_case (MyThing → my_thing)
- `:replace:old:new` - Replace text
- `:slice:start:end` - Substring extraction

#### Conditional Init File Rules (`initFileRules`)
Define different `__init__.py` content based on conditions:
- `pathMatches` - Glob pattern matching on package path
- `nameMatches` - Regex matching on package name
- `workspaceContains` - Check for files in workspace
- Supports `content`, `snippet`, or `templateFile` per rule
- First matching rule wins, falls back to global settings

#### Additional Files with Conditions (`additionalFiles`)
Automatically create extra files when making packages:
- Conditional file generation based on path, name, or workspace contents
- Each file supports static content, VS Code snippets, or template files
- Multiple files per rule with variable interpolation in filenames

#### Snippet Support
Insert VS Code snippets with full tabstop/placeholder support:
- `initFileSnippet` - Default snippet for `__init__.py`
- Snippets in `initFileRules` rules
- Snippets in `additionalFiles` file definitions

#### Template Files
Use external template files for complex content:
- Point to any file in your workspace
- Full variable interpolation support
- Great for large boilerplate code

#### Parent Package Enforcement (`ensureParentPackages`)
Automatically create `__init__.py` in all parent directories up to workspace root.

#### Configurable Timeout (`watcherTimeout`)
Set how long (in seconds) to wait for folder creation. Default: 30s.

#### What's New Page
Shows release notes when the extension updates. Access anytime via Command Palette.

### Improvements
- Open created files automatically with `openFilesAfterCreation`
- Better error handling and user feedback
- Comprehensive documentation on GitHub Wiki

---

## [1.0.1] - 2025-04-06

- Updated example image to be a URL

## [1.0.0] - 2025-04-05

- Initial release
- Added "New Python Package..." command to Explorer context menu
- Creates folder with `__init__.py` file
- Automatically expands the new package in the Explorer view
