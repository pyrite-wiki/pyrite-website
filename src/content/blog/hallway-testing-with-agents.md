---
title: "Hallway testing, but the user is an agent"
description: "We handed Pyrite's CLI and MCP surfaces to two agents, told them to do real work, and asked them to write down every detour. They found the same server-wide bug from opposite directions — and a silent corruption bug that had been shipping for weeks."
date: 2026-09-20
author: Mark Ramm
tags: [usability, mcp, cli, agents]
---

Hallway testing is the cheapest usability method there is. You grab someone in
the hallway who has never seen the thing, you give them a task, and you watch
where they stumble. You do not help. The stumbles *are* the data.

Pyrite is a knowledge base whose primary users are AI agents. They reach it
through an MCP server and a CLI. So the obvious question: what happens if you
run a hallway test where the person in the hallway is an agent?

We tried it twice on the same day, on two different surfaces, with two testers
who could not see each other's work. The results were good enough that the
method is now part of how we ship.

## The setup

The rules were the ones that make hallway testing work, translated:

- **Do real work, not a test script.** Every command had to be run because a
  task needed it. A synthetic probe tells you the tool responds; it does not
  tell you the tool is usable.
- **No help.** No reading the source to figure out what a flag meant. If it
  wasn't discoverable from `--help` or the tool description, that was a
  finding.
- **Log everything, including your own mistakes.** Detours, guesses,
  workarounds, things you had to look up, things you got wrong. Friction stops
  feeling like friction ten minutes later, so it gets written down while it
  still stings.
- **The friction log and the work are both deliverables.** A session that
  produced good research and no friction notes failed half its job.

One tester used the CLI for a two-hour session of ordinary editorial and
research work against a 3,576-entry corpus: a conductor tick, a four-way
fact-check, a gap audit, some corpus-health repair. The other came in cold
with no prior Pyrite context and explored a 27,000-entry corpus across 54
knowledge bases through the MCP read tier.

## What came back

Two things made this worth writing up.

### The same bug, from opposite directions

Both testers independently found that search filters were being silently
dropped.

The CLI tester noticed that `--type theme` returned a `mechanism`. The MCP
tester ran a bogus-value test and found that `entry_type="zzz-not-a-real-type"`
returned eight cheerful results. Same root cause: filters were compiled into
the keyword leg's `WHERE` clause, and the vector leg was queried unfiltered.
Fuse the two result sets and the constraint quietly evaporates.

The default search mode is `hybrid`. So this was the default path.

What makes the convergence useful is not that two testers found one bug. It is
what it proved about the bug's *shape*. One report is a CLI quirk you might fix
in the CLI. Two reports from opposite surfaces, filed hours apart by testers
who never spoke, told us within a day that the defect lived in the shared
search service — that it was server-wide, and that fixing it in either client
would have been fixing the wrong layer.

The sharpest evidence was not the bogus-value test, incidentally. It was
`--type theme` returning a `mechanism`. A bogus value returning results can be
argued about — maybe the filter ran and the name validation is lenient. A
*valid* filter returning the wrong type proves the filter never ran at all.

The fix in 0.24.3 applies filters to the vector leg, declares whether a backend
can do that as an explicit capability rather than inferring it from a caught
`TypeError`, and — the part the testers actually asked for — returns a
`warnings` field naming any filter the backend could not honor. A dropped
constraint is now self-reporting instead of silent.

### A corrupting bug, found by looking at a diff

The CLI tester ran `pyrite link` once, on one entry, while doing unrelated
corpus-health work. It printed `Linked:` and exited 0. The diff was +97/−84 on
a 96-line file.

The body had been folded into a YAML scalar, internal paths written into the
file, key order scrambled, and six fields dropped outright. The resulting
frontmatter did not parse at all.

The trigger, isolated with six single-construct probes: a body line consisting
only of hyphens and pipes. A markdown table separator. A horizontal rule.
Inside a double-quoted YAML scalar, `|---|---|` terminates the frontmatter
block early.

Markdown tables are everywhere in these corpora, which means the corrupting
case was the ordinary case. And it was reachable from four commands, including
`update` — the one every automated workflow reaches for to change a tag.

Note what actually found it: not a probe, but *a human-scale habit*. Reading
the diff after running a command. The tester was not testing `link`; they were
using it, noticed the file looked wrong, and pulled the thread.

## The real finding was the pattern

Individually these are just bugs. Read together, the two reports said something
sharper, and the CLI tester named it in one line:

