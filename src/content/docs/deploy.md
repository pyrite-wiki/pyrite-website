---
title: Deploy
description: Run your own Pyrite instance on any VPS with Docker and Caddy.
order: 3
section: get-started
---

> **Hosting Pyrite for other people is experimental.** Accounts and per-KB
> permissions work, but they are not yet a boundary between people who should
> not see each other's data. Don't put anything on a shared or internet-facing
> instance that you couldn't live with every user of it reading. See
> [What's Supported](/docs/status) and
> [SECURITY.md](https://github.com/pyrite-wiki/pyrite/blob/main/SECURITY.md#multi-user-is-experimental).

## Self-host on a VPS

Run your own Pyrite instance on any VPS ($6/month, you own your data):

```bash
git clone https://github.com/pyrite-wiki/pyrite.git && cd pyrite
bash deploy/selfhost/setup.sh kb.example.com
```

This installs Docker, starts Pyrite + Caddy (auto TLS), and seeds the Pyrite KB so you have content to explore immediately.

### Create your admin user

```bash
docker compose -f deploy/selfhost/docker-compose.yml exec pyrite \
  pyrite-admin user create admin --role admin
```

It prompts for the password. Auth is required and registration is closed by default; add more users with the same command (`--role` is `read`, `write` or `admin`).

### Update to latest

```bash
bash ~/pyrite/deploy/selfhost/update.sh
```

## One-click deploy

Railway, Render and Fly.io all deploy from the included Dockerfile, persist data
at `/data` and expose port 8088. See the
[README](https://github.com/pyrite-wiki/pyrite#one-click-deploy) for the buttons.

They start with accounts turned on, and registration stays closed until an admin
exists. Create yours right after the first deploy, in the container:

```bash
pyrite-admin user create <name> --role admin
```

Railway does not attach a persistent volume from the one-click button: add one
mounted at `/data`, or data will not survive restarts.

## Local development

For local use without TLS:

```bash
docker compose up -d
# Visit http://localhost:8088
```

The compose file publishes on `127.0.0.1` only and runs with no credential, so
only this machine can reach it. To serve anyone else, turn on auth first
(`PYRITE_AUTH_ENABLED=true`), then change the published address.

## Configuration

All settings are configurable via environment variables — no config file editing needed:

| Variable | Purpose | Default |
|----------|---------|---------|
| `PYRITE_AUTH_ENABLED` | Enable authentication | `false` |
| `PYRITE_AUTH_ANONYMOUS_TIER` | What a signed-out visitor may do when auth is on: `read`, `write` or `none` | unset (nothing) |
| `PYRITE_AUTH_ALLOW_REGISTRATION` | Allow self-registration (still closed until an admin exists) | `true` |
| `PYRITE_CORS_ORIGINS` | Allowed CORS origins; add your public origin behind a reverse proxy | localhost dev ports |
| `PYRITE_ALLOWED_HOSTS` | Extra hostnames a credential-free server answers (LAN IP, `*.local`, proxy name) | unset |
| `PYRITE_SEARCH_MODE` | Default search mode | `keyword` |
| `PYRITE_DATA_DIR` | Data storage path | `/data` |

### AI provider keys (optional)

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

Users can also configure AI providers in the Settings UI — those settings take precedence.

### Semantic search

Included in the Docker image by default. Uses local sentence-transformers model (all-MiniLM-L6-v2) — no API key needed.
