---
title: "Two weeks of a loop of loops"
description: "Between 17 and 27 September, 249 pull requests merged into Pyrite: 195 from my agent loop and 54 from 16 outside contributors. We shipped eight releases in nine days. This is what the process looked like, what broke, and what we changed because of it."
date: 2026-10-07
author: Mark Ramm
tags: [process, agents, claude-code, contributing]
draft: true
---

Between 17 and 27 September, 249 pull requests merged into Pyrite's `dev`
branch. Seventeen people authored them. I wrote 195 of them, or rather my
agent loop did. The other 54 came from 16 outside contributors. We cut eight
releases in nine days, from v0.24.2 on the 18th to v0.25.5 on the 27th, and
wrote four architecture decision records in the last three days of that run.

I have been writing software for a long time. This is my first large project
where most of the code is written by AI agents, and I want to describe how
that went, including the parts that went badly. The failures taught me more
than the throughput did.

## What Pyrite is

Pyrite is Knowledge-as-Code. A knowledge base is a folder of markdown files
with YAML frontmatter, kept in git. Each entry has a type (`person`,
`decision`, `event`, `component` or whatever your schema defines), and its
fields are validated against the KB's schema. A SQLite index gives you keyword
search, and embeddings give you semantic search; hybrid mode uses both.

You reach it four ways: a CLI, an MCP server with read, write and admin tiers,
a REST API, and a SvelteKit web UI. Agents and people use the same entries.
Everything runs locally from plain files, and the history is `git log`.

I use it for two things. Pyrite's own development is tracked in a Pyrite KB
(`kb/` in the repo holds the ADRs, backlog, component docs and runbooks), and
I also use Pyrite for investigative journalism research. Much of what gets
fixed comes from me hitting a problem in one of those two.

## The loop of loops

Nate B Jones calls this shape a loop of loops, and I have adopted his phrase.
Here are the loops.

**The conductor** is a Claude Code session running on a timer. Each tick it
reads the GitHub issues and the roadmap, groups work into themes, and
dispatches a worker for each theme. It also reviews what the workers send
back, opens and shepherds pull requests, and cuts releases.

**Workers** each get one theme, one branch, and one git worktree. They write
tests first, then code, and end with a report: what changed, the evidence,
and what they didn't verify. Opus gets the design-shaped work and Sonnet gets
the well-specified work.

**Reviewers** do cold reads: a fresh agent that sees only the diff, not the
conversation that produced it. Any branch that touches auth, storage, the
server or a public interface gets one.

**The meta-conductor** runs a retrospective after roughly every five themes
land. It reads the tick log, PR timings and CI results, finds root causes for
what went wrong, and proposes one process change and one quality theme. I
approve or reject them.

All of it is in the repo: the skills are in `.claude/skills/` (`pyrite-dev`,
`pyrite-conductor`, `pyrite-meta-conductor`) and the agent definitions are in
`.claude/agents/`. Fifteen of the merged PRs in this window have titles
starting with `process:`. Those are the retro outcomes, and you can read
each one.

The branch rules are in ADR-0032. Nobody pushes to `dev`, including me and
the conductor. Every change is a pull request whose checks passed on top of
current `dev`. `main` moves only by fast-forward to a commit CI already
verified.

## What went wrong, and what changed

### The loop ran my laptop out of memory

