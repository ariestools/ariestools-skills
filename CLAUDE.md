# CLAUDE.md

Guidance for AI coding agents working in this repository.

## Purpose

1. **Skill source of truth** — Aries Tools agent skills (`skills/`), installed by Skills.sh and mirrored to Claude/Codex marketplaces.
2. **No application scaffold** — product scaffolds (e.g. XL1) live in other skill packs such as `xyo-skills`.

## Distribution Model

- **`ariestools/ariestools-skills`** (this repo) — source of truth; Skills.sh installs from here.
- **`ariestools/ariestools-claude-plugin`** — Claude marketplace mirror (release automation only).
- **`ariestools/ariestools-codex-plugin`** — Codex marketplace mirror (release automation only).

Pipeline under `scripts/marketplace-sync/`:

- `metadata.json` — marketplace-agnostic plugin metadata
- `build-claude.mjs` / `build-codex.mjs` — renderers
- `lib.mjs` — shared plumbing

```shell
pnpm sync:claude --out .preview/claude
pnpm sync:codex  --out .preview/codex
```

## Skill layers

```
Layer 3: ariestools-sdk/   — @ariestools/sdk umbrella + specialist packages
Layer 2: xy-toolchain/     — @ariestools/toolchain, configs, Vitest, deplint, policy
Layer 1: xy-development/   — TypeScript, Git, testing principles, workflow
```

This repo is the **only** editable source for those three skills. `XYOracleNetwork/xyo-skills` may keep redirect stubs under the base skill names — do not restore full docs there.

## Development

- **Package manager:** pnpm (Node >= 24; Volta pins in `package.json`)
- **Branching:** Gitflow; `develop` is the integration branch
- **Never rewrite git history** on shared branches (no force-push to `main`/`develop`)

### Merge methods

| PR type | Merge method |
|---|---|
| `feature/*` → `develop` | Squash |
| `develop` → `main` | **Merge commit** |
| release-please → `main` | Squash |
| `main` → `develop` sync | Merge commit (automated) |

### Releases

Release-please on push to `main`. Secrets: `RELEASE_PLEASE_TOKEN`, `MARKETPLACE_SYNC_TOKEN`. Do not bump versions by hand.

### CI

- `validate-plugins.yml` — render + structural checks + skill frontmatter
- `validate-skills.yml` — skill frontmatter on skill-path PRs
- `lint-pr-title.yml` — conventional titles
- `release-please.yml` — release + marketplace sync
- `sync-main-to-develop.yml` — post-release alignment

### Local checks

```shell
pnpm validate:skills
pnpm sync:claude --out .preview/claude && jq empty .preview/claude/.claude-plugin/*.json
pnpm sync:codex  --out .preview/codex  && jq empty .preview/codex/plugins/ariestools-skills/.codex-plugin/plugin.json
```
