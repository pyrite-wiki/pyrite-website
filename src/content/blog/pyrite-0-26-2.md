---
title: "Pyrite 0.26.2: a network call borrows nothing"
description: "A security release. A request that reaches Pyrite over the network now gets the entries it has a grant on, and nothing else the server account holds."
date: 2026-11-11
author: Mark Ramm
tags: [release, security]
---

Pyrite runs as you. When you start `pyrite serve`, the server can read your
files and use your git credentials, and an error from a library can name a
path on your disk. That is fine for the CLI on your own machine. A request that
arrives over the network is a different caller, and 0.26.2 treats it as one.

The rule is now written down ([ADR-0052](https://github.com/pyrite-wiki/pyrite/blob/main/kb/adrs/0052-a-network-call-borrows-nothing-of-the-server-account-reach-is-decided-where-a.md),
proposed): **a network call reaches the entries it holds a grant on, and
nothing else the server account holds.** The changes that follow from it:

- **Responses carry only text Pyrite wrote.** A REST or MCP-over-HTTP answer
  no longer quotes an operating-system error, a library's message, git's
  output or a line of your file. It says "the server log has the details",
  and the server log has them. The CLI and stdio MCP still show you
  everything. A test reads the whole codebase for new places that put an
  exception's text into a response, and another calls every API route and
  every MCP tool with a fault injected.
- **Git run for a network caller borrows no credentials.** It no longer reads
  your global git config, credential helpers or askpass. Destinations are
  checked against the hosts you allow.
- **Reads, exports and writes stay inside the KB.** Secret files are written
  readable by you only.
- **Expensive work has a ceiling:** link checks, rubric patterns, YAML
  aliases, the web clipper and QA reads.

## If you upgrade

- Registering a KB over the network now needs `settings.kb_roots`. With none
  set, the web UI's create-KB answers 403 until you add the folders network
  callers may use.
- Where a network response used to quote an error's detail, it now points to
  the server log.
- A few of Pyrite's own refusals that came back as `INTERNAL` or `ERROR` now
  come back as `VALIDATION_FAILED`, and are not retryable.

The full notes are in the [CHANGELOG](https://github.com/pyrite-wiki/pyrite/blob/main/CHANGELOG.md).

## What it does not claim

Multi-user Pyrite is still experimental, and this release does not make it a
service for people who don't trust each other. ADR-0052 lists the limits
0.26.2 leaves for the next release, among them git output that a function
returns rather than raises, and pinning the clipper's connection to the
address it checked.

Thanks to @dbdefault, @deepit20, @nosmile99, @swastiktawate and @tnalbant,
whose fixes are in this release too.
