# Development

Contributor guide for `ariestools-skills` — editing skill files locally and shipping releases. Install instructions are in the [README](./README.md).

## Distribution Model

This repo is the **source of truth** for the skills (`skills/`) and marketplace metadata (`scripts/marketplace-sync/metadata.json`). On release, automation renders marketplace-shaped trees into two mirror repos:

| Audience | Install target |
| --- | --- |
| [Skills.sh](https://skills.sh) | `ariestools/ariestools-skills` (this repo) |
| Claude Code marketplace | `ariestools/ariestools-claude-plugin` |
| Codex marketplace | `ariestools/ariestools-codex-plugin` |

Render scripts live under `scripts/marketplace-sync/`. See [CLAUDE.md](./CLAUDE.md) for the full picture.

## Developing Skills Locally

```shell
pnpm sync:claude --out .preview/claude
pnpm sync:codex  --out .preview/codex
```

`.preview/` is gitignored.

### Claude Code

```shell
pnpm sync:claude --out .preview/claude
claude --plugin-dir .preview/claude
```

### Codex

```shell
pnpm sync:codex --out .preview/codex
codex plugin marketplace add /absolute/path/to/ariestools-skills/.preview/codex
codex plugin add ariestools-skills@ariestools-skills
```

### Validation

```shell
pnpm validate:skills
pnpm sync:claude --out .preview/claude && jq empty .preview/claude/.claude-plugin/*.json
pnpm sync:codex  --out .preview/codex  && jq empty .preview/codex/.agents/plugins/marketplace.json .preview/codex/plugins/ariestools-skills/.codex-plugin/plugin.json
```

## Ownership

- **`xy-development` / `xy-toolchain` / `ariestools-sdk`** — edit only in this repo.
- **`xyo-knowledge` / `xl1-*`** — edit in [XYOracleNetwork/xyo-skills](https://github.com/XYOracleNetwork/xyo-skills).
- Reject PRs that reintroduce full body copies of the base skills into `xyo-skills`; that pack keeps temporary redirect stubs only.

## Skill layout

```
skills/
├── xy-development/
│   ├── SKILL.md
│   └── …
├── xy-toolchain/
│   ├── SKILL.md
│   └── …
└── ariestools-sdk/
    ├── SKILL.md
    └── …
```

## Releases

Versioning is automated by [release-please](https://github.com/googleapis/release-please) on Gitflow:

1. Use [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, …). Versioning is `always-bump-patch`; the prefix mainly drives changelog content.
2. PR `develop` → `main` with a `feat:` or `fix:` title and merge with a **merge commit** (not squash).
3. Release-please opens a Release PR against `main` that bumps `version.txt`, `metadata.json`, skill frontmatter versions, and `CHANGELOG.md`. Merge it (squash is fine for release-please).
4. The `sync-marketplaces` job renders and pushes into `ariestools-claude-plugin` and `ariestools-codex-plugin`.
5. A `main → develop` sync PR is auto-merged with a merge commit.

### Required repository secrets

| Secret | Purpose |
| --- | --- |
| `RELEASE_PLEASE_TOKEN` | Fine-grained PAT so release-please PRs trigger checks and can merge main→develop sync |
| `MARKETPLACE_SYNC_TOKEN` | Token with `contents: write` on the two mirror repos |

Do not hand-edit version fields; release-please owns them after the first release.

## Branching

| PR type | Head | Base | Merge method |
|---|---|---|---|
| Feature/fix | `feature/*` | `develop` | Squash |
| Integration | `develop` | `main` | **Merge commit** |
| Release-please | `release-please--*` | `main` | Squash |
| Post-release sync | `main` | `develop` | Merge commit (automated) |
