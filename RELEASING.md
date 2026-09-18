# Updating the website for a release

The website is part of the release process. Drift here is invisible — the site
keeps rendering happily while stating numbers that stopped being true a release
ago. This checklist exists so that cannot happen quietly.

## 1. Bump `src/data/release.ts`

This is the only file that states a version or a count. Everything on the site
reads from it.

- `version`, `date`, `url` — the new tag.
- `security` — `true` when the release carries fixes users should upgrade for.
  This turns on the homepage banner. Set it back to `false` on the next release
  that does not, or the banner cries wolf.
- `securityNote` — one or two sentences, written for someone deciding whether
  this affects them.

## 2. Re-verify the counts against source, not the README

The README has been wrong before, and so has this site. Check the code:

```bash
# MCP tools per tier
cd ../pyrite
for T in READ_TOOLS WRITE_TOOLS ADMIN_TOOLS; do
  echo -n "$T: "
  awk "/^$T[ :=]/,/^}/" pyrite/server/tool_schemas.py | grep -cE '^    "[a-z_]+"'
done

# Plugin extension points
grep -cE '^    def [a-z]' pyrite/plugins/protocol.py

# Shipped extensions
ls extensions/
```

Update `counts` in `src/data/release.ts` if any changed.

## 3. Check what the release renamed or moved

Renames are what break docs. Read the CHANGELOG's **Changed** section and grep
the site for anything it renamed:

```bash
grep -rn "<old name>" src/
```

Past examples: `task status` → `task get` (CLI only — the MCP tool is still
`task_status`); `get_entry_classes()` → `get_entry_types()`; `get_cli_app()` →
`get_cli_commands()`; the `task` extension became a core entry type.

## 4. Check the install story still works

`src/content/docs/quick-start.md`, `cli.md`, and `components/QuickStart.astro`
all carry install commands.

- There is **no PyPI wheel** — the name is held by a locked pre-2FA account.
  Never write `pip install pyrite`.
- Installs are editable from a checkout: `pip install -e ".[all]"`.
- Extras that exist: `server`, `cli`, `ai`, `semantic`, `postgres`, `dev`,
  `all`. Note `postgres` is **not** in `all`.

## 5. Build

```bash
npm run build
```

Then spot-check `dist/index.html` for the numbers you just changed.
