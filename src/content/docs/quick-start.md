---
title: Quick Start
description: Install Pyrite, create a knowledge base, and connect to Claude in 5 minutes.
order: 1
section: get-started
---

## Install

There is no PyPI wheel yet — install from a source checkout:

```bash
git clone https://github.com/markramm/pyrite.git
cd pyrite
pip install -e ".[all]"        # Core + AI + semantic search + dev tools
```

Or install only the extras you need:

```bash
pip install -e ".[server]"     # REST API server
pip install -e ".[cli]"        # Typer + Rich CLI
pip install -e ".[ai]"         # OpenAI + Anthropic SDKs
pip install -e ".[semantic]"   # sentence-transformers + sqlite-vec
pip install -e ".[postgres]"   # Postgres + pgvector backend
pip install -e .               # Core only
```

Docker works too, and serves the web UI on port 8088:

```bash
docker compose up -d
```

## Create a knowledge base

```bash
pyrite init --template research --path my-kb
cd my-kb
```

Templates available: `research`, `software`, `zettelkasten`, `intellectual-biography`, `movement`, `empty`.

`pyrite init` does not run `git init` for you. If you want every change versioned from the start, initialize git yourself.

## Add some entries

```bash
pyrite create -k my-kb --type person --title "Sarah Chen" \
  --body "Engineering lead. Considering move to consulting." --tags "team,engineering"

pyrite create -k my-kb --type note --title "Switch to async standups" \
  --body "Decided 2026-03-01. Reduces meeting load by 3hrs/week." --tags "process"
```

## Search

```bash
# Keyword search
pyrite search "career transition" -k my-kb

# Semantic search (finds conceptually related content)
# The first semantic search downloads the embedding model (~90 MB, one time).
pyrite search "team decisions" -k my-kb --mode=semantic

# Hybrid (both at once)
pyrite search "team decisions" -k my-kb --mode=hybrid
```

## Connect to Claude Desktop or Claude Code

Run `pyrite mcp-setup` to write the config for you, or add it by hand:

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

Now any AI that speaks MCP can search, read, and write your knowledge base.

## What just happened

Pyrite created markdown files with YAML frontmatter in a git-versioned directory. It built a SQLite FTS5 index on top for fast search, and the MCP server exposes that index to any AI agent.

Your files are the source of truth. The index is derived. Rebuild it any time with `pyrite index build`.
