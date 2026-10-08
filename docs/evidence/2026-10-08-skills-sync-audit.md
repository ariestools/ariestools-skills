---
title: "Skills sync audit 2026-10-08 — index"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Partial audit (verification paused) of all four skills and the pack architecture at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.0 (main 7eb43c3c2) and @ariestools/sdk 9.0.1 (298fbb5bb); 494 raw findings merged to 226 items, 132 verified by two lenses, 7 by one, 87 unverified, 1 refuted."
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit — index

This audit asks two questions. Do the skills in this repo still match the packages, code and systems they describe? And do the skill layers build on each other ("waterfall") correctly? This page is the entry point. The findings themselves are in one document per skill plus one for architecture.

## What this establishes, and what it does not

**Establishes:** Every item was checked by an auditor agent against the source at the commits listed below. Items marked `verified` were also confirmed by two independent verifiers: one re-derived the facts from the code, the other checked the skill text and whether the recommended fix is right. Their corrections are folded into the items.

**Does not establish:**

- **That `unverified` items are correct.** The run was paused before verification finished. All of xy-agent and most of the architecture and cross-repo items are in this state. Treat them as leads.
- **That any fix has been applied.** No skill file was changed. This is a record, not a remediation plan or a priority order.
- **Anything after the audited commits.** During the run, `ariestools/toolchain` main moved to `8688075c9` (`feat(updo)`: ignore selected dependencies; `fix(updo)`: trusted registry-token origins; `fix(statics)`: `npm_package_json` fallback). It also had uncommitted work on a new `agent` command. None of that was audited.
- **Completeness.** The planned completeness-critic and gap-check round never ran, and no skill was exercised end to end by an agent.

## Audited sources

| Repository | Commit | Notes |
|---|---|---|
| `ariestools/ariestools-skills` | `7e78933a8` | v0.1.5. `develop` has no content changes beyond this |
| `ariestools/toolchain` | `7eb43c3c2` | Published 10.1.0, lockstep across all 8 packages. `dist/` CLI built 2026-10-06 |
| `ariestools/sdk-js` | `298fbb5bb` | Published 9.0.1 |
| `ariestools/sdk-react` | `0ebb53397` | Published 12.0.1. Coverage-gap review only |
| `ariestools/actor-kit` | `4ddeceff8` | Published 2.0.0. Working tree had uncommitted changes |
| `ariestools/browser-kit` | `e44f716ee` | Published 2.0.0 |
| `ariestools/cli-kit` | `480ab2738` | Published 2.1.0 |
| `XYOracleNetwork/xyo-skills` | `f53adf7ef` | Downstream consumer, v1.1.38 |

## Method

Three kinds of agent did the first pass, 36 in all and all read-only:

- **25 per-file auditors**, one for each skill file. Each checked every factual claim in its file against the source and noted current surface the file is missing.
- **8 source-side sweeps**, working from the source toward the skills: the CLI command and stability catalog, the `xy.config.ts` surface, the config packages, toolchain history since July, the `@ariestools/sdk` exports, the specialist packages and their history, xy-development conventions against what is enforced, and xy-agent conventions against tooling and practice.
- **3 architecture reviewers**: layering inside the pack, cross-repo distribution, and ecosystem coverage gaps.

Each batch of findings then went to two independent verifiers, but that stage was paused partway through. A writing pass merged duplicates within each skill, and a merged item keeps the strongest status of its members. Every item lists the ids of the raw findings it merges. The raw findings and verifier notes are in [2026-10-08-skills-sync-audit-findings.json](2026-10-08-skills-sync-audit-findings.json).

## Results

| Document | Raw | Merged | 🔴 High | 🟠 Med | ⚪ Low | Remove | Update | Add | Verified | Partial | Unverified |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| [xy-development](2026-10-08-skills-sync-audit-xy-development.md) (L1) | 90 | 42 | 2 | 22 | 18 | 0 | 32 | 10 | 41 | 0 | 1 |
| [xy-toolchain](2026-10-08-skills-sync-audit-xy-toolchain.md) (L2) | 151 | 79 | 7 | 37 | 35 | 0 | 49 | 30 | 58 | 7 | 14 |
| [ariestools-sdk](2026-10-08-skills-sync-audit-ariestools-sdk.md) (L3) | 99 | 39 | 4 | 12 | 23 | 1 | 26 | 12 | 27 | 0 | 12 |
| [xy-agent](2026-10-08-skills-sync-audit-xy-agent.md) | 107 | 43 | 7 | 25 | 11 | 0 | 31 | 12 | 0 | 0 | 43 |
| [architecture](2026-10-08-skills-sync-audit-architecture.md) | 47 | 23 | 2 | 10 | 11 | 2 | 17 | 4 | 6 | 0 | 17 |
| **Total** | **494** | **226** | **22** | **106** | **98** | **3** | **155** | **68** | **132** | **7** | **87** |

