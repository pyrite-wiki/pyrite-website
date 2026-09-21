---
title: Deploy
description: Run your own Pyrite instance on any VPS with Docker and Caddy.
order: 3
section: get-started
---

## Self-host on a VPS

Run your own Pyrite instance on any VPS ($6/month, unlimited users, you own your data):

```bash
git clone https://github.com/pyrite-wiki/pyrite.git && cd pyrite
bash deploy/selfhost/setup.sh kb.example.com
```

This installs Docker, starts Pyrite + Caddy (auto TLS), and seeds the Pyrite KB so you have content to explore immediately.

### Create your admin user

```bash
docker compose -f deploy/selfhost/docker-compose.yml exec pyrite \
  python /app/deploy/selfhost/create-user.py admin yourpassword
```

First user always gets admin role. Add more users with the same command (add `--admin` for admin role).

### Update to latest

```bash
bash ~/pyrite/deploy/selfhost/update.sh
```

## Local development

For local use without TLS:

```bash
docker compose up -d
# Visit http://localhost:8088
```

## Configuration

All settings are configurable via environment variables — no config file editing needed:

| Variable | Purpose | Default |
|----------|---------|---------|
| `PYRITE_AUTH_ENABLED` | Enable authentication | `false` |
| `PYRITE_AUTH_ANONYMOUS_TIER` | Anonymous access level | `none` |
| `PYRITE_AUTH_ALLOW_REGISTRATION` | Allow self-registration | `true` |
| `PYRITE_CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
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
