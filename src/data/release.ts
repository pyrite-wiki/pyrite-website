/**
 * Current Pyrite release, plus the figures the site quotes about the project.
 *
 * Update this file as part of cutting a release — it is the only place the
 * site states a version or a count, so bumping it here updates every page.
 *
 * Verify the counts against the source, not the README:
 *   mcpTools  -> `pyrite mcp --help`, whose counts are generated from the live
 *                tool registry. The tiers are CUMULATIVE and include plugin
 *                tools: read 66, write = read + 31, admin = write + 9. Do not
 *                use the READ_TOOLS/WRITE_TOOLS/ADMIN_TOOLS dicts in
 *                tool_schemas.py — those are core tools only and undercount
 *                the exposed surface.
 *   extensionPoints -> public methods on PyritePlugin in pyrite/plugins/protocol.py
 *   extensions -> directories in extensions/
 *   tests -> python -m pytest --collect-only -q | tail -1
 */
export const release = {
  version: "0.26.0",
  date: "2026-10-22",
  url: "https://github.com/pyrite-wiki/pyrite/releases/tag/v0.26.0",
  /** Set true when a release carries fixes users should upgrade for. */
  security: true,
  securityNote:
    "Writes to a KB entry now stay inside the KB root, which matters for any KB that contains symbolic links. For instances with more than one user, which stay experimental: one landing rule decides where every write lands, and request bodies are bounded. Run pyrite index build once after upgrading; link counts change. Details: https://github.com/pyrite-wiki/pyrite/issues/1258",
  /** One line for the homepage banner. Keep it short: it sits beside the version. */
  bannerNote: "Run pyrite index build once after upgrading. The cascade extension, the built-in public site and the Streamlit UI are removed.",
  /** The headline for this release, from the 0.26.0 release notes. */
  headline:
    "Your files, exactly. A write changes only what was asked (ADR-0042, ADR-0051): create, update, link, rename and schema migrate are operations on the file's own text, so comments, key order, quoting and line endings stay as written, and a request that changes nothing writes nothing.",
} as const;

export const counts = {
  /** Total tools exposed at the admin tier — the full surface. */
  mcpTools: 106,
  /** Cumulative per tier, plugin tools included. */
  mcpRead: 66,
  mcpWrite: 97,
  mcpAdmin: 106,
  /** Tools each tier adds on top of the one below it. */
  mcpWriteAdds: 31,
  mcpAdminAdds: 9,
  extensions: 5,
  extensionPoints: 19,
  entryTypes: 11,
  /** `pytest --collect-only` at v0.26.0: 21663/21689 collected (collected, not passing). */
  tests: "21,600+",
} as const;

/**
 * What the project supports at this release, and what it marks experimental.
 * Source: the v0.26.0 README, SECURITY.md and docs/tutorials. Re-read them
 * each release — this list moves.
 */
export const status = {
  stage: "alpha",
  supportedFor: "one person and their agents, working locally",
  supported: [
    "Markdown files and git as the source of truth",
    "The index and search (keyword, semantic, hybrid)",
    "The CLI",
    "The core MCP tools, at the read, write and admin tiers",
    "The software-kb extension",
  ],
  experimental: [
    {
      name: "Multi-user",
      detail:
        "Accounts, per-KB permissions, anonymous readers and shared or internet-facing servers. They work, and every release closes more gaps, but they are not yet a boundary between people who should not see each other's data.",
    },
    {
      name: "Postgres backend",
      detail: "The SQLite index is the supported one.",
    },
    {
      name: "journalism-investigation extension",
      detail: "Its MCP tools are unsupported until the 0.28 plugin/API contract.",
    },
    {
      name: "Example plugins",
      detail:
        "zettelkasten, encyclopedia and social are reference code for plugin authors, not supported products.",
    },
  ],
} as const;

/**
 * Community figures as of v0.25.7 (2026-10-13). Measured, not asserted:
 *   mergedPrs/outsidePrs -> `gh pr list --state merged`, merged on or before
 *     the tag, dependabot excluded.
 *   contributors -> GitHub's contributor list plus commit authors and
 *     Co-authored-by trailers, with people who commit under two names
 *     counted once.
 */
export const community = {
  /** People with code in the release, the maintainer included. */
  people: 23,
  outsideContributors: 22,
  /** The release the site last compared against, and its outside contributors. */
  previousVersion: "0.24.3",
  outsideContributorsAtPrevious: 6,
  mergedPrs: 354,
  outsidePrs: 77,
  /** Open PRs on 2026-10-13, and how many of them are from contributors. */
  openPrs: 62,
  openPrsFromContributors: 59,
  /** GitHub logins, most merged work first. */
  contributors: [
    "makiaveli1",
    "sb123sb123",
    "ANO3457",
    "zhongxiao-chang",
    "berkay-byte",
    "AbelTomato",
    "AsyncLegs",
    "Gambit-Checkmate",
    "fatihcvs",
    "HarshRajSinghania",
    "Saturday-boyi",
    "DYNOSuprovo",
    "fathirramadhan-web",
    "feliperzk",
    "Jah-yee",
    "kudala-bharani",
    "nightcityblade",
    "ShivanshShukla",
    "Voyagerroc-Lab",
    "xuu33030",
    "YaoSong808",
    "ZhaoYJ9",
  ],
} as const;
