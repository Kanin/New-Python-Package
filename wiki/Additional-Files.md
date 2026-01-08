# Additional Files

The `additionalFiles` setting lets you automatically create extra files when you make a package. You set up rules with conditions, and when those conditions match, the files get created.

## Basic Structure

```json
{
  "new-python-package.additionalFiles": [
    {
      "when": { /* optional conditions */ },
      "files": [ /* files to create */ ]
    }
  ]
}
```

---

## Conditions

All conditions are optional. Skip the `when` block entirely and the rule always runs. If you specify multiple conditions, they all have to match.

### pathMatches

Glob pattern for the package's path. This is the most useful one.

```json
{
  "when": {
    "pathMatches": "**/modules/**"
  }
}
```

Some patterns:

| Pattern | What it matches |
|---------|-----------------|
| `**/modules/**` | Any package anywhere under a `modules` folder |
| `**/tests/**` | Any package under `tests` |
| `**/modules/{cogs,events}/**` | Packages under `modules/cogs` or `modules/events` |
| `src/modules/**` | Only packages under `src/modules` specifically |

So if you have `modules/cogs/` and `modules/events/`, the pattern `**/modules/**` catches both.

### nameMatches

Regex for the package name itself.

```json
{
  "when": {
    "nameMatches": "^test_"
  }
}
```

| Pattern | Matches |
|---------|---------|
| `^test_` | Names starting with `test_` |
| `_test$` | Names ending with `_test` |
| `^[a-z]+$` | Lowercase-only names |

### workspaceContains

Check if a file exists somewhere in the workspace.

```json
{
  "when": {
    "workspaceContains": "pyproject.toml"
  }
}
```

Good for project-type detection.

### Combining Conditions

```json
{
  "when": {
    "pathMatches": "**/modules/cogs/**",
    "workspaceContains": "**/discord/**"
  }
}
```

This only triggers when BOTH are true.

---

## Files

Three ways to specify content:

1. **`content`** - Inline string
2. **`templateFile`** - Load from a file
3. **`snippet`** - Insert a VS Code snippet

### Basic File

```json
{
  "files": [
    {
      "name": "${name}.py",
      "content": "# ${name:pascal} module"
    }
  ]
}
```

### Template File

Point to a template in your workspace:

```json
{
  "files": [
    {
      "name": "${name}.py",
      "templateFile": ".vscode/templates/module.py"
    }
  ]
}
```

The template file can use all the same [[Variables]]. Put your templates in `.vscode/templates/` or wherever makes sense.

### Snippet

Opens the file and inserts a VS Code snippet:

```json
{
  "files": [
    {
      "name": "${name}.py",
      "snippet": "python-class"
    }
  ]
}
```

You get full snippet features: tabstops, placeholders, choices. Define your snippets in VS Code's user snippets.

### Template + Snippet

You can combine them. Template content goes in first, then the snippet gets inserted:

```json
{
  "files": [
    {
      "name": "${name}.py",
      "templateFile": ".vscode/templates/base.py",
      "snippet": "python-method"
    }
  ]
}
```

---

## Multiple Files

Create several files at once:

```json
{
  "files": [
    {
      "name": "${name}.py",
      "content": "class ${name:pascal}:\n    pass"
    },
    {
      "name": "test_${name}.py",
      "content": "import pytest\nfrom .${name} import ${name:pascal}"
    }
  ]
}
```

---

## Full Example

```json
{
  "new-python-package.additionalFiles": [
    {
      "when": {
        "pathMatches": "**/cogs/**"
      },
      "files": [
        {
          "name": "${name}.py",
          "templateFile": ".vscode/templates/cog.py"
        }
      ]
    },
    {
      "when": {
        "pathMatches": "**/tests/**"
      },
      "files": [
        {
          "name": "test_${name}.py",
          "content": "import pytest\n\n\nclass Test${name:pascal}:\n    pass"
        }
      ]
    },
    {
      "when": {
        "nameMatches": "^api_"
      },
      "files": [
        {
          "name": "routes.py",
          "content": "from fastapi import APIRouter\n\nrouter = APIRouter(prefix=\"/${name:slice:4:}\")"
        }
      ]
    }
  ]
}
```
