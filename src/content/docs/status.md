---
title: What's Supported
description: Pyrite is alpha. What it supports today, and what it marks experimental.
order: 0
section: get-started
---

Pyrite is **alpha**. As of v0.25.7 it is solid for **one person and their
agents, working locally** — and for a small team that trusts each other. That
is what the project tests, documents and fixes first.

## Supported

- **Your files.** Markdown with YAML frontmatter, versioned in git. They are the
  source of truth; Pyrite changes what it was asked to change.
- **The index and search.** SQLite with keyword, semantic and hybrid search.
  Delete the index any time and rebuild it with `pyrite index build`.
- **The CLI.**
- **The core MCP tools**, at the read, write and admin tiers, set up with
  `pyrite mcp-setup` for Claude Code and Claude Desktop.
- **The software-kb and cascade extensions.**

The [Pyrite in 20 minutes](https://github.com/pyrite-wiki/pyrite/blob/main/docs/tutorials/pyrite-in-20-minutes.md)
tutorial uses only these, and CI runs it as a test on every change.

## Experimental

These exist and work, but you should not depend on them yet.

| Feature | Status |
|---------|--------|
| **Multi-user**: accounts, per-KB permissions, anonymous readers, the public `/site`, shared or internet-facing servers | Being hardened every release, but not yet a boundary between people who should not see each other's data. Treat every KB on a shared instance as readable by every user of it. |
| **Postgres backend** | Experimental. SQLite is the supported index. |
| **journalism-investigation extension** | Its MCP tools are unsupported until the 0.28 plugin/API contract. |
| **zettelkasten, encyclopedia, social** | Example plugins: reference code for plugin authors, not supported products. |

Read [SECURITY.md](https://github.com/pyrite-wiki/pyrite/blob/main/SECURITY.md#multi-user-is-experimental)
before you host Pyrite for other people. Security fixes for multi-user ship in
regular releases, and the [release notes](https://github.com/pyrite-wiki/pyrite/blob/main/CHANGELOG.md)
say who should upgrade.
