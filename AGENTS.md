# Aries Tools skills agent guidance

`ariestools-skills` is the source of truth for the Aries Tools agent skills. It holds four skills under [skills/](skills/) (`xy-development`, `xy-toolchain`, `ariestools-sdk` and `xy-agent`), the marketplace pipeline under [scripts/marketplace-sync/](scripts/marketplace-sync/), and a zero-dependency validator. Skills.sh installs straight from this repo; release automation renders the Claude and Codex marketplace mirrors from it. There is no application code and no product scaffold here: XL1/XYO domain skills live in [XYOracleNetwork/xyo-skills](https://github.com/XYOracleNetwork/xyo-skills). This file is the entry point for every agent session; read it in full before acting.

One rule governs the rest: **change a skill only under `skills/` in this repository, and only with facts you have checked against the source it describes.** Every other copy (the marketplace mirrors, Skills.sh installs, the redirect stubs in xyo-skills) is generated or downstream, so a fix made there is lost or forks the skill.

## Orient before acting

1. This file.
2. The `SKILL.md` router of the skill you are changing, then only the sub-files it routes to for your task. Where a router names the toolchain or SDK version its content was verified against, check new claims against that version.
3. [DEVELOPMENT.md](DEVELOPMENT.md) when the task involves local plugin previews, releases or branching.
4. The newest audit under [docs/evidence/](docs/evidence/) only when the task cites audit findings. It is dated: check a claim against `git log` and the source repos before acting on it.

Then read only the authority for the task in hand, from the table below. Do not read every skill end to end to make a scoped change.

## Authority: which document wins

| When the task touches | Authority | Status of that authority |
| --- | --- | --- |
| Skill content, triggers or frontmatter | [skills/](skills/), one `SKILL.md` router plus sub-files per skill | Source of truth. The only editable copy of the four skills |
| Facts about the `xy` CLI or the SDK | The `ariestools/toolchain` and `ariestools/sdk-js` source, at the version the skill names | Ground truth. A skill that disagrees with the source is the defect |
| Marketplace listing text and manifests | [metadata.json](scripts/marketplace-sync/metadata.json) and the renderers beside it | Source of truth for both mirrors. Its `version` belongs to release-please |
| What CI rejects in a skill | [validate-skills.mjs](scripts/validate-skills.mjs) | Normative. CI runs it on pull requests and on pushes to `main` and `develop` |
| Install instructions and the human overview | [README.md](README.md) | Reference, not policy. This file wins where they differ |
| Previews, releases and branching | [DEVELOPMENT.md](DEVELOPMENT.md) | Reference. This file wins where they differ |
| Past audits of the skills | [docs/evidence/](docs/evidence/), superseded runs in [docs/archive/](docs/archive/) | Dated records of what was true at a named commit. Cite them; never edit one to match new content |
| Mirrors and stubs elsewhere | `ariestools-claude-plugin`, `ariestools-codex-plugin` and the xyo-skills stubs | Generated or downstream. Never authoritative, never edited by hand |

## Repository map

| Path | What it holds | Handling |
| --- | --- | --- |
| `skills/<name>/` | One directory per skill: a `SKILL.md` router and its sub-files | Edit here only. Directory name equals frontmatter `name`. No symlinks. Everything in it ships |
| [scripts/marketplace-sync/](scripts/marketplace-sync/) | `metadata.json`, `build-claude.mjs`, `build-codex.mjs`, `lib.mjs` | Change listing text in `metadata.json`, never in a mirror |
| [scripts/validate-skills.mjs](scripts/validate-skills.mjs) | The skill validator | Keep it zero-dependency; CI runs it with plain `node` |
| [assets/](assets/) | Logo and icon copied into both plugins | Referenced by `metadata.json` |
| [.github/workflows/](.github/workflows/) | Validation, PR-title lint, release and sync jobs | A new skill needs a line in `validate-plugins.yml` |
| [docs/](docs/) | Dated audit evidence and its archive | Evidence is immutable; a new run is a new file. `docs/README.md` is a generated index (`xy agent index`), never hand-written |
| [CHANGELOG.md](CHANGELOG.md), [version.txt](version.txt), [.release-please-manifest.json](.release-please-manifest.json), [release-please-config.json](release-please-config.json) | Release state and config | Owned by release-please. A new skill's `SKILL.md` goes in `extra-files` |
| `.preview/` | Local render output | Generated and gitignored. Never commit it |
| [CLAUDE.md](CLAUDE.md) | Claude Code adapter | Only `@AGENTS.md`. Write guidance here, not there |

## Skill layers

| Skill layer | Skill | Covers |
| --- | --- | --- |
| 3 | [ariestools-sdk](skills/ariestools-sdk/SKILL.md) | `@ariestools/sdk` (the sdk-js monorepo): umbrella modules, specialist packages, fetch, import conventions |
| 2 | [xy-toolchain](skills/xy-toolchain/SKILL.md) | `@ariestools/toolchain` (`xy`, experimental `xyex`), configs, Vitest, deplint, policy, `xy work`, `xy agent` |
| 1 | [xy-development](skills/xy-development/SKILL.md) | TypeScript, Git, testing principles, workflow, Definition of Done |
| — | [xy-agent](skills/xy-agent/SKILL.md) | Cross-cutting: AGENTS.md entry point, tool adapters, `docs/` and `papers/` lifecycle, documentation audits |

Each skill builds on the layers below it. A link up a layer (a Related skills entry, or xy-development pointing to xy-toolchain for an `xy` command) is navigation only: the lower skill must stay correct when the higher one is not installed. `xy-agent` builds on `xy-development` and links to `xy-toolchain` for the `xy agent` and `xy work` commands; `xy check` enforces its convention through `xy agent lint` from toolchain 10.1.1. Inside skill text, name skills ("the xy-toolchain skill") instead of layer numbers. The "Layer 1/2/3" tiers of the Definition of Done in `xy-development/workflow.md` are a different scheme that xyo-skills depends on; keep their names.

## Commands you will actually need

| Command | Use |
| --- | --- |
| `pnpm validate:skills` | The skill gate CI runs: directory names, no symlinks, frontmatter, descriptions (error over 1024 characters, warning over 900), every relative link and `#anchor` under `skills/`, and the public anchors below. Excludes rendering |
| `pnpm sync:claude --out .preview/claude && jq empty .preview/claude/.claude-plugin/*.json` | Render the Claude marketplace tree and check its JSON parses |
| `pnpm sync:codex --out .preview/codex && jq empty .preview/codex/.agents/plugins/marketplace.json .preview/codex/plugins/ariestools-skills/.codex-plugin/plugin.json` | Render the Codex tree and check its JSON parses |
| `claude --plugin-dir .preview/claude` | Load the rendered plugin in a local Claude Code session |
| `npx -p @ariestools/toolchain@10.1.1 xy agent lint` | Check this file, `CLAUDE.md` and `docs/` against the xy-agent convention. This repo has no toolchain dependency, so nothing runs it automatically |

The scripts are plain Node with no dependencies, so there is nothing to install. Three traps bite repeatedly:

- `jq empty` only proves the JSON parses. CI's `validate-plugins.yml` also checks required manifest fields and that every skill directory reached the rendered tree.
- The renderers copy the whole `skills/` tree. A scratch file left in a skill directory ships to both marketplaces.
- Adding or renaming a skill touches more than `skills/`: `release-please-config.json` `extra-files`, the `test -d` list in `validate-plugins.yml`, the layer tables in [README.md](README.md) and this file, ownership and layout in [DEVELOPMENT.md](DEVELOPMENT.md), and the description, keywords and prompts in `metadata.json`.

## Public paths and anchors

Other skills and the installed xyo-skills pack deep-link these, and those links resolve against this repo's files. Keep the file names and heading text. `validate-skills.mjs` fails when one stops resolving (`PUBLIC_ANCHORS`). To change one, migrate the links that use it first, then update the list.

- `xy-development/workflow.md`: `#definition-of-done`, `#applying-the-definition-of-done`, `#writing-project-specific-acceptance-criteria`
- `xy-toolchain/commands.md`: `#clean`, `#skills-and-work-tracking`
- `xy-toolchain/project-profiles.md`: `#package-roles-and-dependency-policy`
- `xy-toolchain/testing.md`: the file name

## Development and releases

- **Package manager:** pnpm 10 with Node >= 24, both pinned through Volta in `package.json`.
- **Branching:** Gitflow. `develop` is the integration branch; `main` receives releases.
- **Commits and PR titles:** conventional (`feat:`, `fix:`, `docs:`, `chore:`). PRs into `main` must be titled `feat:` or `fix:`.
- **Releases:** release-please runs on every push to `main`, bumps the version (`always-bump-patch`) in `version.txt`, `metadata.json` and each `SKILL.md`, then the `sync-marketplaces` job renders and pushes both mirrors. Secrets: `RELEASE_PLEASE_TOKEN`, `MARKETPLACE_SYNC_TOKEN`.

| PR type | Merge method |
| --- | --- |
| Feature or fix branch → `develop` | Squash |
| `develop` → `main` | **Merge commit** |
| release-please → `main` | Squash |
| `main` → `develop` sync | Merge commit (automated) |

CI: `validate-plugins.yml` (render both trees, manifest and tree checks, `validate-skills.mjs`), `validate-skills.yml` (`validate-skills.mjs` on PRs that touch `skills/`), `lint-pr-title.yml`, `release-please.yml`, `sync-main-to-develop.yml`.

## Failures: what NOT to do

- Do not edit the marketplace mirrors or commit `.preview/`. Release automation writes the mirrors; a manual change is overwritten on the next release.
- Do not hand-edit versions: `version.txt`, `.release-please-manifest.json`, the `version` in `metadata.json`, `CHANGELOG.md`, or a `metadata.version` line or `# x-release-please-version` marker in a `SKILL.md`.
- Do not change a skill's frontmatter `name`. Installs, lockfiles and cross-skill links key on it.
- Do not restore full copies of the base skills in xyo-skills. It keeps redirect stubs for `xy-development` and `xy-toolchain` only; do not add stubs for `xy-agent` or `ariestools-sdk`.
- Do not rename a public file or heading without migrating its links first (see above).
- Do not force-push or rewrite history on `main` or `develop`, and never squash `develop` → `main` or the `main` → `develop` sync: squashing breaks the ancestry between the two branches and they drift apart.
- Do not run `npx skills add … --all`, or target the OpenClaw agent, from inside this checkout. OpenClaw's project skills directory is `skills/`, and Skills.sh deletes an existing `skills/<name>` before linking, replacing the source with a symlink.
- Do not put symlinks under `skills/`; the validator rejects them and the renderers would copy them.
- Do not write audit references, finding ids, dates or absolute paths into skill text, and do not link from a skill to anything outside `skills/`; installed copies cannot resolve it.
