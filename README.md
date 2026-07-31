# Aries Tools Skills

Agent skills for Aries Tools TypeScript development. The same skill content is published to agent skill marketplaces and to [Skills.sh](https://skills.sh).

## What's Included

Two skill layers:

| Layer | Skill | Covers |
|-------|-------|--------|
| 2 | `xy-toolchain` | `@ariestools/toolchain` (`xy` CLI), project profiles, ESLint flat configs, TypeScript configs, `@ariestools/vitest-config`, `@ariestools/lib-neutral`, deplint, repository policy |
| 1 | `xy-development` | TypeScript conventions, Git workflow, testing principles, definition of done |

Skills use progressive loading — each `SKILL.md` is a lightweight router that directs the agent to read sub-files on demand.

For XL1 / XYO protocol product skills (chain, patterns, scaffold, etc.), use the sibling stack at [XYOracleNetwork/xyo-skills](https://github.com/XYOracleNetwork/xyo-skills). Those skills depend on this toolchain layer.

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
# Per-project
npx skills add ariestools/ariestools-skills --all

# Global
npx skills add ariestools/ariestools-skills --all -g
```

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

For local development, editing skills, and the release process, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## License

[LGPL-3.0-only](LICENSE)
