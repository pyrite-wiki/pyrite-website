---
title: CLI Reference
description: Command-line interface for searching, reading, writing, and managing knowledge bases.
order: 7
section: reference
---

All commands support `--format json` for agent consumption. `pyrite --version` (or `-V`) prints the installed version.

## Search

```bash
# Keyword search
pyrite search "immigration policy"

# Scoped to a KB, type, and mode
pyrite search "immigration" --kb=timeline --type=event --mode=hybrid

# Semantic search (vector similarity)
pyrite search "career transition" --mode=semantic
```

## Read

```bash
# Get an entry by ID
pyrite get stephen-miller

# Find what links to an entry
pyrite backlinks stephen-miller --kb=research

# Browse by time
pyrite timeline --from=2025-01-01 --to=2025-06-30

# List collections
pyrite collections list --kb=research
```

## Write

```bash
# Create an entry
pyrite create --kb=research --type=person --title="Jane Doe" \
  --body="Senior policy advisor." --tags="policy,doj"
```

## Admin

```bash
# Re-index after editing files directly
pyrite index sync

# Check for stale or missing entries. Exits 1 when unhealthy, so CI can
# gate on it; --no-fail restores the always-0 behaviour. -k scopes to one KB.
pyrite index health
pyrite index health -k research

# Embed queued entries (semantic search is eventually consistent)
pyrite index embed

# Auto-discover KBs by kb.yaml presence
pyrite kb discover
```

## Schema management

```bash
# Show type versions and field changes
pyrite schema diff --kb=research

# Apply migrations to entries
pyrite schema migrate --kb=research
```

## Deploy

```bash
# Self-host on a VPS
git clone https://github.com/markramm/pyrite.git && cd pyrite
bash deploy/selfhost/setup.sh kb.example.com
```

## Install extras

```bash
git clone https://github.com/markramm/pyrite.git
cd pyrite
pip install -e .                  # Core
pip install -e ".[all]"           # Everything
pip install -e ".[ai]"            # LLM providers
pip install -e ".[semantic]"      # Vector search
```
