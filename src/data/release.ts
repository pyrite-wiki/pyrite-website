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
  version: "0.26.3",
  date: "2026-11-16",
  url: "https://github.com/pyrite-wiki/pyrite/releases/tag/v0.26.3",
  /** Set true when a release carries fixes users should upgrade for. */
  security: true,
  securityNote:
    "If you run pyrite serve, upgrade. A request over REST or MCP-over-HTTP now gets only the git credential you configure for it, learns nothing from files outside a KB, sees only text Pyrite wrote for it, and gets exactly the default_role your config.yaml says. Private repositories reached over the network need a git_credentials entry. The local CLI and stdio MCP are unchanged.",
  /** One line for the homepage banner. Keep it short: it sits beside the version. */
  bannerNote: "Security release for anyone running pyrite serve. Network git over a private repository now needs a git_credentials entry.",
  /** The headline for this release, from the 0.26.3 release notes. */
  headline:
    "A network call borrows nothing of the server account, continued (ADR-0052): network git gets only the credential you grant it, reads stay inside the KB, responses carry only Pyrite's own text, and default_role is exactly what config.yaml says.",
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
  /** `pytest --collect-only` at v0.26.3: 26066/26092 collected (collected, not passing). */
  tests: "26,000+",
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
 * Community figures as of 2026-10-23 (after v0.26.0). Measured, not asserted:
 *   mergedPrs/outsidePrs -> `gh pr list --state merged`, dependabot excluded.
 *   contributors -> GitHub's contributor list plus commit authors and
 *     Co-authored-by trailers, with people who commit under two names
 *     counted once. Three co-authors with no mappable GitHub login are not
 *     counted.
 */
export const community = {
  /** People with code in the project, the maintainer included. */
  people: 37,
  outsideContributors: 36,
  /** The release the site last compared against, and its outside contributors. */
  previousVersion: "0.24.3",
  outsideContributorsAtPrevious: 6,
  mergedPrs: 570,
  outsidePrs: 181,
  /** Open PRs on 2026-10-23, and how many of them are from contributors. */
  openPrs: 41,
  openPrsFromContributors: 41,
  /** GitHub logins: merged PRs first (most first), then commit- or co-author-only. */
  contributors: [
    "ANO3457",
    "makiaveli1",
    "sb123sb123",
    "berkay-byte",
    "AbelTomato",
    "nosmile99",
    "AsyncLegs",
    "HarshRajSinghania",
    "Enard52",
    "fatihcvs",
    "hiyouwhatsapp",
    "zhongxiao-chang",
    "DYNOSuprovo",
    "fathirramadhan-web",
    "feliperzk",
    "Gambit-Checkmate",
    "Jah-yee",
    "jinchuntan",
    "KingEmma7",
    "kudala-bharani",
    "masyarakatai",
    "nightcityblade",
    "O1sumitkumar",
    "Plastic-time",
    "pratham8499",
    "premiuslol",
    "Primaverah",
    "rahul05ranjan",
    "ShivanshShukla",
    "Uddoo",
    "xuu33030",
    "YaoSong808",
    "ZhaoYJ9",
    "rupayon123",
    "Saturday-boyi",
    "Voyagerroc-Lab",
  ],
} as const;
