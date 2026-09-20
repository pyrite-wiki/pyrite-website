---
title: Building Extensions
description: Build a Pyrite extension from scratch — with or without Claude Code's extension builder.
order: 10
section: build
---

Pyrite extensions add custom entry types, MCP tools, CLI commands, validators, and lifecycle hooks. This guide walks through building one.

## The fast way: Claude Code

If you use Claude Code with the Pyrite plugin, you can scaffold a complete extension in one command:

```
/extension-builder
```

Describe what you want ("a recipe manager with cuisine types and prep time tracking"), and Claude will generate the full package: entry types, validators, plugin class, preset, tests, and `pyproject.toml`. Install it and start using it immediately.

## Extension structure

Every extension follows this layout:

```
extensions/my-extension/
  pyproject.toml
  src/pyrite_my_extension/
    __init__.py
    plugin.py          # Plugin class
    entry_types.py     # Custom Entry subclasses
    validators.py      # Validation functions
    preset.py          # KB preset definition
  tests/
    test_my_extension.py
```

## Step 1: Create the package

```bash
mkdir -p extensions/reading-list/src/pyrite_reading_list
mkdir -p extensions/reading-list/tests
```

Create `extensions/reading-list/pyproject.toml`:

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "pyrite-reading-list"
version = "0.1.0"
description = "Track books, articles, and papers"
requires-python = ">=3.11"
dependencies = []

[project.entry-points."pyrite.plugins"]
reading_list = "pyrite_reading_list.plugin:ReadingListPlugin"

[tool.hatch.build.targets.wheel]
packages = ["src/pyrite_reading_list"]
```

The entry point group **must** be `"pyrite.plugins"`. Pyrite discovers plugins automatically via this mechanism.

## Step 2: Define entry types

Create `src/pyrite_reading_list/entry_types.py`:

```python
from dataclasses import dataclass, field
from typing import Any

from pyrite.models.core_types import NoteEntry
from pyrite.schema import Provenance, generate_entry_id
from pyrite.models.base import parse_datetime, parse_links, parse_sources

READING_STATUSES = ("to-read", "reading", "finished", "abandoned")
MEDIA_TYPES = ("book", "article", "paper", "podcast", "video")


@dataclass
class ReadingEntry(NoteEntry):
    """A reading list item."""

    media_type: str = "article"
    status: str = "to-read"
    author_name: str = ""
    url: str = ""
    rating: int = 0

    @property
    def entry_type(self) -> str:
        return "reading"

    def to_frontmatter(self) -> dict[str, Any]:
        meta = super().to_frontmatter()
        meta["type"] = "reading"
        if self.media_type != "article":
            meta["media_type"] = self.media_type
        if self.status != "to-read":
            meta["status"] = self.status
        if self.author_name:
            meta["author_name"] = self.author_name
        if self.url:
            meta["url"] = self.url
        if self.rating:
            meta["rating"] = self.rating
        return meta

    @classmethod
    def from_frontmatter(cls, meta: dict[str, Any], body: str) -> "ReadingEntry":
        entry_id = meta.get("id") or generate_entry_id(meta.get("title", ""))
        prov = meta.get("provenance")
        return cls(
            id=entry_id,
            title=meta.get("title", ""),
            body=body,
            tags=meta.get("tags", []) or [],
            sources=parse_sources(meta.get("sources")),
            links=parse_links(meta.get("links")),
            provenance=Provenance.from_dict(prov) if prov else None,
            media_type=meta.get("media_type", "article"),
            status=meta.get("status", "to-read"),
            author_name=meta.get("author_name", ""),
            url=meta.get("url", ""),
            rating=meta.get("rating", 0),
        )
```

Key rules:
- `entry_type` property must return the exact key used in `get_entry_types()`
- `to_frontmatter()` should omit default values to keep files clean
- `from_frontmatter()` must handle missing fields gracefully

## Step 3: Add validation

Create `src/pyrite_reading_list/validators.py`:

```python
from typing import Any

from .entry_types import MEDIA_TYPES, READING_STATUSES


def validate_reading(
    entry_type: str, data: dict[str, Any], context: dict[str, Any]
) -> list[dict]:
    if entry_type != "reading":
        return []  # IMPORTANT: always return [] for other types

    errors = []
    if data.get("media_type") and data["media_type"] not in MEDIA_TYPES:
        errors.append({
            "field": "media_type",
            "rule": "enum",
            "expected": list(MEDIA_TYPES),
            "got": data["media_type"],
        })
    if data.get("status") and data["status"] not in READING_STATUSES:
        errors.append({
            "field": "status",
            "rule": "enum",
            "expected": list(READING_STATUSES),
            "got": data["status"],
        })
    return errors
```

## Step 4: Wire up the plugin

Create `src/pyrite_reading_list/plugin.py`:

```python
from .entry_types import ReadingEntry
from .validators import validate_reading


class ReadingListPlugin:
    name = "reading_list"

    def get_entry_types(self):
        return {"reading": ReadingEntry}

    def get_validators(self):
        return [validate_reading]

    def get_type_metadata(self):
        return {
            "reading": {
                "description": "A reading list item (book, article, paper, etc.)",
                "ai_instructions": (
                    "Use media_type to classify the item. "
                    "Set status to track reading progress."
                ),
                "fields": {
                    "media_type": {
                        "type": "select",
                        "options": ["book", "article", "paper", "podcast", "video"],
                    },
                    "status": {
                        "type": "select",
                        "options": ["to-read", "reading", "finished", "abandoned"],
                    },
                    "author_name": {"type": "text"},
                    "url": {"type": "text"},
                    "rating": {"type": "number"},
                },
            },
        }

    def get_kb_presets(self):
        return {
            "reading-list": {
                "name": "reading-list",
                "description": "Track books, articles, and papers",
                "types": {
                    "reading": {
                        "description": "A reading list item",
                        "subdirectory": "readings/",
                    },
                },
                "directories": ["readings"],
            },
        }
```

Don't forget `src/pyrite_reading_list/__init__.py` (can be empty).

## Step 5: Install and test

```bash
# Install in dev mode
pip install -e extensions/reading-list

# Verify it loads
python -c "from pyrite.plugins.registry import get_registry; print(get_registry().list_plugins())"

# Create entries using the new type
pyrite create --type reading --title "Designing Data-Intensive Applications" \
  --body "Kleppmann's guide to distributed systems." \
  --tags "engineering,distributed-systems"

# Search works immediately
pyrite search "distributed systems"
```

## Going further

The plugin protocol supports much more:

| Method | Purpose |
|--------|---------|
| `get_mcp_tools(tier)` | Add MCP tools per access tier |
| `get_cli_commands()` | Add CLI subcommands |
| `get_hooks()` | Lifecycle hooks (before/after save and delete) |
| `get_db_tables()` | Custom SQLite tables |
| `get_workflows()` | State machine definitions |
| `get_collection_types()` | Custom collection types |
| `get_relationship_types()` | Semantic relationship definitions |

See the [Plugin Protocol](/docs/plugin-protocol) reference for the full API, or browse the six built-in extensions in the `extensions/` directory for real-world examples.

## Shipping extensions

Six extensions ship with Pyrite:

| Extension | Types | Purpose |
|-----------|-------|---------|
| **software-kb** | ADRs, components, backlog, standards | Software project management |
| **zettelkasten** | Notes with maturity levels | CEQRC knowledge workflow |
| **encyclopedia** | Articles, reviews | Collaborative knowledge |
| **cascade** | Timeline events, actors | Chronological research |
| **journalism-investigation** | Sources, claims, evidence chains | Investigative research |
| **social** | Social interactions | Engagement tracking |
