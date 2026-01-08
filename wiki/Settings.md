# Settings

All settings start with `new-python-package.` in your VS Code settings.

## Quick Reference

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `watcherTimeout` | number | `30` | How long to wait for folder creation (seconds) |
| `initFileContent` | string | `""` | Content to put in `__init__.py` |
| `initFileSnippet` | string | `""` | VS Code snippet to insert in `__init__.py` |
| `openFilesAfterCreation` | boolean | `false` | Open files after creating them |
| `ensureParentPackages` | boolean | `false` | Create `__init__.py` in parent folders too |
| `additionalFiles` | array | `[]` | Rules for creating extra files |

---

## watcherTimeout

How long (in seconds) the extension waits for you to finish naming the folder.

```json
{
  "new-python-package.watcherTimeout": 60
}
```

Default is 30 seconds, which should be plenty. Bump it up if you're a slow typer.

---

## initFileContent

What goes inside your `__init__.py` files. Supports [[Variables]].

**Empty (default):**
```json
{
  "new-python-package.initFileContent": ""
}
```

**Simple docstring:**
```json
{
  "new-python-package.initFileContent": "\"\"\"${name:pascal} package.\"\"\""
}
```

**With `__all__`:**
```json
{
  "new-python-package.initFileContent": "\"\"\"${name:pascal} package.\"\"\"\n\n__all__ = []"
}
```

---

## initFileSnippet

Instead of static content, you can have a VS Code snippet inserted. The file opens and the snippet runs with full tabstop/placeholder support.

```json
{
  "new-python-package.initFileSnippet": "python-init"
}
```

This looks for a snippet named "python-init" in your user snippets or an extension. Great if you want interactive placeholders.

You can use both `initFileContent` and `initFileSnippet` together - the content gets written first, then the snippet is inserted.

---

## openFilesAfterCreation

Opens all created files (`__init__.py` plus any additional files) in the editor.

```json
{
  "new-python-package.openFilesAfterCreation": true
}
```

---

## ensureParentPackages

When you create a package deep in a folder structure, this creates `__init__.py` files in all parent folders (up to your workspace root) if they don't already have one.

```json
{
  "new-python-package.ensureParentPackages": true
}
```

So if you create `src/utils/helpers/my_pkg`, it'll also create:
- `src/__init__.py` (if missing)
- `src/utils/__init__.py` (if missing)
- `src/utils/helpers/__init__.py` (if missing)

---

## additionalFiles

This is where it gets fun. Define rules to automatically create extra files when you make a package. See [[Additional Files]] for the full breakdown.

Quick example:

```json
{
  "new-python-package.additionalFiles": [
    {
      "when": {
        "pathMatches": "**/modules/**"
      },
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
