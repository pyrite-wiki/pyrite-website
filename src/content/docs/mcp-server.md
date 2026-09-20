---
title: MCP Server
description: Three-tier MCP tools for read, write, and admin access to your knowledge base.
order: 5
section: concepts
---

Pyrite includes a built-in MCP server that lets any compatible AI agent (Claude Desktop, Claude Code, Cursor, etc.) interact with your knowledge bases.

## Three permission tiers

Each tier includes the tools from lower tiers.

| Tier | Tools |
|------|-------|
| **read** (70) | `kb_list`, `kb_search`, `kb_get`, `kb_timeline`, `kb_tags`, `kb_backlinks`, `kb_stats`, `kb_schema`, `kb_orient`, `kb_batch_read`, `kb_batch_suggest`, `kb_discover_neighbors`, `kb_list_entries`, `kb_recent`, `kb_qa_validate`, `kb_qa_status`, `kb_read_body`, `kb_find_by_status`, `kb_find_by_assignee`, `kb_find_by_location`, `kb_find_overdue`, `kb_index_job_status`, `list_edge_types`, `task_list`, `task_status`, `task_ancestors`, `task_blocked_by`, `task_critical_path`, `task_subtree` |
| **write** (+33) | read + `kb_create`, `kb_bulk_create`, `kb_update`, `kb_delete`, `kb_link`, `kb_qa_assess`, `task_create`, `task_update`, `task_claim`, `task_checkpoint`, `task_decompose` |
| **admin** (+9) | write + `kb_index_sync`, `kb_manage`, `kb_commit`, `kb_push`, `kb_registry_add`, `kb_registry_remove`, `kb_registry_reindex`, `kb_registry_health` |

112 tools at the admin tier. The tables above name the **core** tools; each
tier also exposes the plugin tools registered for it, which is most of the
count. `pyrite mcp --help` generates the exact totals from the live registry —
trust it over any number typed into a doc.

## Starting the server

```bash
# Full access (default)
pyrite mcp

# Read-only (safe for untrusted agents)
pyrite mcp --tier read

# Write access (no admin tools)
pyrite mcp --tier write
```

## Key tools

- **`kb_search`** — keyword, semantic, or hybrid search with pagination and field projection
- **`kb_orient`** — one-shot KB summary for agent onboarding (types, stats, recent activity)
- **`kb_batch_read`** — fetch multiple entries in a single call
- **`kb_bulk_create`** — create up to 50 entries per call with best-effort semantics
- **`kb_schema`** — inspect type definitions, field schemas, and validation rules
- **`task_claim`** — atomically claim a task, so parallel agents never take the same work
- **`task_decompose`** / **`task_critical_path`** — break work down and query the dependency DAG

Refused calls return stable error codes (`VALIDATION_FAILED`, `NOT_FOUND`, `READ_ONLY`) with `retryable: false`, so an agent does not retry a call that cannot succeed.

Paginated tools take `limit`/`offset`, but pagination metadata is **not**
uniform across surfaces — whether a given tool returns `has_more` or `total`
varies by tool and by transport (CLI, MCP, REST). See `docs/json-contracts.md`
in the repo for the measured per-surface table rather than assuming a flag is
present.

Search results return snippets by default — use `include_body` for full text
and `fields` for projection. Reads are **bounded by default**: a single body is
capped at 20,000 characters and a multi-entry response at 40,000 total. `fields`
cannot defeat the cap. An entry reached after the budget is spent comes back in
place with an empty body, `body_truncated: true` and its true `body_length` —
never dropped, never reported missing — and `kb_read_body` retrieves the rest.
The limits are tunable via `PYRITE_BODY_CHUNK_DEFAULT`, `PYRITE_BODY_CHUNK_MAX`
and `PYRITE_BODY_RESPONSE_BUDGET`.

Writes refuse a body marked `body_truncated: true`, so an agent that read a
long entry in chunks cannot silently destroy it by writing the fragment back.

## Prompts and resources

The MCP server also exposes:

- **4 prompts**: `research_topic`, `summarize_entry`, `find_connections`, `daily_briefing`
- **Resources**: `pyrite://kbs`, `pyrite://kbs/{name}/entries`, `pyrite://entries/{id}`

## Plugin tools

Plugins add their own tools per tier. For example, the software-kb extension adds `sw_adrs`, `sw_backlog`, `sw_new_adr`, `sw_components`, and `sw_standards`.
