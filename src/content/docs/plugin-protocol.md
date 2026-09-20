---
title: Plugin Protocol
description: Extend Pyrite with custom entry types, MCP tools, CLI commands, validators, and lifecycle hooks.
order: 9
section: build
---

Pyrite's plugin protocol lets extensions hook into nearly every part of the system. A plugin is a Python class that implements one or more methods from the protocol.

## Extension points

The protocol exposes 19 methods. Implement only the ones you need.

| Method | Purpose |
|--------|---------|
| `get_entry_types()` | Custom entry types with serialization |
| `get_kb_types()` | Custom KB types |
| `get_type_metadata()` | Field definitions, AI instructions, presets |
| `get_field_schemas()` | Reusable field schema definitions |
| `get_collection_types()` | Custom collection types |
| `get_kb_presets()` | KB templates the plugin ships |
| `get_mcp_tools(tier)` | Per-tier MCP tools |
| `get_cli_commands()` | Typer sub-commands |
| `get_validators()` | Entry validation rules |
| `get_migrations()` | Schema migration functions |
| `get_relationship_types()` | Semantic relationship definitions |
| `get_workflows()` | State machines for entity types |
| `get_protocols()` | Protocol definitions entries can satisfy |
| `get_hooks()` | Lifecycle hooks: `before_save`, `after_save`, `before_delete`, `after_delete`, `before_index` |
| `get_db_tables()` | Extra database tables |
| `get_db_columns()` | Extra promoted columns on the entries table |
| `get_orient_supplement()` | Extra context for `kb_orient` |
| `get_rubric_checkers()` | Custom QA rubric checks |
| `set_context()` | Receive the shared `PluginContext` (config, db) |

## Minimal plugin

```python
# my_plugin/__init__.py
class MyPlugin:
    name = "my-plugin"

    def get_type_metadata(self):
        return {
            "recipe": {
                "description": "A cooking recipe",
                "fields": {
                    "prep_time": {"type": "number"},
                    "cuisine": {
                        "type": "select",
                        "options": ["italian", "japanese", "mexican"],
                    },
                    "ingredients": {
                        "type": "list",
                        "items": {"type": "text"},
                    },
                },
            },
        }
```

Register via Python entry points in `pyproject.toml`:

```toml
[project.entry-points."pyrite.plugins"]
my-plugin = "my_plugin:MyPlugin"
```

## Shipping extensions

Six extensions ship with Pyrite:

| Extension | Purpose | Key Types |
|-----------|---------|-----------|
| **software-kb** | Software project management | ADRs, components, backlog items, standards, runbooks |
| **zettelkasten** | CEQRC maturity workflow | Notes with maturity progression |
| **encyclopedia** | Articles with review workflow | Articles, reviews, voting |
| **social** | Engagement tracking | Social interactions |
| **cascade** | Timeline research | Timeline events, actors, capture lanes |
| **journalism-investigation** | Investigative research | Sources, claims, actors, evidence chains |

Task management is no longer an extension — `task` is a built-in entry type, with task tools in the core MCP server and a `pyrite task` command group.

## Installing extensions

```bash
pip install -e extensions/software-kb
pip install -e extensions/zettelkasten
pip install -e extensions/encyclopedia
pip install -e extensions/social
pip install -e extensions/cascade
pip install -e extensions/journalism-investigation
```

Plugins are discovered automatically via entry points — no configuration needed.
