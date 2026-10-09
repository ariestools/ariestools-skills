---
title: "Skills sync audit (complete) 2026-10-08 — index"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Completed audit of all four skills and the pack architecture at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.1 (812b27a91) and @ariestools/sdk 9.0.1 (298fbb5bb); 570 raw findings, all re-verified by two lenses against 10.1.1, merged to 250 open items (31 high); 6 refuted, 5 resolved upstream. Supersedes the partial audit docs/archive/evidence/2026-10-08-skills-sync-audit.md in full."
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit (complete) — index

This audit asks two questions. Do the skills in this repo still match the packages, code and systems they describe? And do the skill layers build on each other ("waterfall") correctly? This page is the entry point. The findings themselves are in one document per skill plus one for architecture. The audit replaces the [partial audit](../archive/evidence/2026-10-08-skills-sync-audit.md) recorded earlier the same day, whose verification was paused.

## What this establishes, and what it does not

**Establishes:** Every open item was found by an auditor agent reading the source. Two independent verifiers then confirmed it: one re-derived the facts from the code, the other checked the skill text and whether the fix is right. Every finding was re-checked against toolchain **10.1.1**, including findings first written against 10.1.0. Verifier corrections to severity, action and recommendation are folded in.

**Does not establish:**

- **That any fix has been applied.** No skill file was changed.
- **That the recommended replacement text works.** Nobody has tested it by having an agent use the revised skill.
- **A priority order or remediation plan.** Severity measures the consequence of following the current text, not the order of work.
- **Anything after the audited commits.** In particular, most consumer repos still run toolchain ≤ 10.1.0. Where a finding depends on 10.1.1 behaviour, such as `xy agent`, it says so.

## Audited sources

| Repository | Commit | Notes |
|---|---|---|
| `ariestools/ariestools-skills` | `7e78933a8` | v0.1.5, the skill text under audit |
| `ariestools/toolchain` | `812b27a91` | Published **10.1.1**. Round 1 was written against `7eb43c3c2` (10.1.0), and everything was re-verified at 10.1.1 |
| `ariestools/sdk-js` | `298fbb5bb` | Published 9.0.1 |
| `ariestools/sdk-react` | `0ebb53397` | Published 12.0.1 |
| `ariestools/actor-kit` | `4ddeceff8` | Published 2.0.0. Working tree had uncommitted changes |
| `ariestools/browser-kit` | `e44f716ee` | Published 2.0.0 |
| `ariestools/cli-kit` | `480ab2738` | Published 2.1.0 |
| `XYOracleNetwork/xyo-skills` | `f53adf7ef` | Downstream consumer, v1.1.38 |

## Method

**Round 1** used 36 read-only agents:

- **25 per-file auditors**, one for each skill file.
- **8 source-side sweeps**, working from the source toward the skills: the CLI and stability catalog, the `xy.config.ts` surface, the config packages, toolchain history, the `@ariestools/sdk` exports, the specialist packages, xy-development conventions against what is enforced, and xy-agent conventions against tooling and practice.
- **3 architecture reviewers**: layering inside the pack, cross-repo distribution, and ecosystem coverage gaps.

**Round 2** ran 9 targeted gap checks. Three were fixed in advance and covered the 10.1.1 surface that shipped during the audit: `xy agent`, `xy skills pick`, and the other 10.1.1 changes. A completeness critic added six more: agent-tool claims, the skills CLI install, toolchain version scope, CI guidance, legacy `xylabs` artifacts, and SDK subpath identity.

**Verification.** Two verifiers checked every batch of up to 12 findings: a code-truth lens and a skill-text lens. A finding survived only if neither refuted it.

**Write-up.** A writing pass merged duplicates within each skill. Each item lists the ids of the raw findings it merges, and those ids refer to the [complete findings JSON](2026-10-08-skills-sync-audit-complete-findings.json), which also holds every verifier note.

## Results

