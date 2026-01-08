# New Python Package

A simple VS Code extension that adds "New Python Package..." to the Explorer context menu. Right-click a folder, pick a name, and you get a proper Python package with `__init__.py` ready to go.

## Features

- **Quick package creation** - Right-click any folder, select "New Python Package..."
- **Custom `__init__.py` content** - Set up default content with variables
- **Additional file generation** - Automatically create related files based on rules
- **Variable system** - Use `${name:pascal}` and similar transforms in your templates
- **Parent package support** - Auto-create `__init__.py` in parent directories
- **Template support** - Use snippets or template files for more complex setups

## Quick Start

1. Install from the VS Code Marketplace
2. Right-click any folder in the Explorer
3. Click **"New Python Package..."**
4. Type your package name
5. Done!

## Documentation

- [[Settings]] - All the configuration options
- [[Variables]] - The variable system and transforms
- [[Additional Files]] - Setting up automatic file generation
- [[Examples]] - Real configs you can copy

## Basic Setup

```json
{
  "new-python-package.initFileContent": "\"\"\"${name:pascal} package.\"\"\"",
  "new-python-package.openFilesAfterCreation": true,
  "new-python-package.ensureParentPackages": true
}
```

## Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=KaninDev.new-python-package)
- [GitHub Repository](https://github.com/Kanin/New-Python-Package)
- [Report an Issue](https://github.com/Kanin/New-Python-Package/issues)
