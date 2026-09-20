/**
 * Current Pyrite release, plus the figures the site quotes about the project.
 *
 * Update this file as part of cutting a release — it is the only place the
 * site states a version or a count, so bumping it here updates every page.
 *
 * Verify the counts against the source, not the README:
 *   mcpTools  -> `pyrite mcp --help`, whose counts are generated from the live
 *                tool registry. The tiers are CUMULATIVE and include plugin
 *                tools: read 70, write = read + 33, admin = write + 9. Do not
 *                use the READ_TOOLS/WRITE_TOOLS/ADMIN_TOOLS dicts in
 *                tool_schemas.py (29/11/8) — those are core tools only and
 *                undercount the exposed surface by 2.4x.
 *   extensionPoints -> public methods on PyritePlugin in pyrite/plugins/protocol.py
 *   extensions -> directories in extensions/
 *   tests -> python -m pytest --collect-only -q | tail -1
 */
export const release = {
  version: "0.24.3",
  date: "2026-09-20",
  url: "https://github.com/markramm/pyrite/releases/tag/v0.24.3",
  /** Set true when a release carries fixes users should upgrade for. */
  security: true,
  securityNote:
    "Private knowledge bases were readable over MCP-over-HTTP by any logged-in user. If you run pyrite-server for more than one person, upgrade.",
  /**
   * The headline for this release: Pyrite picked up its first outside
   * contributors. Numbers measured from the 0.24.1..0.24.3 range, not asserted.
   */
  headline:
    "Our first outside contributors — and the first repeat ones. This release is about earning that: hardening the test suite, fixing the bugs they found, tightening process, and a deep security review.",
} as const;

export const counts = {
  /** Total tools exposed at the admin tier — the full surface. */
  mcpTools: 112,
  /** Cumulative per tier, plugin tools included. */
  mcpRead: 70,
  mcpWrite: 103,
  mcpAdmin: 112,
  /** Tools each tier adds on top of the one below it. */
  mcpWriteAdds: 33,
  mcpAdminAdds: 9,
  extensions: 6,
  extensionPoints: 19,
  entryTypes: 11,
  /** `pytest --collect-only` at v0.24.3: 5608/5634 collected. */
  tests: "5600+",
} as const;

/** Outside contributors as of v0.24.3 — 8 of 86 merged PRs (9%). */
export const community = {
  outsidePrs: 8,
  mergedPrs: 86,
  openPrsFromContributors: 11,
  openPrs: 13,
  contributors: [
    "Voyagerroc-Lab",
    "YaoSong808",
    "fathirramadhan-web",
    "makiaveli1",
    "zhongxiao-chang",
  ],
} as const;