| Document | Raw | Open | 🔴 High | 🟠 Med | ⚪ Low | Remove | Update | Add | Refuted | Resolved upstream |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| [xy-development](2026-10-08-skills-sync-audit-complete-xy-development.md) (L1) | 92 | 44 | 4 | 19 | 21 | 0 | 32 | 12 | 0 | 0 |
| [xy-toolchain](2026-10-08-skills-sync-audit-complete-xy-toolchain.md) (L2) | 167 | 81 | 10 | 37 | 34 | 0 | 48 | 33 | 2 | 0 |
| [ariestools-sdk](2026-10-08-skills-sync-audit-complete-ariestools-sdk.md) (L3) | 102 | 39 | 6 | 12 | 21 | 1 | 25 | 13 | 2 | 0 |
| [xy-agent](2026-10-08-skills-sync-audit-complete-xy-agent.md) | 131 | 42 | 6 | 21 | 15 | 0 | 35 | 7 | 2 | 5 |
| [architecture](2026-10-08-skills-sync-audit-complete-architecture.md) | 78 | 44 | 5 | 28 | 11 | 3 | 34 | 7 | 0 | 0 |
| **Total** | **570** | **250** | **31** | **117** | **102** | **4** | **174** | **72** | **6** | **5** |

**xy-development.** Sound in principle, but it has drifted from the repos it sits above. Four instructions fail when followed in current Aries Tools repos:

- the `any` TODO escape hatch fails lint;
- `pnpm install --resolution-only` fails on pnpm 12;
- `pnpm --filter <pkg> build` fails in XY monorepos;
- an unpinned `pnpm add` pulls TypeScript 7.

Most other items are convention contradictions: `.js` import extensions, return types, Gitflow as the default, and the absolute history-rewrite ban.

**xy-toolchain.** Accurate for the surface it was written against, but behind 9.2.0–10.1.1:

- It never documents the `xy` / `xyex` stability channel, and it presents the experimental `work` and `dead` as stable.
- It misses the new error-level gates, including agent lint in `xy check`.
- It has ten high-severity items, among them TypeScript 7, a `compile` config cascade that does not exist, scoped test runs that skip the preset, missing `pnpm-workspace.yaml` settings, and broken `--strict` CI advice.

**ariestools-sdk.** It routes well, but all of its content predates sdk-js 8.1.8–9.0.1, and six of its defaults break a consumer:

- `zod` is called optional, but the root barrel loads it.
- Subpaths are preferred, yet each subpath bundles its own class identity.
- The fetcher example drops every SDK header.
- `fetchJson` is shown returning the data object.
- It names a nonexistent `EthAddress` export.
- The storage-adapters root barrel needs both backends.

**xy-agent.** It was written as the specification for an `xy agent` command. Toolchain 10.1.1 shipped that command as stable and runs it inside `xy check`. As a result, the skill's own adapter templates, AGENTS.md headings and docs-index example now fail error-level rules, and "recommended, not required" and "no `xy agent` command yet" are false from 10.1.1.

## Does the pack waterfall correctly?

**Inside the pack, yes.** L3 `ariestools-sdk` builds on L2 `xy-toolchain`, which builds on L1 `xy-development`. No lower layer depends on a higher one, and every link and anchor resolves.

**At the seams, no.** Three things break the model:

1. **`xy-agent` has no layer.** Its conventions build on L1, but its commands (`xy work`, `xy agent`) are L2. Since 10.1.1, `xy check` enforces it at error level, yet the toolchain catalog, the marketplace metadata and this repo's docs still describe a three-skill pack. Consumer repos never receive it.
2. **"Layer N" means three things:** the skill stack, the Definition of Done tiers, and the xyo-skills 1–9 numbering.
3. **L3 covers only sdk-js.** sdk-react, actor-kit, browser-kit and cli-kit have no skill and no delivery path.