On 18 September the conductor crashed my 16 GB Mac. It had up to eight full
test suites running at once: two workers, review suites it started itself,
and review agents I had asked to check outside PRs. Our cap on "heavy" work
counted dispatched workers and nothing else. `pytest -n auto` sizes itself to
the number of cores, not to what else is running.
([#168](https://github.com/pyrite-wiki/pyrite/issues/168))

That day I cut work in progress to one heavy task at a time
([#172](https://github.com/pyrite-wiki/pyrite/pull/172)). The next day, once
things were stable, we replaced that with two budgets
([#183](https://github.com/pyrite-wiki/pyrite/pull/183)). The machine budget
is four suite slots at `-n 4`: a worker takes one, a review suite one, and a
Playwright run two. The pull-request budget is at most two loop PRs ready to
merge at once. The machine hasn't crashed since. What surprised me is that
the PR budget mattered as much as the memory budget. I can only review so
much, and anything past that sits in a queue.

### A rebase that was really a revert

Early on 21 September (UTC), three times, a branch that had been rebased
onto `dev` turned into a revert of work that had merged while its test suite
was running. After [#271](https://github.com/pyrite-wiki/pyrite/pull/271)
landed, one rebased branch showed more than 100 lines deleted from the
clipper and its tests. Every one of these would have gone green, because the tests that
proved the lost feature were deleted with it. We caught them by reading
`git diff --stat` against a freshly fetched `dev`. A deletion in a file the
branch never touched is the sign.

The durable fix was a merge queue
([#274](https://github.com/pyrite-wiki/pyrite/pull/274)), which rebases and
re-tests at merge time. The same PR measured the other cost of our old
setup: merging one docs-only change put all 12 open PRs behind `dev`, so
with an "up to date" rule, draining N PRs cost O(N²) CI runs. Later a
Python 3.13-only failure reached `dev` because PR CI and the queue both ran
one interpreter ([#400](https://github.com/pyrite-wiki/pyrite/issues/400)).
Now the queue runs the full 3.11/3.12/3.13 matrix on the exact commit about
to land ([#423](https://github.com/pyrite-wiki/pyrite/pull/423)).

### Flaky tests and layered gates

With four workers running suites in parallel, the machine was loaded, and
tests with timing assumptions started failing. One assumed a background job
would still be running when it checked
([#88](https://github.com/pyrite-wiki/pyrite/issues/88), fixed in
[#426](https://github.com/pyrite-wiki/pyrite/pull/426)). Workers reacted by
running the suite again, and again. The retro counted one worker making 71
test or push calls for three small bugs, with a 45-minute pre-push run
repeating a pass that had just completed on the same tree.

Two changes came out of that. First, each tree is tested once
([#459](https://github.com/pyrite-wiki/pyrite/pull/459)): a passing run stamps
the tree's hash, the pre-push hook reuses the stamp, and the push to `dev`
skips the matrix the merge queue already ran on that commit. Second, the
layered-gates rule
([#469](https://github.com/pyrite-wiki/pyrite/pull/469)). If a pre-push run
fails on a test the change didn't touch, re-run that test alone. If it passes
alone, push and say so in the PR. The local run doesn't have to be perfect,
because PR CI, the merge queue's full matrix, the push to `dev`, the release
to `main` and review all come after it. If CI then fails that same test, it
is a real failure and goes back to the worker.

`dev` push CI in this window: 236 green, 10 red, 18 cancelled. Eight of the
reds were on 17 and 18 September while CI itself was being set up; the other
two were on the 25th. There have been none since.

### The conductor's own fixes

The conductor was allowed to make small fixes during review rather than
sending the branch back to the worker. In one window, three of its four
fixes introduced a new defect. The next attempt limited it by kind instead
of size, "one condition inside an existing guard", and that also shipped a
bug: a one-line change that marked every storage error retryable, so an
agent could loop forever on a permanent fault. The rule now is simple
([#444](https://github.com/pyrite-wiki/pyrite/pull/444)): after the first
round, the conductor changes text only. Every code finding goes back to the
worker, and a circuit breaker trips on the third worker round. The
conductor's reviews are better when it can't edit.

### Fixing symptoms

This one took me longest to see. The retros kept producing process rules:
pin every guard, name the surface a test must run on, no new mechanisms in
fix rounds. Each helped. But the same kinds of bugs kept coming back: a guard
that fails open on one of four surfaces, a history lookup that breaks on
another git edge case, a KB setting that one code path doesn't see. We were
fixing each instance.

I pushed the retro to keep asking why, past the process symptom, until it
reached the missing design decision
([#482](https://github.com/pyrite-wiki/pyrite/pull/482)). That produced the
ADRs:

- **ADR-0037**: one authorization policy point and one error contract. The
  access rule was already shared; what was missing was a single place where
  REST, MCP, the websocket and the CLI all ask it. The ADR counts 44 per-KB
  read checks in 19 files and four separate copies of the role ladder.
- **ADR-0038** (proposed): entry identity and the file lifecycle. One bug went
  through round after round of review, each finding a new git-history edge
  case, because we were tracking identity by file path.
- **ADR-0039**, one KB registry, is being specified by a spike now.
- **ADR-0040**: extensions live out of tree, and the plugin contract is the
  public API. The inventory found 43 `pyrite.*` symbols in 18 modules that
  the extensions import.

Each of those explains a family of bugs we had been fixing one at a time.
The retro's job is to find the missing invariant. Adding a rule is easier
and often does less.

## The constraint moved

The binding constraint in the loop moved during these two weeks. First it
was the machine. Then it was review: server and auth themes needed two or
three cold reads each, and first-pass yield through cold read was poor
enough that the real constraint was the quality of the first build. After
that, it was me.

The loop is fast between "draft PR" and "merged". The median open-to-merge
time across the 249 PRs was about 45 minutes. It is slow on anything that
needs my decision: accepting an ADR, merging an outside PR, choosing between
two designs. Those decisions arrive one per tick and then wait for me. In one
retro I had 18 open. Every time, the backlog cleared as soon as I sat down
and answered the whole list. The cost was the waiting, not the deciding.

A related rule: **a PR is a unit a reviewer can hold in their head.** Early
on the loop produced lots of small pieces of one idea, and each one cost me
a context switch. Now the default is to batch: one theme, complete, as many
commits as the idea needs. A follow-up to work in flight goes onto that
branch. I get fewer PRs, each one is more complete, and I spend less time
per change reviewing.

## Contributors

A fifth of the merged PRs came from people outside the loop. Thank you to
all 16 of you. The largest contributions came from
[@makiaveli1](https://github.com/pyrite-wiki/pyrite/pulls?q=is%3Apr+is%3Amerged+author%3Amakiaveli1)
with 27 merged PRs and
[@sb123sb123](https://github.com/pyrite-wiki/pyrite/pulls?q=is%3Apr+is%3Amerged+author%3Asb123sb123)
with 8.

Contributors also changed the process. Every changelog entry was appended at
the same spot in `CHANGELOG.md`, so any two PRs conflicted there. That
happened five times in one session, three of them on first-time contributors'
branches. Now each change adds its own file under `changelog.d/`, and the
release script assembles them (#243, in v0.25.0). The contributing guide
also asks you to post a short plan on an issue before spending more than an
hour on it, so two people don't build the same thing without knowing.

## Security and multi-user

v0.25.5 shipped a batch of multi-user hardening
([#533](https://github.com/pyrite-wiki/pyrite/pull/533)), following the
security releases 0.25.2, 0.25.3 and 0.25.4. Please upgrade if you run a shared
instance. To be plain about it, as the README now is
([#542](https://github.com/pyrite-wiki/pyrite/pull/542)): **multi-user is
experimental.** Pyrite is solid for one person, their agents, and a team that
trusts each other. Accounts, per-KB permissions and the public site work, but
they haven't had the review that a system holding other people's private data
needs. Don't put anything on a shared instance that you couldn't live with
every user of that instance reading.

## How to start

To try it (there's no PyPI wheel yet):

```bash
git clone https://github.com/pyrite-wiki/pyrite.git && cd pyrite
pip install -e ".[all]"
pyrite init --template research --path my-kb
pyrite create -k my-kb --type note --title "First note" --body "Hello" --tags start
pyrite search "hello" -k my-kb
```

The README shows how to connect the MCP server to Claude Desktop or Claude
Code, and how to build the web UI.

To contribute:

- Read [CONTRIBUTING.md](https://github.com/pyrite-wiki/pyrite/blob/dev/CONTRIBUTING.md).
  It covers setup, the hooks, and the claim-by-plan rule.
- Pick a
  [`good first issue`](https://github.com/pyrite-wiki/pyrite/labels/good%20first%20issue).
  [#553](https://github.com/pyrite-wiki/pyrite/issues/553), one shared
  `--format` option validated across the CLI, is a good one to start with.
- The roadmap is in `kb/roadmap.md`, and with Pyrite installed,
  `pyrite sw backlog -k pyrite` lists planned work by priority.
- If you use Claude Code, the same skills my loop uses are in the repo. Coming
  soon: open the repo in Claude Code on the web and the session sets itself up
  (venv, extensions, index, hooks) with no manual steps
  ([#551](https://github.com/pyrite-wiki/pyrite/pull/551)).

If you try it and something is confusing, file an issue. Much of what got
fixed in these two weeks started as someone's detour, and I would rather
hear about yours.
