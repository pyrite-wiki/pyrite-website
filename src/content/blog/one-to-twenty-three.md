---
title: "From one maintainer to twenty-three contributors"
description: "Four weeks ago Pyrite had no outside contributors. v0.25.7 has code from twenty-three people. What that changed: what we fixed, what we now call experimental, and the process that had to grow up."
date: 2026-10-13
author: Mark Ramm
tags: [community, release, security]
---

On September 17, Ruslan Terekhov sent the first pull request to Pyrite from
someone other than me: the MCP SSE endpoint broke under version 2.0 of the MCP
SDK, and served its messages from a doubled `/mcp/mcp/messages/` path. Two more
fixes from him followed the same day.

Four weeks later, v0.25.7 has code in it from twenty-three people. Seventy-seven
of the 354 pull requests ever merged came from contributors, and fifty-nine of
the sixty-two open right now are theirs.

I didn't see that coming. I had been quietly using Pyrite in my own work, and
had no idea anyone else was interested until that first pull request arrived.
So I wrote up a few issues and tagged them "good first issue" on GitHub, and
everything changed.

## The first thing that broke was the process

A project with one maintainer and a fleet of agents can get away with things a
community project cannot. Every unreleased change was a bullet appended to the
same spot in `CHANGELOG.md`, so any two pull requests conflicted. Unreleased
changes are now one file each under `changelog.d/`, assembled when a release
is cut.

Credit broke too. One contributor fixed a documented-but-missing command
fourteen minutes before another pull request merged the identical line, and
the fix shipped in 0.24.2 without thanking the person who got there first.
The release script now reads `Co-authored-by:` trailers over the release's own
commits — the form CONTRIBUTING.md asks for, and the only one
that survives the merge queue's squash.

## Taking other people's data seriously

A project other people run has to be one other people can trust. 0.25.1
through 0.25.5 were security releases, out of a threat-model review of the
multi-user path: per-KB authorization checks, MCP
sessions bound to the credential that opened them, Host and Origin guards, a
sign-up that stays closed until an operator creates an admin, and a
`.pyrite/config.yaml` found in a cloned tree no longer trusted with anything
beyond that tree. 0.25.6 stopped updates from deleting or rewriting
frontmatter keys the request did not name.

## Saying plainly what is experimental

The honest result of that review is that multi-user Pyrite — accounts, per-KB
permissions, anonymous readers, the public `/site` — works, but is not yet a
boundary I would ask anyone to rely on between people who should not see each
other's data. So the README, SECURITY.md and this site now say so, in plain
words, and so does a new [What's Supported](/docs/status) page. The Postgres
backend and the journalism-investigation extension are experimental too, and
three of the six extensions are now labelled as what they always were: example
plugins.

That narrows the pitch. Pyrite is alpha, and it is solid for one person and
their agents working locally. v0.25.7 is about making that first hour true:
`pyrite mcp-setup` writes the config Claude Code and Claude Desktop actually
read, commands print their result without log noise, `kb_orient` gives correct
answers as an agent's first call, and the
[Pyrite in 20 minutes](https://github.com/pyrite-wiki/pyrite/blob/main/docs/tutorials/pyrite-in-20-minutes.md)
tutorial runs in CI as a test.

## Thank you

Some of the work above is theirs.

**makiaveli1** landed more than anyone outside: 36 commits. Among them is a
series of ten pull requests for #223 that went through every extension —
cascade, software-kb, the wiki, zettelkasten, social, investigation — and made
each list tool return only the KBs its caller may read. They also made the web
clipper re-check every redirect hop rather than just the first URL, removed a
git pull that leaked unredacted errors, and gave REST, MCP and the CLI one
shared field-projection helper.

**sb123sb123** sent sixteen fixes, most of them to storage and the CLI:
refusing a rename onto an id that already exists, validating what a
`before_save` hook hands back, reporting sqlite-vec load failures instead of
silently going without, and listing a KB's declared types in validation errors.

**AbelTomato** stopped bulk create from overwriting existing entries, which
shipped in 0.25.3. **zhongxiao-chang** anchored bare YAML dates to UTC, and
made Pyrite write timestamps back only to files that already carry them.
**HarshRajSinghania** made the container bind correctly and honour the
platform's port, which the Railway, Render and Fly.io deploys depend on.
**ANO3457** fixed races in the web UI and added guards to the test suite, with
forty more pull requests open as I write this. And **Ruslan Terekhov**
(AsyncLegs) went first.

Every one of them is on the [community page](/community). If you want to join
them, start with
[CONTRIBUTING.md](https://github.com/pyrite-wiki/pyrite/blob/main/CONTRIBUTING.md).
Multi-user hardening is where help matters most.
