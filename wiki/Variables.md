# Variables

Variables let you inject dynamic values into your file names and content. They work in:
- `initFileContent` setting
- `files[].name` (file names)
- `files[].content` (file content)
- `files[].templateFile` (template paths)

## Syntax

```
${variable}
${variable:transform}
${variable:transform1|transform2}
```

## Available Variables

| Variable | What you get | Example |
|----------|--------------|---------|
| `${name}` | Package name | `my_module` |
| `${parent}` | Parent folder name | `modules` |
| `${date}` | Today's date | `2026-01-08` |
| `${year}` | Current year | `2026` |
| `${fullPath}` | Full path | `C:\project\src\modules\my_module` |
| `${relativePath}` | Path from workspace root | `src/modules/my_module` |

---

## Transforms

Transforms change how the variable value looks. Chain them with `|`.

### Case Transforms

| Transform | Input | Output |
|-----------|-------|--------|
| `:upper` | `my_module` | `MY_MODULE` |
| `:lower` | `My_Module` | `my_module` |
| `:capitalize` | `my_module` | `My_module` |

### Naming Conventions

| Transform | Input | Output |
|-----------|-------|--------|
| `:pascal` | `my_module` | `MyModule` |
| `:camel` | `my_module` | `myModule` |
| `:snake` | `MyModule` | `my_module` |

### String Stuff

| Transform | Example | Output |
|-----------|---------|--------|
| `:replace:X:Y` | `${name:replace:_:-}` | `my-module` |
| `:slice:N:M` | `${name:slice:0:2}` | `my` |

---

## How the Transforms Work

### :pascal

Splits on underscores, hyphens, and spaces, capitalizes each word, joins them:

```
my_cool_module → MyCoolModule
user-service → UserService
```

### :camel

Same as pascal but the first letter stays lowercase:

```
my_cool_module → myCoolModule
```

### :snake

Opposite direction - adds underscores and lowercases:

```
MyCoolModule → my_cool_module
```

### :replace:X:Y

Replaces all `X` with `Y`:

```
${name:replace:_:-}     my_module → my-module
${name:replace:_:}      my_module → mymodule
```

### :slice:N:M

Substring from position N to M:

```
${name:slice:0:2}   my_module → my
${name:slice:3:}    my_module → module
```

---

## Chaining

You can chain multiple transforms with `|`:

```
${name:pascal|replace:_:}
${name:slice:0:3|upper}
```

## Examples

Given `name = my_module`:

| Expression | Result |
|------------|--------|
| `${name}` | `my_module` |
| `${name:upper}` | `MY_MODULE` |
| `${name:pascal}` | `MyModule` |
| `${name:replace:_:-}` | `my-module` |

### In File Names

```json
{ "name": "${name}.py" }           // my_module.py
{ "name": "${name:pascal}.py" }    // MyModule.py
{ "name": "test_${name}.py" }      // test_my_module.py
```

### In Content

```json
{
  "content": "class ${name:pascal}:\n    pass"
}
```

Result:
```python
class MyModule:
    pass
```

### In Template Paths

```json
{
  "templateFile": ".vscode/templates/${parent}.py"
}
```

This picks a different template based on the parent folder.