The [architecture document](2026-10-08-skills-sync-audit-complete-architecture.md#assessment) has the current and proposed layer diagrams. The proposal adds `ariestools-sdk-react` and `ariestools-actor` at L3, makes `xy-agent` a cross-cutting companion to L1 whose commands live in L2, and makes the toolchain catalog list every skill.

## High-severity items

These are the items where following the skill or system as it stands causes a failure, a wrong import or config, or data loss.

| Skill | Target | Action | Issue |
|---|---|---|---|
| xy-development | [`typescript.md`](2026-10-08-skills-sync-audit-complete-xy-development.md#skillsxy-developmenttypescriptmd) | Update | The `any` escape hatch (a TODO comment) fails lint at every tier |
| xy-development | [`workflow.md`](2026-10-08-skills-sync-audit-complete-xy-development.md#skillsxy-developmentworkflowmd) | Update | `pnpm install --resolution-only` fails on pnpm 12, which every Aries Tools library repo pins |
| xy-development | [`workflow.md`](2026-10-08-skills-sync-audit-complete-xy-development.md#skillsxy-developmentworkflowmd) | Update | `pnpm --filter <package> build` fails in XY monorepos |
| xy-development | [`workflow.md`](2026-10-08-skills-sync-audit-complete-xy-development.md#skillsxy-developmentworkflowmd) | Update | "Always `pnpm add` the latest version" now installs TypeScript 7 and breaks XY repos |
| xy-toolchain | [`commands.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaincommandsmd) | Update | The `xy check` row omits agent lint, and `xy check --fix` now rewrites `docs/README.md` and can leave the rerun failing |
| xy-toolchain | [`commands.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaincommandsmd) | Update | "Use `--strict` when warnings must block CI" fails on every fresh CI clone, yet still lets agent-lint and skills-lint warnings through |
| xy-toolchain | [`commands.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaincommandsmd) | Update | The documented `commands.dependabot.rules` key fails to type-check in a typed `XyConfig` |
| xy-toolchain | [`compilation.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaincompilationmd) | Update | Root `compile` config does not cascade into a package that has its own `xy.config.ts` |
| xy-toolchain | [`eslint.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaineslintmd) | Update | A local `no-restricted-imports` block silently replaces the shared barrel and `src/` import bans, including the block `xy lint init` generates |
| xy-toolchain | [`project-profiles.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchainproject-profilesmd) | Add | Single-package pnpm repos without exports or bin are classified `workspace-root`, and the skill never says to set a role |
| xy-toolchain | [`testing.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaintestingmd) | Update | Workspace-scoped test runs skip the root `@ariestools/vitest-config` preset |
| xy-toolchain | [`testing.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaintestingmd) | Add | The browser-realm setup never says to download Chromium, so `xy test` fails on fresh machines and CI runners |
| xy-toolchain | [`toolchain.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaintoolchainmd) | Update | Every pnpm repo needs `pnpm-workspace.yaml` with the release-age and verify settings; the skill says "when needed" |
| xy-toolchain | [`typescript.md`](2026-10-08-skills-sync-audit-complete-xy-toolchain.md#skillsxy-toolchaintypescriptmd) | Update | Unversioned `typescript` installs now pull TypeScript 7, which the toolchain cannot use |
| ariestools-sdk | [`conventions.md`](2026-10-08-skills-sync-audit-complete-ariestools-sdk.md#skillsariestools-sdkconventionsmd) | Update | Import guidance prefers subpaths, but each subpath is a separate bundle whose classes and static state are not the root's |
| ariestools-sdk | [`fetch.md`](2026-10-08-skills-sync-audit-complete-ariestools-sdk.md#skillsariestools-sdkfetchmd) | Update | The auth-wrapping fetcher example spreads a `Headers` instance and silently drops every SDK header, including `Content-Encoding: gzip` |
| ariestools-sdk | [`fetch.md`](2026-10-08-skills-sync-audit-complete-ariestools-sdk.md#skillsariestools-sdkfetchmd) | Update | `fetchJson` is shown returning the data object, but it returns a `{ data, status, … }` envelope and never throws on non-2xx |
| ariestools-sdk | [`overview.md`](2026-10-08-skills-sync-audit-complete-ariestools-sdk.md#skillsariestools-sdkoverviewmd) | Update | `zod` is called an optional peer, but the root barrel and `/hex`, `/object` and `/zod` import it at load time |
| ariestools-sdk | [`packages.md`](2026-10-08-skills-sync-audit-complete-ariestools-sdk.md#skillsariestools-sdkpackagesmd) | Update | The eth-address section names an `EthAddress` export the package does not have |
| ariestools-sdk | [`packages.md`](2026-10-08-skills-sync-audit-complete-ariestools-sdk.md#skillsariestools-sdkpackagesmd) | Update | The storage-adapters root barrel needs both optional backends, and the install line installs neither |
| xy-agent | [`SKILL.md`](2026-10-08-skills-sync-audit-complete-xy-agent.md#skillsxy-agentskillmd) | Update | "Recommended, not required" is false from toolchain 10.1.1, and the router never names the linter that now enforces the pattern |
| xy-agent | [`agents-md.md`](2026-10-08-skills-sync-audit-complete-xy-agent.md#skillsxy-agentagents-mdmd) | Update | The prescribed AGENTS.md headings fail the error-level `agents.required-sections` rule |
| xy-agent | [`auditing.md`](2026-10-08-skills-sync-audit-complete-xy-agent.md#skillsxy-agentauditingmd) | Update | "Tooling status" says there is no `xy agent` command, but 10.1.1 ships it as stable and runs it in `xy check` |
| xy-agent | [`auditing.md`](2026-10-08-skills-sync-audit-complete-xy-agent.md#skillsxy-agentauditingmd) | Update | "Pass an explicit stable id" cannot be done: `xy work add` has no `--id`, and ids are random on every call |
| xy-agent | [`templates.md`](2026-10-08-skills-sync-audit-complete-xy-agent.md#skillsxy-agenttemplatesmd) | Update | The adapter templates fail the error-level `agents.adapter-thin` rule |
| xy-agent | [`templates.md`](2026-10-08-skills-sync-audit-complete-xy-agent.md#skillsxy-agenttemplatesmd) | Update | The `docs/README.md` template does not match what `xy agent index` generates, so `docs.index-current` errors |
| architecture | [xyo-skills README](2026-10-08-skills-sync-audit-complete-architecture.md#cross-repo-distribution) | Update | The xyo-skills install commands replace the canonical `xy-development` and `xy-toolchain` with redirect stubs |
| architecture | [legacy `xy claude` output](2026-10-08-skills-sync-audit-complete-architecture.md#cross-repo-distribution) | Remove | Retired `xy claude` output (`xylabs-*` skills, rules, commands) is tracked in 10 repos and competes with `xy-toolchain` |
| architecture | [toolchain `skills/pick.ts`](2026-10-08-skills-sync-audit-complete-architecture.md#cross-repo-distribution) | Update | `xy skills pick` (new in 10.1.1, stable) overwrites an existing `xy.config.ts` |
| architecture | [toolchain `agent/rules.ts`](2026-10-08-skills-sync-audit-complete-architecture.md#link-and-consistency-integrity) | Update | `xy agent lint` rules and fixers misfire on documents written exactly to the xy-agent skill |
| architecture | [toolchain repo-init templates](2026-10-08-skills-sync-audit-complete-architecture.md#link-and-consistency-integrity) | Update | The toolchain's own scaffolds contradict its stable agent lint, and a fresh `xy repo init` fails `xy check` |

## Fixes that land outside this repository

The five high-severity architecture items, and several medium ones, are changes to other repositories rather than to skill text:

- **`ariestools/toolchain`:**
  - the `xy skills pick` config overwrite;
  - `xy agent lint` rules and fixers that misfire on skill-conformant documents;
  - a repo-init scaffold that fails its own `xy check`;
  - an `ARIESTOOLS_SKILLS` catalog that omits `xy-agent`;
  - version checks that rank the old 1.x copies as current.
- **`XYOracleNetwork/xyo-skills`:** install instructions that overwrite the canonical skills, and redirect stubs that are still installable.
- **10 consumer repos:** tracked `xylabs-*` skills, `.claude/rules/xylabs-*.md` and `.claude/commands/xy-*.md` from the retired `xy claude`.

The [architecture document](2026-10-08-skills-sync-audit-complete-architecture.md) has the full list, with target paths.

## Refuted and resolved upstream

- **Refuted (6):** all were judged unnecessary. The skill already covered them correctly, or the proposed change was cosmetic or deliberate scoping. Each document lists them under "Refuted during verification".
- **Resolved upstream (5):** all are in xy-agent. They were true at 10.1.0, and 10.1.1 now matches the skill: `xy agent index` exists, `agents.nested-delta-only` supports package delta files, and the stable agent lint adopts the skill's front-matter model. They are listed in the [xy-agent document](2026-10-08-skills-sync-audit-complete-xy-agent.md#resolved-upstream-in-toolchain-1011).