**xy-development.** The two instructions that fail outright are `pnpm install --resolution-only`, which pnpm 12 rejects, and an `any` escape hatch that ends in a TODO comment the linter rejects. `git.md` assumes Gitflow release branches and an absolute ban on rewriting history, and most repos and the workspace commit-identity policy contradict both. `typescript.md` conflicts with `@ariestools/tsconfig` and `eslint-config-flat` on `.ts` import extensions, explicit return types and `erasableSyntaxOnly` enums. It also carries XYO-specific barrel guidance that does not belong in Layer 1.

**xy-toolchain.** The routing still fits, but the content predates most of 9.2.0–10.1.0. The biggest gap is that the `xy` / `xyex` stability channel is undocumented. This is an explicit ask in toolchain `docs/SKILLS-FOLLOWUP.md`. Because of it, `xy work` and `xy dead` are shown as stable commands, and the release, maintenance and experimental commands are not catalogued.

**ariestools-sdk.** The router is sound, but the content predates sdk-js 8.1.8–9.0.1. The skill misses the Node ≥ 26 floor, the bounded-read fetch controls and a correct `@xylabs` migration map. Its advice to prefer subpath imports conflicts with how the ecosystem imports the root barrel.

**xy-agent.** It was written on 2026-09-01, just before the toolchain shipped `xy plan lint` / `plan init`, the `docs/repo-docs.md` contract and Plan Manifest v1. Most of its high-severity items are direct contradictions of those. All are unverified.

**Architecture.** The layering inside the pack is sound: no lower layer depends on a higher one, and every link and anchor resolves. The drift is in distribution. `xy-agent` shipped, but the toolchain catalog, the marketplace metadata and this repo's own docs still describe three skills. The xyo-skills install path can overwrite the canonical skills with redirect stubs. Four published `@ariestools` package families have no skill and no way to get one installed.

## High-severity items

These are the items where following the skill as written causes a failure, a wrong import or config, or silent damage. Details and fixes are in each linked section.