> The recurring theme across every finding is silence.

Filters dropped without notice. A plugin validator that raised a `TypeError`,
got swallowed by a broad `except`, and left every cascade-KB validation
silently skipped while printing a traceback and exiting 0. `index sync`
reporting `Updated: 1` while changing nothing. `link` reporting success while
destroying the file. A semantic search returning three results against a limit
of ten with no explanation.

In every case the tool's output was consistent with success, and only an
independent check revealed otherwise.

That is a much more actionable finding than any single bug, and it is the kind
of thing you only see when one tester does many different tasks in one sitting
and then reflects across them. It changed what we fix and how. Bounded reads,
explicit `warnings` arrays, refusing to write a body marked `body_truncated`,
`index health` exiting non-zero when it is unhealthy — these are all the same
correction applied in different places. Make the failure loud.

It also produced a design rule we now apply generally: **a parameter that
reduces output never disables another bound.** That came straight from a
finding where passing both `fields` and `body_limit` — two token-reduction
parameters — returned 171,189 characters, 28× the explicit cap, and blew the
client's tool-output ceiling. It is written down as
[ADR-0034](https://github.com/pyrite-wiki/pyrite/blob/main/kb/adrs/0034-agent-facing-reads-are-bounded-by-default.md)
now, because the rule had existed in the code unwritten, which is precisely why
it had never been applied uniformly.

## Why agents are good hallway testers

Some of this is specific to agents being the actual users. But some of it
generalizes, and it surprised us.

**They are genuinely cold.** A cold start is hard to arrange with human
testers — anyone on the team knows too much. An agent with no prior context is
cold in a way you can reproduce on demand.

**They notice the cost of things humans skim.** One finding was that
`kb_orient` returns ~9,000 tokens on the first call of every session, of which
a read-only session uses about 1,200. The remaining ~7,800 is write-side schema
— correct, useful if you are about to write, and paid for and discarded if you
are not. A human tester would not have felt that. For an agent it is
measurable, every session.

**They write down the near-misses.** Both reports have a section titled some
version of "things I got wrong." One tester nearly filed a bug that turned out
to be their own script swallowing an error payload. Another built and discarded
two root-cause theories that both fit the data and were both spurious. They
reported these unprompted, because a false bug report costs a maintainer more
than a missing one — and underneath the false bug were two real findings about
error handling that we would not otherwise have gotten.

**They are specific about what works.** Both reports carry a "what worked —
specifically" section, written because the failure list is always longer and
would give a misleading impression. One of them ends with **"Do not touch
it."** That is load-bearing information. Knowing which parts of your interface
are good is how you avoid breaking them while fixing the bad parts.

## What we changed about how we ship

Three things.

**The friction log is a deliverable.** Real work plus a friction log, both
required. A session that produces one without the other is half-done.

**Findings become tests, not just fixes.** The corruption bug became a
parametrized regression test across all four affected commands, plus a
round-trip identity gate that loads every entry in the real corpus, saves it
back untouched, and asserts the bytes are identical. That gate runs in a couple
of seconds on the default suite and catches the entire class — "save wrote
something load did not read" — rather than the one instance we found. It
immediately surfaced five more issues we had not known about.

**Rules that exist only in the code get written down as ADRs.** The bounded-read
rule was real but unwritten, so it was applied inconsistently and a reviewer
could argue against it in good faith — one contributor's fix closed the
projection hole and was asked in review to reopen it, to preserve a contract
nobody had decided to keep. Writing it down settled it.

## Try it on your own tools

If you ship an MCP server or a CLI that agents use, this is cheap to run. Give
an agent real work, not a test script. Tell it to log every detour, guess and
workaround, including the ones that turn out to be its own fault. Ask it
explicitly what worked, so you know what not to break. Then run it on two
surfaces at once with testers who cannot see each other, and pay close
attention to anything both of them hit — that is where your bug is deeper than
it looks.

Six issues surfaced in two hours on the CLI. Thirteen on the MCP read tier in a
single cold session. None required adversarial probing. They were all just
sitting there, in the ordinary path, waiting for someone to write down what
they noticed.

---

*The full reports are in the repo:
[CLI](https://github.com/pyrite-wiki/pyrite/blob/main/tests/usability/cli-hallway-report-2026-09-18.md)
and
[MCP read tier](https://github.com/pyrite-wiki/pyrite/blob/main/kb/notes/hallway-test-read-tier-mcp-2026-09-18.md).
Both are published as-is, verbatim errors included.*
