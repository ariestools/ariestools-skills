# Aries Tools skills agent guidance

`ariestools-skills` is the source of truth for the Aries Tools agent skills. It holds seven skills under [skills/](skills/) (`xy-development`, `xy-toolchain`, `ariestools-sdk`, `ariestools-sdk-react`, `ariestools-actor`, `xy-agent` and `xy-product-plan`), the marketplace pipeline under [scripts/marketplace-sync/](scripts/marketplace-sync/), and a zero-dependency validator. Skills.sh installs straight from this repo; release automation renders the Claude and Codex marketplace mirrors from it. There is no application code and no product scaffold here: XL1/XYO domain skills live in [XYOracleNetwork/xyo-skills](https://github.com/XYOracleNetwork/xyo-skills). This file is the entry point for every agent session; read it in full before acting.

One rule governs the rest: **change a skill only under `skills/` in this repository, and only with facts you have checked against the source it describes.** Every other copy (the marketplace mirrors, Skills.sh installs, the redirect stubs in xyo-skills) is generated or downstream, so a fix made there is lost or forks the skill.

## Orient before acting

1. This file.
2. The `SKILL.md` router of the skill you are changing, then only the sub-files it routes to for your task. Where a router names the toolchain, SDK or kit versions its content was verified against, check new claims against those versions.
3. [DEVELOPMENT.md](DEVELOPMENT.md) when the task involves local plugin previews, releases or branching.
4. The newest audit under [docs/evidence/](docs/evidence/) only when the task cites audit findings. It is dated: check a claim against `git log` and the source repos before acting on it.

Then read only the authority for the task in hand, from the table below. Do not read every skill end to end to make a scoped change.

## Authority: which document wins

| When the task touches | Authority | Status of that authority |
| --- | --- | --- |
| Skill content, triggers or frontmatter | [skills/](skills/), one `SKILL.md` router plus sub-files per skill | Source of truth. The only editable copy of the seven skills |
| Facts about the `xy` CLI, the SDK, sdk-react or the actor and host kits | The source of the `toolchain`, `sdk-js`, `sdk-react`, `actor-kit`, `cli-kit` and `browser-kit` repositories in the `ariestools` GitHub organization, at the version the skill names; npm for published versions, peers and deprecations | Ground truth. A skill that disagrees with the source is the defect. Their READMEs can lag the code |
| Marketplace listing text and manifests | [metadata.json](scripts/marketplace-sync/metadata.json) and the renderers beside it | Source of truth for both mirrors. Its `version` belongs to release-please |
| What CI rejects in a skill | [validate-skills.mjs](scripts/validate-skills.mjs) | Normative. CI runs it on pull requests and on pushes to `main` and `develop`, and with `--upstream` on pull requests into `main` |
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
| 3 | [ariestools-sdk-react](skills/ariestools-sdk-react/SKILL.md) | `@ariestools/sdk-react*` (the sdk-react monorepo): umbrella and subpaths, focused packages, peer matrix, import rule and context identity, house patterns, migration from `@xylabs/react-*` |
| 3 | [ariestools-actor](skills/ariestools-actor/SKILL.md) | actor-kit (`@ariestools/actor`, `actor-engine`, `provider`, …), the cli-kit and browser-kit host kits, migration from `actor-system` and the retired `actor-cli` |
| 2 | [xy-toolchain](skills/xy-toolchain/SKILL.md) | `@ariestools/toolchain` (`xy`, experimental `xyex`), configs, Vitest, deplint, policy, `xy work`, `xy agent` |
| 1 | [xy-development](skills/xy-development/SKILL.md) | TypeScript, Git, testing principles, workflow, Definition of Done |
| — | [xy-agent](skills/xy-agent/SKILL.md) | Cross-cutting: AGENTS.md entry point, tool adapters, `docs/` and `papers/` lifecycle, documentation audits |
| — | [xy-product-plan](skills/xy-product-plan/SKILL.md) | Cross-cutting: product planning from idea to buildable plan. Discovery, the White, Yellow, Green, Red and Light papers, version pins and amendments, `docs/ROADMAP.md` with the MVP line, per-version PRDs |

Each skill builds on the layers below it. `ariestools-sdk-react` and `ariestools-actor` are Layer-3 siblings of `ariestools-sdk`, never a fourth layer: each builds on `xy-development`, `xy-toolchain` and `ariestools-sdk`, and links between the three are navigation only. A link up a layer (a Related skills entry, or xy-development pointing to xy-toolchain for an `xy` command) is navigation only: the lower skill must stay correct when the higher one is not installed. `xy-agent` builds on `xy-development` and links to `xy-toolchain` for the `xy agent` and `xy work` commands; `xy agent lint` enforces its convention from toolchain 10.1.1, and from 10.1.2 `xy check` runs it only where a root `AGENTS.md` exists or `commands.agentLint` is declared. `xy-product-plan` is tool-independent: it builds on `xy-development` and `xy-agent`, and its toolchain support lives in the xy-toolchain skill (`plan.md`), so the process stays correct without the toolchain. Inside skill text, name skills ("the xy-toolchain skill") instead of layer numbers. The "Layer 1/2/3" tiers of the Definition of Done in `xy-development/workflow.md` are a different scheme that xyo-skills depends on; keep their names.

## Commands you will actually need

| Command | Use |
| --- | --- |
| `pnpm validate:skills` | The skill gate CI runs: directory names, no symlinks, frontmatter, descriptions (error over 1024 characters, warning over 900), every relative link and `#anchor` under `skills/`, the public anchors below, and that every mention of a verified version (`metadata.verified-toolchain`) in `skills/` and this file matches it. Excludes rendering |
| `pnpm validate:upstream` | The same, plus each verified version must equal its package's npm `latest` (network). CI runs it on pull requests into `main`, so a release waits for a re-verification whenever the toolchain has published since |
| `pnpm sync:claude --out .preview/claude && jq empty .preview/claude/.claude-plugin/*.json` | Render the Claude marketplace tree and check its JSON parses |
| `pnpm sync:codex --out .preview/codex && jq empty .preview/codex/.agents/plugins/marketplace.json .preview/codex/plugins/ariestools-skills/.codex-plugin/plugin.json` | Render the Codex tree and check its JSON parses |
| `claude --plugin-dir .preview/claude` | Load the rendered plugin in a local Claude Code session |
| `npx -p @ariestools/toolchain@10.1.5 xy agent lint` | Check this file, `CLAUDE.md` and `docs/` against the xy-agent convention. This repo has no toolchain dependency, so nothing runs it automatically |

The scripts are plain Node with no dependencies, so there is nothing to install. Three traps bite repeatedly:

- `jq empty` only proves the JSON parses. CI's `validate-plugins.yml` also checks required manifest fields and that every skill directory reached the rendered tree.
- The renderers copy the whole `skills/` tree. A scratch file left in a skill directory ships to both marketplaces.
- Adding or renaming a skill touches more than `skills/`: `release-please-config.json` `extra-files`, the `test -d` list in `validate-plugins.yml`, the layer tables in [README.md](README.md) and this file, ownership and layout in [DEVELOPMENT.md](DEVELOPMENT.md), and the description, keywords and prompts in `metadata.json`.

## Public paths and anchors

Other skills and the installed xyo-skills pack deep-link these, and those links resolve against this repo's files. Keep the file names and heading text. `validate-skills.mjs` fails when one stops resolving (`PUBLIC_ANCHORS`). To change one, migrate the links that use it first, then update the list.

- `xy-development/workflow.md`: `#definition-of-done`, `#applying-the-definition-of-done`, `#writing-project-specific-acceptance-criteria`
- `xy-toolchain/commands.md`: `#clean`, `#skills-and-work-tracking`
- `xy-toolchain/project-profiles.md`: `#package-roles-and-dependency-policy`
- `xy-toolchain/testing.md`: the file name and `#full-app-playwright-e2e`

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

CI: `validate-plugins.yml` (render both trees, manifest and tree checks, `validate-skills.mjs`, plus `--upstream` on pull requests into `main`), `validate-skills.yml` (`validate-skills.mjs` on PRs that touch `skills/`), `lint-pr-title.yml`, `release-please.yml`, `sync-main-to-develop.yml`.

## Failures: what NOT to do

- Do not edit the marketplace mirrors or commit `.preview/`. Release automation writes the mirrors; a manual change is overwritten on the next release.
- Do not hand-edit versions: `version.txt`, `.release-please-manifest.json`, the `version` in `metadata.json`, `CHANGELOG.md`, or a `metadata.version` line or `# x-release-please-version` marker in a `SKILL.md`.
- Do not change a skill's frontmatter `name`. Installs, lockfiles and cross-skill links key on it.
- Do not restore full copies of the base skills in xyo-skills. It keeps redirect stubs for `xy-development` and `xy-toolchain` only; do not add stubs for `xy-agent`, `xy-product-plan`, `ariestools-sdk`, `ariestools-sdk-react` or `ariestools-actor`.
- Do not rename a public file or heading without migrating its links first (see above).
- Do not force-push or rewrite history on `main` or `develop`, and never squash `develop` → `main` or the `main` → `develop` sync: squashing breaks the ancestry between the two branches and they drift apart.
- Do not run `npx skills add … --all`, or target the OpenClaw agent, from inside this checkout. OpenClaw's project skills directory is `skills/`, and Skills.sh deletes an existing `skills/<name>` before linking, replacing the source with a symlink.
- Do not put symlinks under `skills/`; the validator rejects them and the renderers would copy them.
- Do not write audit references, finding ids, dates or absolute paths into skill text, and do not link from a skill to anything outside `skills/`; installed copies cannot resolve it.
- Do not bump `metadata.verified-toolchain`, or the prose and `npx` pin that repeat it, without re-verifying the skills against that version's source. Add its row to the xy-toolchain Version notes when it changes anything the skills describe.
