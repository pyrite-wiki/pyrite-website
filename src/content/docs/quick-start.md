---
title: Quick Start
description: Install Pyrite, create a knowledge base, and connect to Claude in 5 minutes.
order: 1
section: get-started
---

## Install

There is no PyPI wheel yet — install from a source checkout:

```bash
git clone https://github.com/pyrite-wiki/pyrite.git
cd pyrite
pip install -e ".[all]"        # Core + AI + semantic search + dev tools
```

Or install only the extras you need:

```bash
pip install -e ".[server]"     # REST API server
pip install -e ".[cli]"        # Typer + Rich CLI
pip install -e ".[ai]"         # OpenAI + Anthropic SDKs
pip install -e ".[semantic]"   # sentence-transformers + sqlite-vec
pip install -e ".[postgres]"   # Postgres + pgvector backend (experimental; not in [all])
pip install -e .               # Core only
```

Docker works too, and serves the web UI at `http://localhost:8088`:

```bash
docker compose up -d
```

The compose file publishes on `127.0.0.1` only and runs with no credential, so
only this machine can reach it. Turn on auth before you expose it to anyone
else — and read [What's Supported](/docs/status) first: multi-user is
experimental.

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
# Entries embed in the background, so run `pyrite index embed` first if you
# just created them.
pyrite search "team decisions" -k my-kb --mode=semantic

# Hybrid (both at once)
pyrite search "team decisions" -k my-kb --mode=hybrid
```

## Connect to Claude Desktop or Claude Code

```bash
pyrite mcp-setup
```

This points a `pyrite` server entry at this install in every client it finds —
Claude Code (user scope, or `./.mcp.json` with `--project`) and Claude
Desktop — at the write tier (`--tier read` or `--tier admin` to choose), and
prints a JSON report of what it changed. Restart the client afterwards.

For any other MCP client, add it by hand:

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

For a longer walk-through, [Pyrite in 20 minutes](https://github.com/pyrite-wiki/pyrite/blob/main/docs/tutorials/pyrite-in-20-minutes.md)
goes from nothing to an agent-written research KB. CI runs it as a test.

## What just happened

Pyrite created markdown files with YAML frontmatter in a git-versioned directory. It built a SQLite FTS5 index on top for fast search, and the MCP server exposes that index to any AI agent.

Your files are the source of truth. The index is derived. Rebuild it any time with `pyrite index build`.