| Skill | Target | Action | Status | Issue |
|---|---|---|---|---|
| xy-development | [`workflow.md`](2026-10-08-skills-sync-audit-xy-development.md#skillsxy-developmentworkflowmd) | Update | verified | `pnpm install --resolution-only` fails on pnpm 12, which every @ariestools library repo pins |
| xy-development | [`typescript.md`](2026-10-08-skills-sync-audit-xy-development.md#skillsxy-developmenttypescriptmd) | Update | verified | The `any` escape hatch ends with a TODO comment, which fails the `no-explicit-any` lint error at every tier |
| xy-toolchain | [`typescript.md`](2026-10-08-skills-sync-audit-xy-toolchain.md#skillsxy-toolchaintypescriptmd) | Update | verified | Unversioned `typescript` installs now resolve TypeScript 7, which breaks the toolchain (peer `^5.9 \|\| ^6.0`) |
| xy-toolchain | [`compilation.md`](2026-10-08-skills-sync-audit-xy-toolchain.md#skillsxy-toolchaincompilationmd) | Update | verified | Root `compile.*` does not cascade into a package that has its own `xy.config.ts` |
| xy-toolchain | [`testing.md`](2026-10-08-skills-sync-audit-xy-toolchain.md#skillsxy-toolchaintestingmd) | Update | verified | Workspace-scoped test runs skip the root `@ariestools/vitest-config` preset |
| xy-toolchain | [`project-profiles.md`](2026-10-08-skills-sync-audit-xy-toolchain.md#skillsxy-toolchainproject-profilesmd) | Add | verified | Single-package repos with no exports or bin are classified `workspace-root`, and `xy fix` then demotes their runtime dependencies |
| xy-toolchain | [`toolchain.md`](2026-10-08-skills-sync-audit-xy-toolchain.md#skillsxy-toolchaintoolchainmd) | Update | partial | The install command fails at a pnpm monorepo root because it has no `-w` |
| xy-toolchain | [`toolchain.md`](2026-10-08-skills-sync-audit-xy-toolchain.md#skillsxy-toolchaintoolchainmd) | Update | partial | `pnpm-workspace.yaml` with release-age and verify settings is required in every pnpm repo, not "when needed" |
| xy-toolchain | [`commands.md`](2026-10-08-skills-sync-audit-xy-toolchain.md#skillsxy-toolchaincommandsmd) | Update | unverified | `commands.dependabot.rules`, as documented, fails type-checking in a typed `XyConfig` |
| ariestools-sdk | [`fetch.md`](2026-10-08-skills-sync-audit-ariestools-sdk.md#skillsariestools-sdkfetchmd) | Update | verified | The auth-wrapping fetcher example spreads a `Headers` instance and drops every SDK header, including `Content-Encoding: gzip` |
| ariestools-sdk | [`overview.md`](2026-10-08-skills-sync-audit-ariestools-sdk.md#skillsariestools-sdkoverviewmd) | Update | verified | `zod` is called optional, but the root barrel and `/hex`, `/object` and `/zod` import it at load time |
| ariestools-sdk | [`conventions.md`](2026-10-08-skills-sync-audit-ariestools-sdk.md#skillsariestools-sdkconventionsmd) | Update | unverified | Import guidance prefers subpaths, but the ecosystem imports the root barrel, and mixing the two splits class identity |
| ariestools-sdk | [`packages.md`](2026-10-08-skills-sync-audit-ariestools-sdk.md#skillsariestools-sdkpackagesmd) | Update | unverified | The storage-adapters root barrel imports both optional peers (`idb`, `mongodb`), and the install line installs neither |
| xy-agent | [`SKILL.md`](2026-10-08-skills-sync-audit-xy-agent.md#skillsxy-agentskillmd) | Update | unverified | The router never states the toolchain's enforced docs contract, or which side wins when the two disagree |
| xy-agent | [`agents-md.md`](2026-10-08-skills-sync-audit-xy-agent.md#skillsxy-agentagents-mdmd) | Update | unverified | The skill accepts a symlinked or absent `CLAUDE.md`, and `xy plan lint` rejects both |
| xy-agent | [`agents-md.md`](2026-10-08-skills-sync-audit-xy-agent.md#skillsxy-agentagents-mdmd) | Update | unverified | Nested `packages/<pkg>/AGENTS.md` is forbidden by the toolchain contract and does not "load on demand" |
| xy-agent | [`auditing.md`](2026-10-08-skills-sync-audit-xy-agent.md#skillsxy-agentauditingmd) | Update | unverified | "Pass an explicit stable id" cannot be done: `xy work add` has no `--id` |
| xy-agent | [`structure.md`](2026-10-08-skills-sync-audit-xy-agent.md#skillsxy-agentstructuremd) | Update | unverified | The paper filename convention conflicts with the `xy plan lint` papers/ allowlist, and `--fix` moves such papers into `notes/` |
| xy-agent | [`templates.md`](2026-10-08-skills-sync-audit-xy-agent.md#skillsxy-agenttemplatesmd) | Update | unverified | `docs/README.md` is described as generated, and the template names `pnpm xy agent index`, which does not exist |
| xy-agent | [`templates.md`](2026-10-08-skills-sync-audit-xy-agent.md#skillsxy-agenttemplatesmd) | Update | unverified | The `AGENTS.md` skeleton has no Markdown links to papers/ or docs/, so it fails `plan.root.docs-index` |
| architecture | [xyo-skills install docs](2026-10-08-skills-sync-audit-architecture.md#cross-repo-distribution) | Update | unverified | `npx skills add XYOracleNetwork/xyo-skills --all` overwrites canonical xy-development / xy-toolchain with redirect stubs |
| architecture | [sdk-react skills](2026-10-08-skills-sync-audit-architecture.md#cross-repo-distribution) | Remove | unverified | sdk-react tracks legacy `xylabs-*` skills that describe the retired yarn toolchain |

## Refuted during verification

One finding was refuted. It proposed saying that `compile.mode: 'tsc'` "fails the compile" rather than "not wired" in `skills/xy-toolchain/compilation.md:78`. The skill-text verifier judged the current wording correct and sufficient: it already tells agents not to use the mode, and the runtime error message itself says "not wired". The full record is in the [xy-toolchain document](2026-10-08-skills-sync-audit-xy-toolchain.md#refuted-during-verification).

## Finishing the audit

The 87 unverified items can be verified without re-auditing. Filter the `findings` array in the JSON file by `"status": "unverified"` or `"partially-verified"` and run the same two lenses over them. Then do the completeness-critic round that was skipped. Re-check against toolchain main after `8688075c9`, because it includes the work on the new `agent` command. Record the result as a new evidence document rather than editing these.
