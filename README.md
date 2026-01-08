# New Python Package for VS Code

A powerful extension that adds a "New Python Package..." option to the Explorer context menu. Create Python packages with customizable `__init__.py` files, automatic additional files, snippet support, and conditional content based on your project structure.

![New Python Package in action](https://cdn.kanapi.dev/vsc/npp/example.gif)

## Features

- **Context Menu Integration** - "New Python Package..." appears right after "New Folder..."
- **Variable Interpolation** - Use `${name}`, `${name:pascal}`, and more in your content
- **Conditional Content** - Different `__init__.py` content based on location or package name
- **Additional Files** - Auto-generate extra files (models, views, tests, etc.)
- **Snippet Support** - Insert VS Code snippets with full tabstop support
- **Template Files** - Use external template files for complex boilerplate
- **Parent Packages** - Automatically create `__init__.py` in parent folders

## Usage

1. Right-click on any folder in the Explorer
2. Select **"New Python Package..."**
3. Name your package
4. Done! Your package is created with all configured files

## Quick Example

```json
{
  "new-python-package.initFileContent": "\"\"\"${name:pascal} package.\"\"\"",
  "new-python-package.openFilesAfterCreation": true,
  "new-python-package.additionalFiles": [
    {
      "when": { "pathMatches": "**/models/**" },
      "files": [
        {
          "name": "${name}.py",
          "content": "class ${name:pascal}:\n    pass"
        }
      ]
    }
  ]
}
```

## Documentation

📖 **[Full documentation on the GitHub Wiki](https://github.com/KaninDev/new-python-package/wiki)**

- [All Settings](https://github.com/KaninDev/new-python-package/wiki/Settings)
- [Variables & Transforms](https://github.com/KaninDev/new-python-package/wiki/Variables)
- [Additional Files](https://github.com/KaninDev/new-python-package/wiki/Additional-Files)
- [Example Configurations](https://github.com/KaninDev/new-python-package/wiki/Examples)

## Issues & Contributions

Found a bug or have a feature request? Open an issue on [GitHub](https://github.com/KaninDev/new-python-package/issues).

## License

MIT
