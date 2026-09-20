---
title: How Pyrite Works
description: The mental model behind Pyrite — markdown files, SQLite indexes, and multiple interfaces.
order: 4
section: concepts
---

Pyrite is built on a simple idea: **your knowledge lives in markdown files, and everything else is derived**.

## The three layers

```
┌─────────────────────────────────────────────┐
│  Interfaces                                 │
│  Web UI · CLI · MCP Server · REST API       │
├─────────────────────────────────────────────┤
│  Index (SQLite + FTS5 + optional vectors)   │
├─────────────────────────────────────────────┤
│  Source of truth (markdown + YAML in git)   │
└─────────────────────────────────────────────┘
```

### Layer 1: Markdown files in git

Every entry is a markdown file with YAML frontmatter. A person entry looks like:

```markdown
---
id: jane-doe
title: Jane Doe
type: person
tags: [engineering, leadership]
role: VP Engineering
organization: Acme Corp
---

Jane leads the platform team. Previously at BigCo
where she built the data pipeline.
```

Files are organized in directories by type (`notes/`, `people/`, `events/`). The directory structure is a convention, not a requirement — Pyrite reads frontmatter to determine types.

Because everything is git, you get version history, branching, collaboration, and diffs for free. Your knowledge base is a repo you can clone, fork, and merge.

### Layer 2: SQLite index

When you run `pyrite index build` (or the server starts), Pyrite scans all markdown files, parses frontmatter, and builds a SQLite database with:

- **FTS5 full-text search** over titles, bodies, and tags
- **Structured metadata** (type, dates, tags, links) for filtering
- **Optional vector embeddings** for semantic search (via sentence-transformers)
- **Link graph** tracking `[[wikilinks]]` between entries

The index is **derived and disposable**. Delete it, rebuild it from the files. This is why Pyrite can be confident about data integrity — the files are always the authority.

### Layer 3: Interfaces

Multiple interfaces read from the same index:

- **CLI** (`pyrite search`, `pyrite get`) — fast terminal access
- **MCP Server** (`pyrite mcp`) — lets AI agents search, read, and write your KB
- **REST API** (`pyrite-server`) — powers the web UI and external integrations
- **Web UI** — SvelteKit app for browsing, editing, and visualization

All write operations go through the same path: update the markdown file, then re-index. This means every interface sees the same data, and changes from one are immediately visible in the others.

## Search modes

Pyrite supports three search modes:

| Mode | How it works | Best for |
|------|-------------|----------|
| **keyword** | SQLite FTS5 with BM25 ranking | Exact terms, names, IDs |
| **semantic** | Vector similarity via sentence-transformers | Conceptual queries, "things like X" |
| **hybrid** | Both, with reciprocal rank fusion | General-purpose — best of both |

Keyword search works out of the box. Semantic search requires the semantic extra (`pip install -e ".[semantic]"` from the repo).

With `auto_embed` on (the default, disable with `PYRITE_AUTO_EMBED=0`), writes queue their own embedding rather than blocking on it: an entry is keyword-searchable the moment it is written, and becomes findable by meaning once a drain runs. Drains happen on `pyrite index embed`, `index sync`, `index build` and at every `pyrite-server` startup. **Semantic search is therefore eventually consistent** — an entry written a moment ago may not match a semantic query yet, and a semantic search against a KB with no embeddings says so in its warnings instead of returning a silent empty list.

## Typed entries

Every entry has a `type` field in its frontmatter. Types define:

- **Fields** with validation rules (text, number, date, select, etc.)
- **AI instructions** — guidance for agents creating entries of that type
- **Subdirectories** — where files of that type live

Ten types ship built-in (`note`, `person`, `organization`, `event`, `document`, `topic`, `relationship`, `timeline`, `collection`, `qa_assessment`). You can define custom types in `kb.yaml` or via plugins.

## Multi-KB architecture

A single Pyrite installation can manage multiple knowledge bases. Each KB is an independent git repo with its own types, schema, and access controls. The index aggregates them all, so search works across KBs.

```yaml
# ~/.pyrite/config.yaml
knowledge_bases:
  - name: work
    path: ~/kbs/work
  - name: research
    path: ~/kbs/research
  - name: personal
    path: ~/kbs/personal
```

This lets you keep separation (personal vs. work) while still having a unified search and a single MCP server that agents can query.
