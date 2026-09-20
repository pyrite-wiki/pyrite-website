---
title: Your First Knowledge Base
description: A guided walkthrough — create entries, search, connect to Claude, and see everything working together.
order: 2
section: get-started
---

This walkthrough takes you from zero to a working knowledge base connected to Claude. It assumes you've already installed Pyrite (see [Quick Start](/docs/quick-start) if not).

## Create a knowledge base

```bash
pyrite init --template research --path my-brain
cd my-brain
```

This creates a `kb.yaml` file, registers the KB, and sets up the directory structure. Let's add some content.

## Add entries

Create a few entries to work with:

```bash
# A person
pyrite create -k my-brain --type person --title "Sarah Chen" \
  --body "Engineering lead at Acme. Considering move to consulting." \
  --tags "team,engineering"

# A note
pyrite create -k my-brain --type note --title "Switch to async standups" \
  --body "Decided 2026-03-01. Reduces meeting load by 3hrs/week." \
  --tags "process,meetings"

# A note with links
pyrite create -k my-brain --type note --title "Q1 Planning Notes" \
  --body "Discussed headcount with [[sarah-chen]]. Key decision: [[switch-to-async-standups]]." \
  --tags "planning,q1"
```

Each command creates a markdown file with YAML frontmatter. Look in the `note/` and `person/` directories to see what was generated.

## Search

Now search across your entries:

```bash
# Keyword search
pyrite search "async standups" -k my-brain

# Find entries by tag
pyrite search "tag:engineering" -k my-brain

# Semantic search (if you installed pyrite[semantic])
pyrite search "team changes" -k my-brain --mode=semantic
```

## Explore connections

Pyrite tracks `[[wikilinks]]` automatically:

```bash
# What links to Sarah?
pyrite backlinks sarah-chen -k my-brain

# Get the full entry
pyrite get sarah-chen -k my-brain
```

## Connect to Claude

Run `pyrite mcp-setup` to add Pyrite's MCP server to your Claude configuration, or add it by hand:

```json
{
  "mcpServers": {
    "pyrite": {
      "command": "/absolute/path/to/.venv/bin/pyrite",
      "args": ["mcp"]
    }
  }
}
```

Use the absolute path (`which pyrite`) — Claude Desktop does not see your shell's PATH or an activated venv.

Restart Claude Desktop (or Claude Code), and you can now ask Claude things like:

- "What do I know about Sarah Chen?"
- "Find all decisions made this quarter"
- "Create a note summarizing our Q1 planning"
- "What entries are linked to async standups?"

Claude will use Pyrite's MCP tools to search, read, and create entries in your knowledge base.

## Start the web UI

For a visual interface:

```bash
pyrite-server
# Visit http://localhost:8088
```

The web UI gives you:

- A rich text editor with `[[wikilink]]` autocomplete
- An interactive knowledge graph showing connections
- Search with filters and facets
- Collections for organizing entries into views

## What's in a KB?

After these steps, your knowledge base directory looks like:

```
my-brain/
  kb.yaml              # KB configuration and type definitions
  note/
    q1-planning-notes.md
    switch-to-async-standups.md
  person/
    sarah-chen.md
```

Each file is plain markdown you can edit in any text editor. The YAML frontmatter stores structured fields (type, tags, links). Git tracks all changes.

The SQLite index (`.pyrite/index.db`) is derived — delete it and rebuild with `pyrite index build`. Your files are always the source of truth.

## Next steps

- [How Pyrite Works](/docs/how-pyrite-works) — understand the architecture
- [Custom Types](/docs/custom-types) — define your own entry types
- [MCP Server](/docs/mcp-server) — configure access tiers for AI agents
- [Deploy](/docs/deploy) — run Pyrite on a VPS for your team
