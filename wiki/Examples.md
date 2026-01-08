# Examples

Some ready-to-use configurations.

## Discord.py Bot

For bots using the cogs pattern:

```json
{
  "new-python-package.initFileContent": "\"\"\"${name:pascal} package.\"\"\"",
  "new-python-package.openFilesAfterCreation": true,
  "new-python-package.ensureParentPackages": true,
  "new-python-package.additionalFiles": [
    {
      "when": {
        "pathMatches": "**/cogs/**"
      },
      "files": [
        {
          "name": "${name}.py",
          "content": "from discord.ext import commands\n\n\nclass ${name:pascal}(commands.Cog):\n    def __init__(self, bot: commands.Bot):\n        self.bot = bot\n\n\nasync def setup(bot: commands.Bot):\n    await bot.add_cog(${name:pascal}(bot))"
        }
      ]
    },
    {
      "when": {
        "pathMatches": "**/events/**"
      },
      "files": [
        {
          "name": "${name}.py",
          "content": "from discord.ext import commands\n\n\nclass ${name:pascal}(commands.Cog):\n    def __init__(self, bot: commands.Bot):\n        self.bot = bot\n\n    @commands.Cog.listener()\n    async def on_ready(self):\n        print(f\"${name:pascal} cog loaded\")\n\n\nasync def setup(bot: commands.Bot):\n    await bot.add_cog(${name:pascal}(bot))"
        }
      ]
    }
  ]
}
```

---

## FastAPI

Modular FastAPI structure:

```json
{
  "new-python-package.additionalFiles": [
    {
      "when": {
        "pathMatches": "**/routers/**"
      },
      "files": [
        {
          "name": "router.py",
          "content": "from fastapi import APIRouter\n\nrouter = APIRouter(\n    prefix=\"/${name}\",\n    tags=[\"${name}\"],\n)\n\n\n@router.get(\"/\")\nasync def get_${name}():\n    return {\"message\": \"${name:pascal} endpoint\"}"
        },
        {
          "name": "schemas.py",
          "content": "from pydantic import BaseModel\n\n\nclass ${name:pascal}Base(BaseModel):\n    pass\n\n\nclass ${name:pascal}Create(${name:pascal}Base):\n    pass\n\n\nclass ${name:pascal}Response(${name:pascal}Base):\n    id: int\n\n    class Config:\n        from_attributes = True"
        }
      ]
    }
  ]
}
```

---

## Django

```json
{
  "new-python-package.additionalFiles": [
    {
      "when": {
        "pathMatches": "**/apps/**",
        "workspaceContains": "**/manage.py"
      },
      "files": [
        {
          "name": "models.py",
          "content": "from django.db import models\n\n\nclass ${name:pascal}(models.Model):\n    created_at = models.DateTimeField(auto_now_add=True)\n\n    class Meta:\n        verbose_name = \"${name:replace:_: }\""
        },
        {
          "name": "views.py",
          "content": "from django.views import generic\nfrom .models import ${name:pascal}\n\n\nclass ${name:pascal}ListView(generic.ListView):\n    model = ${name:pascal}"
        },
        {
          "name": "urls.py",
          "content": "from django.urls import path\nfrom . import views\n\napp_name = \"${name}\"\n\nurlpatterns = [\n    path(\"\", views.${name:pascal}ListView.as_view(), name=\"list\"),\n]"
        },
        {
          "name": "admin.py",
          "content": "from django.contrib import admin\nfrom .models import ${name:pascal}\n\nadmin.site.register(${name:pascal})"
        }
      ]
    }
  ]
}
```

---

## Tests

Auto-create test files:

```json
{
  "new-python-package.additionalFiles": [
    {
      "when": {
        "pathMatches": "**/tests/**"
      },
      "files": [
        {
          "name": "test_${name}.py",
          "content": "import pytest\n\n\nclass Test${name:pascal}:\n    def test_placeholder(self):\n        pass"
        },
        {
          "name": "conftest.py",
          "content": "import pytest\n\n\n@pytest.fixture\ndef ${name}_fixture():\n    pass"
        }
      ]
    }
  ]
}
```

---

## Using Template Files

For bigger templates, use external files:

**Settings:**
```json
{
  "new-python-package.additionalFiles": [
    {
      "when": {
        "pathMatches": "**/services/**"
      },
      "files": [
        {
          "name": "${name}.py",
          "templateFile": ".vscode/templates/service.py"
        }
      ]
    }
  ]
}
```

**Template (`.vscode/templates/service.py`):**
```python
"""${name:pascal} service."""
from typing import Optional, List


class ${name:pascal}Service:
    async def get_all(self) -> List[dict]:
        raise NotImplementedError

    async def get_by_id(self, id: int) -> Optional[dict]:
        raise NotImplementedError

    async def create(self, data: dict) -> dict:
        raise NotImplementedError
```

---

## Minimal

Just the basics:

```json
{
  "new-python-package.initFileContent": "\"\"\"${name:pascal} package.\"\"\"",
  "new-python-package.openFilesAfterCreation": true
}
```
