# Development

Contributor guide for `ariestools-skills` — editing skill files locally and shipping releases. Install instructions are in the [README](./README.md).

## Distribution Model

This repo is the **source of truth** for the skills (`skills/`) and marketplace metadata (`scripts/marketplace-sync/metadata.json`). On release, automation renders marketplace-shaped trees into two mirror repos:

| Audience | Install target |
| --- | --- |
| [Skills.sh](https://skills.sh) | `ariestools/ariestools-skills` (this repo) |
| Claude Code marketplace | `ariestools/ariestools-claude-plugin` |
| Codex marketplace | `ariestools/ariestools-codex-plugin` |

Render scripts live under `scripts/marketplace-sync/`. See [AGENTS.md](./AGENTS.md) for the full picture: authority, repository map, public anchors and what not to do.

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
pnpm validate:upstream   # network; also checks verified versions against npm latest
pnpm sync:claude --out .preview/claude && jq empty .preview/claude/.claude-plugin/*.json
pnpm sync:codex  --out .preview/codex  && jq empty .preview/codex/.agents/plugins/marketplace.json .preview/codex/plugins/ariestools-skills/.codex-plugin/plugin.json
```

`pnpm validate:skills` runs `scripts/validate-skills.mjs`, the same zero-dependency check CI runs. It checks skill directory names, rejects symlinks, and validates frontmatter (`name` matches the directory; `description` fails above 1024 characters and warns above 900). It also resolves every relative Markdown link and `#anchor` under `skills/` using GitHub's heading slugs, ignoring code blocks, inline code and HTML comments. It checks the public anchors in `PUBLIC_ANCHORS`, which other skill packs deep-link; keep those headings and file names stable. Finally it checks verified versions: `metadata.verified-toolchain` in `skills/xy-toolchain/SKILL.md` is the one place the verified toolchain version is set, and every "verified against `@ariestools/toolchain` X.Y.Z" or `@ariestools/toolchain@X.Y.Z` under `skills/` and in `AGENTS.md` must match it. `pnpm validate:upstream` also requires it to equal npm `latest`; CI runs that on pull requests into `main`, so when the toolchain publishes, the next release waits until the skills are re-verified and the version is bumped everywhere. To pin another package the same way, add its metadata key to `VERIFIED_PACKAGES` in the script.

## Ownership

- **`xy-development` / `xy-toolchain` / `ariestools-sdk` / `ariestools-sdk-react` / `ariestools-actor` / `xy-agent`** — edit only in this repo.
- **`xyo-knowledge` / `xl1-*`** — edit in [XYOracleNetwork/xyo-skills](https://github.com/XYOracleNetwork/xyo-skills).
- Reject PRs that reintroduce full body copies of the base skills into `xyo-skills`; that pack keeps temporary redirect stubs for `xy-development` and `xy-toolchain` only.
- Adding a skill also means adding its `SKILL.md` to `extra-files` in `release-please-config.json`, a `test -d` line in `.github/workflows/validate-plugins.yml`, and an entry in the layer tables (README.md, AGENTS.md) and `scripts/marketplace-sync/metadata.json`.

## Skill layout

```
skills/
├── xy-development/        Layer 1 — TypeScript, Git, testing, workflow
│   ├── SKILL.md
│   └── …
├── xy-toolchain/          Layer 2 — @ariestools/toolchain (xy CLI), configs, policy
│   ├── SKILL.md
│   └── …
├── ariestools-sdk/        Layer 3 — @ariestools/sdk
│   ├── SKILL.md
│   └── …
├── ariestools-sdk-react/  Layer 3, sibling of ariestools-sdk — @ariestools/sdk-react*
│   ├── SKILL.md
│   └── …
├── ariestools-actor/      Layer 3, sibling of ariestools-sdk — actor-kit, cli-kit, browser-kit
│   ├── SKILL.md
│   └── …
└── xy-agent/              cross-cutting — AGENTS.md, adapters, docs/ and papers/
    ├── SKILL.md
    └── …
```

Each `SKILL.md` is a router; detail lives in its sibling sub-files. Relative links may cross skills (`../xy-toolchain/commands.md#clean`) but never leave `skills/`, because installed copies cannot resolve anything outside it.

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
