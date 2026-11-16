---
title: "Pyrite 0.26.3: a network call borrows nothing, continued"
description: "A security release for anyone running pyrite serve. Network git gets only the credential you grant it, reads stay inside the KB, responses carry only Pyrite's own text, and default_role means what config.yaml says."
date: 2026-11-16
author: Mark Ramm
tags: [release, security]
---

0.26.2 wrote down the rule
([ADR-0052](https://github.com/pyrite-wiki/pyrite/blob/main/kb/adrs/0052-a-network-call-borrows-nothing-of-the-server-account-reach-is-decided-where-a.md),
proposed): **a network call reaches the entries it holds a grant on, and
nothing else the server account holds.** 0.26.3 carries it further. If you
run `pyrite serve`, upgrade. The CLI and stdio MCP keep your full reach and
detail, as before.

- **Network git gets only the credential you give it.** A git command run for
  a REST or MCP-over-HTTP caller gets its environment from an allow-list and
  Pyrite's own config. The only credential it gets is the caller's own token,
  or a `git_credentials` entry you configure for that host, KB and transport.
  An https remote never gets an ssh key; an ssh remote never gets a token.
- **Nothing is learned from a file outside a KB.** Bytes, and any fact derived
  from them (an entry id, whether a file exists, a hash), come only from files
  read inside the KB's folder. A symbolic link that leads out answers the same
  whatever it points at.
- **Responses carry only text Pyrite wrote, or text that is yours.** Where
  your own JSON, YAML, CSV or search query does not parse, you now get the
  parser's words about your input instead of "the server log has the details".
  Text that quotes a KB file goes only to a signed-in caller who can read that
  KB.
- **`default_role` is exactly what `config.yaml` says.** One check at every
  source. A typo such as `admin` or `Read` now stops the config load with an
  error naming the KB, where it used to grant a role. On upgrade, a KB that
  was closed stays closed.

## If you upgrade

- A private repository reached over REST or MCP needs a `git_credentials`
  entry. The server account's ssh agent, keys, credential helpers and netrc no
  longer apply to network callers.
- Behind a proxy, set `git_proxy` (or `PYRITE_GIT_PROXY`).
- Set `git_identity` for commits Pyrite makes for network callers. The
  fallback to the account's global identity is removed in 0.27.0.
- An invalid `default_role` now stops the load. Fix the line it names.
- Plugins: `Entry.load(path)` is removed; load entry files through
  `KBRepository`.

The walkthrough is "Upgrading to 0.26.3: network git" in
[docs/configuration.md](https://github.com/pyrite-wiki/pyrite/blob/main/docs/configuration.md).

## Also in this release

- A file whose type refuses one of its values is no longer indexed silently as
  an `event`. Index health names it, reads return it as its own type with the
  refused fields listed, and writes to it are refused until you fix the field.
- `lifecycle` must be `active` or `archived`.
- `{date}` in a `kb.yaml` type's `file_pattern` resolves from the entry's
  metadata.
- CI and fresh checkouts install from a committed lock, so a new upstream
  release can no longer turn them red on its own.
- Several CLI options now refuse out-of-range values as usage errors.

The full notes are in the
[release](https://github.com/pyrite-wiki/pyrite/releases/tag/v0.26.3).

## What it does not claim

Multi-user Pyrite is still experimental. This release closes more of the
distance between the server account and the people who call it, and there is
more of that work to come. It does not yet make Pyrite a service for people
who don't trust each other.

Thanks to @KingEmma7, @Sonike, @Vamsi-2581, @bfs2021, @fate-lab,
@sarankumar1325, @sbdhkfl and @swastiktawate, whose work is in this release.
