/**
 * Current Pyrite release, plus the figures the site quotes about the project.
 *
 * Update this file as part of cutting a release — it is the only place the
 * site states a version or a count, so bumping it here updates every page.
 *
 * Verify the counts against the source, not the README:
 *   mcpTools  -> pyrite/server/tool_schemas.py (READ_TOOLS + WRITE_TOOLS + ADMIN_TOOLS)
 *   extensionPoints -> public methods on PyritePlugin in pyrite/plugins/protocol.py
 *   extensions -> directories in extensions/
 */
export const release = {
  version: "0.24.1",
  date: "2026-09-17",
  url: "https://github.com/markramm/pyrite/releases/tag/v0.24.1",
  /** Set true when a release carries fixes users should upgrade for. */
  security: true,
  securityNote:
    "Fixes a GitHub token disclosure, git argument injection, unguarded mutating routes, stored XSS, and path traversal. If you run pyrite-server with a GitHub token configured, or expose it to more than one user, upgrade.",
} as const;

export const counts = {
  mcpTools: 48,
  mcpRead: 29,
  mcpWrite: 11,
  mcpAdmin: 8,
  extensions: 6,
  extensionPoints: 19,
  entryTypes: 11,
} as const;
