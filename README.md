# Aries Tools Skills

Agent skills for Aries Tools TypeScript development. The same skill content is published to agent skill marketplaces and to [Skills.sh](https://skills.sh).

## What's Included

Four skills: three layers and one cross-cutting companion.

| Skill layer | Skill | Covers |
|-------|-------|--------|
| 3 | `ariestools-sdk` | `@ariestools/sdk` umbrella modules, specialist packages (`express`, `storage-adapters`, `threads`, `testing`, `telemetry`, …), fetch/HTTP patterns, import conventions |
| 2 | `xy-toolchain` | `@ariestools/toolchain` (`xy` CLI and experimental `xyex`), project profiles, ESLint flat configs, TypeScript configs, `@ariestools/vitest-config`, `@ariestools/lib-neutral`, deplint, repository policy, `xy work`, `xy agent` |
| 1 | `xy-development` | TypeScript conventions, Git workflow, testing principles, definition of done |
| — | `xy-agent` | `AGENTS.md` entry point, per-tool adapters, `docs/` and `papers/` lifecycle, documentation audits; builds on Layer 1; checked by `xy agent lint` (toolchain ≥ 10.1.1), which `xy check` runs where a root `AGENTS.md` exists or `commands.agentLint` is declared (every repository on 10.1.1) |

Each layer builds on the ones below it; links up a layer are navigation only. `xy-agent` builds on Layer 1 and points to Layer 2 for the `xy agent` and `xy work` commands.

Skills use progressive loading — each `SKILL.md` is a lightweight router that directs the agent to read sub-files on demand.

For XL1 / XYO protocol product skills (chain, patterns, scaffold, etc.), use the sibling stack at [XYOracleNetwork/xyo-skills](https://github.com/XYOracleNetwork/xyo-skills). Those skills depend on Layers 1–3 here, so the full stack reads:

```
this repo    xy-development (+ xy-agent) → xy-toolchain → ariestools-sdk
xyo-skills   → xyo-knowledge → xl1-*
```

**All four skills are owned only here.** `xyo-skills` may still ship redirect stubs for `xy-development` and `xy-toolchain`; do not expand them — change this repo, release, and let `xy skills` / Skills.sh pull the update.

## How These Work in Multiple Places

Agent skills are Markdown files with YAML frontmatter (`name`, `description`). This repo is the source of truth; marketplace install URLs point at rendered mirrors:

| Install via | Repo to point at | Notes |
| --- | --- | --- |
| Claude Code marketplace | `ariestools/ariestools-claude-plugin` | Mirror — written by release automation. |
| Codex marketplace | `ariestools/ariestools-codex-plugin` | Mirror — written by release automation. |
| Skills.sh | `ariestools/ariestools-skills` | Source of truth. |

## Install

### Skills.sh

```shell
# Per-project: every skill, for the agents detected in this project
npx skills add ariestools/ariestools-skills --skill '*' -y

# Global (user-level)
npx skills add ariestools/ariestools-skills --skill '*' -g -y

# Only the agents you name
npx skills add ariestools/ariestools-skills --skill '*' -a claude-code codex -y
```

Avoid `--all`. It is shorthand for `--skill '*' --agent '*' -y`, so it installs into every agent Skills.sh supports, not only the ones you use. Without `-a`, Skills.sh targets the agents it detects and falls back to all agents only when it detects none; name the agents with `-a` to be sure. To install a subset, list the skills instead of `'*'`, for example `--skill xy-development xy-toolchain`.

Update later with `npx skills update`.

### Claude Code marketplace

```shell
/plugin marketplace add ariestools/ariestools-claude-plugin
/plugin install ariestools-skills
```

### OpenAI Codex marketplace

```shell
codex plugin marketplace add ariestools/ariestools-codex-plugin --ref main
codex plugin add ariestools-skills@ariestools-skills
```

## Contributing

For local development, editing skills, and the release process, see [DEVELOPMENT.md](./DEVELOPMENT.md). Agents working in this repository start at [AGENTS.md](./AGENTS.md).

## License

[LGPL-3.0-only](LICENSE)
