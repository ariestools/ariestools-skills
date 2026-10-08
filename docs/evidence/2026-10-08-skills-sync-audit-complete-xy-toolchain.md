---
title: "Skills sync audit (complete) 2026-10-08 — xy-toolchain"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Completed audit of the xy-toolchain skill at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.1 (812b27a91) and @ariestools/sdk 9.0.1 (298fbb5bb); 81 merged open items from 167 raw findings, all verified by two lenses; 2 refuted, 0 resolved upstream; supersedes the partial 2026-10-08 audit"
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit (complete) — xy-toolchain

This document lists the open documentation defects in the xy-toolchain skill found by the completed 2026-10-08 skills sync audit. An auditor raised each open item, and two independent verifiers then confirmed it: a code-truth lens and a skill-text lens. They checked against ariestools-skills 7e78933a8, @ariestools/toolchain 10.1.1 (812b27a91) and @ariestools/sdk 9.0.1 (298fbb5bb), and every toolchain claim was re-checked at 10.1.1. Duplicate raw findings are merged. Where a 10.1.0-era finding and a 10.1.1 finding disagreed, the source decided, and each such item says so. This document does not show that any fix has been applied. It is not a priority-ordered remediation plan, and no agent using the skill has tested the recommended replacement text. See the [Audit index](2026-10-08-skills-sync-audit-complete.md). Member ids refer to the raw [findings JSON](2026-10-08-skills-sync-audit-complete-findings.json).

## Summary

The skill is still accurate for most of what shipped in toolchain 8.7.x, which is most of its content. It has fallen behind 9.2.0–10.1.1 in three ways:

- It never mentions the `xy`/`xyex` channel split.
- It presents the experimental `work` and `dead` commands as stable.
- It misses newer error-level gates: agent lint inside `xy check`, deplint `not-public`, package READMEs, `pub.importsMatchExports` and `nodeTrack`.

Ten high-severity items describe cases where following the text gives a failing build, a wrong config or a destructive edit:

- unversioned installs that pull TypeScript 7
- a compile-config cascade that does not exist
- scoped test runs that skip the preset
- missing pnpm-workspace.yaml settings
- an import-ban clobber
- services misclassified as `workspace-root`
- `--strict` CI advice
- `xy check --fix` overwriting docs/README.md
- an untyped dependabot config key
- no Chromium install step

commands.md has 24 of the 81 items.

| Action | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 0 | 0 | 0 | 0 |
| Update | 8 | 20 | 20 | 48 |
| Add | 2 | 17 | 14 | 33 |
| **Total** | **10** | **37** | **34** | **81** |

81 open items (167 raw findings) · 2 refuted · 0 resolved upstream

## `skills/xy-toolchain/SKILL.md`

### Update

- ⚪ **Description is 958 characters, near the 1024 limit; no Skill identity block and no link back to xy-agent**
  - **Now:** SKILL.md:3 is a 958-character feature list with flag-level parentheticals ("deplint roles, pick, placement/presence", "including --full hygiene"). Related skills (SKILL.md:48-51) lists only ariestools-sdk and xyo-skills.
  - **Actual:** The Skills.sh CLI bundled with the toolchain (skills@1.7.0) rejects descriptions longer than 1024 characters, the same limit as Agent Skills frontmatter. The additions other items need (xyex, release, agent) would push the description over that limit. xy-agent links to xy-toolchain (xy-agent/SKILL.md:45), but there is no link back, even though xy-toolchain owns `xy work` and the 10.1.1 `xy agent` commands that xy-agent depends on.
  - **Fix:**
    - Rewrite the description as "Use when …" triggers of about 400-600 characters, and move the feature list into References.
    - Add the standard Skill identity block.
    - Add a Related skills entry: "xy-agent — AGENTS.md / docs / papers conventions, enforced by `xy agent lint` (stable since toolchain 10.1.1, also run by `xy check`)". Do not name `xy plan lint` as the enforcer.
  - **Evidence:** awk length of SKILL.md:3 = 958; ariestools/toolchain/node_modules/.pnpm/skills@1.7.0/node_modules/skills/dist/cli.mjs:3276 (`e.description.length > 1024`); ariestools/toolchain/packages/toolchain/package.json (`"skills": "~1.7.0"`); skills/xy-agent/SKILL.md:42-45.
  - <sub>ids: skills/xy-toolchain/SKILL.md#5, arch-layering#15</sub>

### Add

- 🟠 **The skill never states which toolchain versions it covers, yet `xy skills lint` pushes it into repos from 8.7.26 to 10.1.1**
  - **Now:** absent. SKILL.md:12 says only "Use the active `@ariestools/toolchain` packages". No file carries a version or "(since X)" marker.
  - **Actual:**
    - `skills.required-current` is error-level, runs inside `xy check`, and compares installs only against ariestools-skills main, so every repo is pushed to the newest skill.
    - Lockfiles in 49 consumer repos on 2026-10-08 resolve to: 8.7.26 ×1, 9.0.x ×16, 9.2.0 ×1, 10.0.5-10.0.9 ×20, 10.1.0 ×7, 10.1.1 ×4. Five more repos are still on `@xylabs/ts-scripts-*`.
    - Most of the current skill text predates 9.0.0. Many pending fixes add surfaces that older installs lack:
      - `xyex` and `--stability` (9.2.0)
      - `not-public` rules (10.0.3)
      - package README rules (10.0.5)
      - `nodeTrack` (10.0.7)
      - package.json `xy.skills` (10.0.8)
      - `pub.importsMatchExports` (10.0.9)
      - the new Vitest default include (10.1.0)
      - `xy agent`, `xy skills pick` and `commands.updo.ignoreDeps` (10.1.1)
    - On older installs these fail silently. An unknown top-level command prints "Command not found" and exits 0, `xyex` is absent before 9.2.0, and `xy --version` is reliable only from 10.0.6.
  - **Fix:**
    - Under the Authority paragraph, add a "Toolchain versions" block that says:
      - the skill is verified against 10.1.1;
      - anything not marked "(since X)" exists from 9.0.0;
      - find the installed version with `pnpm list @ariestools/toolchain --depth 0`;
      - a missing command prints `Command not found` and exits 0 even under `--strict`, so read the output rather than the exit code.
    - Add `toolchain: ">=9.0.1"` and `verified-toolchain: 10.1.1` under `metadata:`.
    - Mark gated content inline:
      - commands.md:141-150 and :167: since 9.0.1.
      - Agent lint in the `xy check` row: since 10.1.1.
      - testing.md:73/:77: show both Vitest default includes.
    - Collect these gates in a "Version notes" table in toolchain.md.
    - When applying the xyex items, write "`pnpm xyex <cmd>` (toolchain ≥9.2.0; on 9.0.x/9.1.x use `pnpm xy <cmd>`)".
    - Bump `verified-toolchain` on each skill release.
  - **Evidence:** ariestools/toolchain/docs/STABILITY.md:70-76; ariestools/toolchain/packages/toolchain/src/actions/skills/versions.ts:8-10,59-69; ariestools/toolchain/packages/toolchain/src/actions/skills/lint.ts:343-364; ariestools/toolchain/packages/toolchain/src/xy/xy.ts:120-130; lockfile survey of XYOracleNetwork/\* and ariestools/\*; `node_modules/.bin/xyex` absent in the 9.0.2 installs of XYOracleNetwork/xyo-cash, XYOracleNetwork/immortalizer and ariestools/undestined-worlds.
  - <sub>ids: gap-gap-toolchain-version-scope#0</sub>

- 🟠 **Router and description have no route for release, dependency maintenance, agent docs, license/security or experimental commands**
  - **Now:** SKILL.md:34 routes only build, check, fix, clean, deplint, api-exposure, publint, dead, repository policy, skills and work. SKILL.md:3 mentions "publishing checks" but not releases, updates, `license` or `secure`, although commands.md:137-150 documents the last two.
  - **Actual:** The toolchain has these stable commands: `deploy`, `publish --tag`, `install`, `reinstall`, `up`, `updo`, `license`, `secure` and, since 10.1.1, the `agent` family. It also has these experimental ones: `plan`, `npm-org`, `enable ts-native`, `tsc-validate` and `orphan`.
  - **Fix:** Once commands.md has the matching sections (see the release, maintenance, agent and experimental items under commands.md), extend the SKILL.md:34 route with:
    - release: `deploy [patch|minor|major|prerelease]`, `publish --tag <dist-tag>`, and the 10.1.1 `--defer` rule;
    - dependency maintenance: `install`, `reinstall`, `up`, `updo` with `commands.updo.ignoreDeps`;
    - `license` and `secure`;
    - the `agent` family that `xy check` runs, cross-linked to xy-agent;
    - a single phrase for "experimental `xyex` commands".

    Add short "Use when" triggers for releasing or publishing, updating dependencies, linting AGENTS.md/docs, and license or security audits, staying within the description budget.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:34-35,42,47-48,66; `xy deploy --help`, `xy publish --help`, `xy secure --help`, `xyex plan --help`, `xyex npm-org --help`, `xyex enable --help` (10.1.1); skills/xy-toolchain/commands.md:137-150.
  - <sub>ids: skills/xy-toolchain/SKILL.md#2, skills/xy-toolchain/SKILL.md#4</sub>

## `skills/xy-toolchain/commands.md`

### Update

- 🔴 **`xy check` row omits agent lint, and `xy check --fix` now rewrites docs/README.md and can leave the rerun failing**
  - **Now:**
    - commands.md:39: "`xy check` | Git, package-manager, publish, repo-layout, ESLint-config, and skill policy".
    - The policy table (:156-163) has no agent row.
    - :165: "`xy check --fix` runs the fixable forms of the policy families included by `xy check`. Rerun without `--fix`".
    - toolchain.md:61.
  - **Actual:**
    - Since 10.1.1 (8f2768dfd), `xy check` runs `agent lint` first, unconditionally and with no config entry required. This is the first new `xy check` gate since v8.7.29.
    - Its error-level rules are `agents.file-present`, `agents.required-sections` (orient / authority / repository map / commands / failures headings), `agents.adapter-thin`, `agents.links-resolve`, `agents.no-absolute-paths` and `docs.index-current`.
    - About 17-18 of the ~49 toolchain-using repos have no root AGENTS.md, and none of the rest has all five required sections. That includes the toolchain's own AGENTS.md.
    - `xy check --fix` passes fix through to agent lint, which:
      - replaces docs/README.md with a bare generated `# Docs` table, discarding a hand-written index such as ariestools/toolchain/docs/README.md;
      - prepends `kind: doc` front matter to every docs/, papers/ or specs/ file that lacks it.
    - The lint context is loaded once per run, so the immediate rerun without `--fix` still fails `docs.index-current`.
  - **Fix:**
    - Change :39 to "Agent docs (AGENTS.md / docs convention, since 10.1.1), Git, package-manager, publish, repo-layout, ESLint-config, and skill policy".
    - Add an `xy agent lint` row to the policy table and link the xy-agent skill.
    - Replace the :165 guidance with this sequence:
      1. Run `pnpm xy agent lint` without `--fix` first.
      2. Scaffold missing files with `pnpm xy agent init`, which never overwrites.
      3. In a repo with a hand-maintained docs index, tune levels under `commands.agentLint.rules` before fixing.
      4. After a front-matter fix, run `pnpm xy agent index` before the verification rerun.
    - Note that upgrading to 10.1.1 adds this gate.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:14,49-50; ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:17-23,87-134,231,245-258; ariestools/toolchain/packages/toolchain/src/actions/agent/docsIndex.ts:12-28; ariestools/toolchain/packages/toolchain/src/actions/agent/lint.ts:21; ariestools/toolchain/docs/xy-config.md:84; `xy agent lint --rules` (10.1.1); `git show <tag>:…/checkCommand.ts` for v8.7.29 through v10.1.0; a scratch fixture reproduced "error docs.index-current" after one `--fix` pass.
  - <sub>ids: gap-tc1011-xy-agent#18, gap-gap-toolchain-version-scope#2, gap-gap-ci-guidance#3</sub>

- 🔴 **"Use `--strict` when warnings must block CI" fails every fresh CI clone, yet still lets agent-lint and skills-lint warnings through**
  - **Now:** commands.md:165: "Rerun without `--fix`, and use `--strict` when warnings must block CI."
  - **Actual:**
    - Fresh clones fail. `xy check` runs git lint, whose `git.autocrlf` and `git.eol` rules warn unless `core.autocrlf=false` and `core.eol=lf` are set, and an unset key reads as undefined. A fresh CI clone has neither, so `xy check --strict` exits non-zero unless the runner's global git config sets both.
    - Some warnings are never escalated. Inside `xy check`, agent lint and skills lint are called with `strict` effectively false, so their warnings never fail `xy check --strict` or `XY_STRICT=1`. The skills half of this already existed in 10.1.0; the agent half is new in 10.1.1. Publint, packman lint, lint lint, git lint and repo lint do honor strict mode.
  - **Fix:** Replace :165 with:

    > `xy check --fix` applies the fixable forms of the families `xy check` runs; use it locally, never in CI. In CI, set git config with plain git before the gate (`git config core.autocrlf false && git config core.eol lf`, plus `git config core.ignorecase false` on case-insensitive filesystems). Do not use `xy git lint --fix` for this, because it also rewrites `.gitignore`. Then run `pnpm xy check --strict`. In 10.1.1, `--strict` does not escalate agent-lint or skills-lint warnings inside `xy check`; when those must block, also run `pnpm xy agent lint --strict` and `pnpm xy skills lint --strict`.

    Revisit the last sentence once the toolchain passes strict mode through to those two linters.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/gitlint.ts:31-56,60-73; ariestools/toolchain/packages/toolchain/src/actions/gitlintIgnore.ts:72; ariestools/toolchain/packages/toolchain/src/lib/gitConfig.ts:12-44; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:50,74; ariestools/toolchain/packages/toolchain/src/actions/agent/lint.ts:24; ariestools/toolchain/packages/toolchain/src/actions/skills/lint.ts:472,521; ariestools/toolchain/packages/toolchain/src/actions/ruleRunner.ts:183,253; `xy git lint --rules` (10.1.1).
  - <sub>ids: gap-gap-ci-guidance#1</sub>

- 🔴 **The documented `commands.dependabot.rules` key fails to type-check in a typed `XyConfig`**
  - **Now:** commands.md:150: "raise levels under `commands.dependabot.rules` to gate". Every config example in the skill is typed `const config: XyConfig`.
  - **Actual:**
    - At runtime, `xy secure dependabot` reads `commands.dependabot`.
    - But `CommandsConfig` (10.1.1) has no `dependabot` key, no `workLint` key and no index signature, so the object literal fails with TS2353. That also breaks full-package validation wherever xy.config.ts sits inside a package tsconfig.
    - 10.1.1 added `agentLint` and `updo` to `CommandsConfig`, but neither of these two keys.
  - **Fix:**
    - Keep the sentence, add the caveat, and give this workaround, which was verified to type-check: hoist the object and spread it next to at least one typed key, e.g. `const dependabot = { rules: { 'dependabot.high': 'error' as const } }` and then `commands: { deplint: {}, ...{ dependabot } }`.
    - File a toolchain fix adding `dependabot?: { rules?: … }` and `workLint?: { rules?: … }` to `CommandsConfig`, and remove the caveat once it ships.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:682-707; ariestools/toolchain/packages/toolchain/src/lib/ruleCommandRegistry.ts:54-58,131-133; ariestools/toolchain/packages/toolchain/src/actions/secure/dependabot.ts:109-117. A scratch `tsc --noEmit --strict` against the 10.1.1 dist types, with TS 6.0.3 and with 7.0.2, reports "error TS2353 … 'dependabot' does not exist in type 'CommandsConfig'" (same for `workLint`); the spread form type-checks.
  - <sub>ids: cov-config#1, cov-cli#4</sub>

- 🟠 **`xy dead` and `xy work`, and their configs, are presented as stable `xy` commands**
  - **Now:**
    - SKILL.md:3 and :34 advertise "xy work tracking" and dead-code analysis.
    - commands.md:133-135 documents `xy dead`; :173-249 runs every example as `pnpm xy work …`; the generic config example at :299-317 uses `commands.dead.rules`.
    - toolchain.md:64 has an `xy work …` row.
    - None of these carries a stability label.
  - **Actual:**
    - Both commands are experimental. Every `xy work <sub>` and `xy dead` call prints "Experimental: … Prefer \"xyex …\"", help adds "(experimental — prefer xyex)", and the roadmap plans a hard error under `xy` in a future major.
    - `dead` stays experimental because `--fix-remove` is destructive; `work` because GitHub sync and multi-root are still evolving.
    - Their settings (`commands.dead`, `commands.workLint`, and also `planLint` and `npmOrgLint`) are experimental-command config that may change on a minor.
    - `xy dead` also takes `--workspace <file>` and `--format`, which the skill does not document.
    - `xy work` runs on every version and warns only from 9.2.0, while `xyex` does not exist before 9.2.0 (17 of 49 consumer repos).
  - **Fix:**
    - Label the `dead` and `work` headings "(experimental — `xyex`)".
    - Switch examples to "`pnpm xyex work …` / `pnpm xyex dead` (toolchain ≥9.2.0; on 9.0.x/9.1.x use `pnpm xy`)" in commands.md, toolchain.md:64 and the SKILL.md:3/:34 router. Say that flags and storage may change on a minor.
    - For `dead`:
      - recommend `--fix` (adds deprecation markers) before `--fix-remove`;
      - require a clean git tree, plus a compile and test rerun, after `--fix-remove`;
      - document `--workspace <file>`.
    - Change the generic config example at :299-317 to stable keys (deplint, publint or repoLint rules), or label the `dead` block as experimental config.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:49,69; ariestools/toolchain/packages/toolchain/src/xy/experimentalCommand.ts:8-13,39-41,54-56; ariestools/toolchain/packages/toolchain/src/xy/common/work/index.ts:22-34; ariestools/toolchain/docs/STABILITY.md:12-14,94-95; ariestools/toolchain/docs/xy-config.md:58; ariestools/toolchain/docs/ROADMAP.md:110,185; `xy work --help`, `xy dead --help` (10.1.1).
  - <sub>ids: skills/xy-toolchain/commands.md#1, cov-cli#2, cov-cli#3, cov-toolchain-history#4, cov-config#8, skills/xy-toolchain/SKILL.md#0, skills/xy-toolchain/toolchain.md#3</sub>

- 🟠 **The error-level `dep.*.not-public` rules are undocumented, and project-profiles.md tells published packages to depend on private siblings**
  - **Now:**
    - commands.md:48: "Detect unlisted, unused, misplaced, redundant, unsatisfied, range-style, and workspace-protocol problems."
    - project-profiles.md:125: "Keep workspace-internal runtime packages in `dependencies`".
    - No package visibility concept appears anywhere in the skill.
  - **Actual:**
    - Since 10.0.3, `dep.dependencies.not-public` and `dep.peerDependencies.not-public` are errors that cannot be auto-fixed, and they block `xy build`.
    - A package is public when it is not `private` and is either unscoped or has `publishConfig.access: 'public'`. A scoped package without `access` counts as restricted.
    - A public package may not list any of these in `dependencies` or `peerDependencies`:
      - an unpublished npm package;
      - a private or restricted workspace sibling;
      - a non-registry spec (`file:`, `link:`, `portal:`, `catalog:`, `patch:`, git).
    - :48 also leaves out `dep.peerDependencies.version-mismatch` and `dep.peerDependencies.unrequested`.
  - **Fix:**
    - In commands.md:48, add the not-public rules: errors, fixed by hand by publishing the dependency, switching to a published registry range, dropping it, or making the consumer private. Add version-mismatch and unrequested too, and point to `pnpm xy deplint --rules` for the full catalog.
    - In project-profiles.md, add a Visibility axis (private / restricted / public, from `private` and `publishConfig.access`) to the table at :17-23.
    - Extend project-profiles.md:125: a public package may depend only on public siblings. Give each sibling `publishConfig.access: 'public'`, or bundle private implementations with vendor mode.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/rulesNotPublic.ts:14-17,39-70,123-145; ariestools/toolchain/packages/toolchain/src/lib/classifyPackageVisibility.ts:13-23; ariestools/toolchain/packages/toolchain/src/actions/deplint/ruleConfig.ts:37-38; `xy deplint --rules` (10.1.1: `error dep.dependencies.not-public`, `error dep.peerDependencies.not-public`); commit 2f9db7e4e → v10.0.3.
  - <sub>ids: skills/xy-toolchain/commands.md#2, cov-toolchain-history#8, skills/xy-toolchain/project-profiles.md#2</sub>

- 🟠 **Publint description omits the error-level `pub.importsMatchExports` rule, the new `--fix` limit, and the scoping flags**
  - **Now:** commands.md:131 lists upstream publint checks, export-map parity, platform portability, condition order, published files, source leakage, side effects, root legacy fields and workspace peer ranges, then `--fix`.
  - **Actual:**
    - Since 10.0.9, `pub.importsMatchExports` is an error that cannot be auto-fixed. Every exact `#alias` in package.json `imports` must select the same runtime file as its same-named public subpath under every condition; otherwise the module loads twice.
    - Export-map `--fix` now refuses to add a condition that the matching `#alias` does not select.
    - `pub.resolutions` and `pub.compileTargets` also exist.
    - Flags: `--include` / `-e, --exclude <checks>` (comma-separated check names; `peerDeps` runs only on all-workspace runs), `--fresh` (clears the incremental snapshot) and `--pack` (default true).
    - Three rules are errors by default: `pub.importsMatchExports`, `pub.publint` and `pub.platform`.
  - **Fix:**
    - Add `#imports`/exports alias parity (`pub.importsMatchExports`, must be fixed by hand) and dependency resolutions to :131.
    - Note that `--fix` will not add a condition its `#alias` does not select.
    - Add one flag line: `--include/--exclude <checks>`, `--fresh`, and `--no-pack`, which skips published-files verification and so is not for gates.
    - Link the compilation.md monolith section for the identity invariant.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/publintRules.ts:19,51; ariestools/toolchain/packages/toolchain/src/actions/publint.ts:330-331; ariestools/toolchain/CHANGELOG.md:20,25-26; `xy publint --rules`, `xy publint --help` (10.1.1); commit af6712ba5 → v10.0.9.
  - <sub>ids: skills/xy-toolchain/commands.md#3, cov-toolchain-history#7, cov-cli#16</sub>

- 🟠 **`xy repo lint` row omits the error-level package README rules and most current rule families**
  - **Now:** commands.md:160: "Workspace structure, versions, engines, package-manager fields, spec layout, and Dependabot enablement". The new-package steps at toolchain.md:110-122 never mention a README.
  - **Actual:**
    - Since 10.0.5, two rules run in `xy check` and are errors, fixable with `--fix`:
      - `repo.package-readme`: every workspace package except the root needs a consumer README.md.
      - `repo.package-readme-files`: publishable packages list README.md in `files`.
    - Other error-level families: internal dependency and peer ranges, `repo.root-private`, `repo.volta-only-root`, `repo.engines-non-terminal`, `repo.engines-lts`, `repo.packages-folder`, `repo.workspace-glob-coverage`, and the pnpm release-age rules. `repo.pnpm-no-overrides` warns.
    - Repo lint runs only in monorepos.
  - **Fix:**
    - Expand the row to list: workspace layout (packages/ folder, glob coverage), versions and internal ranges, engines/volta, package-manager fields and pnpm release-age/overrides, spec layout, the package consumer README.md and its `files` entry, and Dependabot enablement.
    - Add: "A new workspace package needs a README.md or `xy check` fails; `xy repo lint --fix` scaffolds one."
    - Point to `pnpm xy repo lint --rules`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:350-361,534-537; ariestools/toolchain/packages/toolchain/src/actions/package-lint-engines.ts:65-94,176-223; `xy repo lint --rules` (10.1.1); commit eb11282ab → v10.0.5.
  - <sub>ids: skills/xy-toolchain/commands.md#4, cov-cli#7, cov-toolchain-history#9</sub>

- 🟠 **`xy fix` row omits `lint lint` and does not say `xy fix` differs from `xy check --fix`; node lint and the `.xy/cache` rule are unstated**
  - **Now:**
    - commands.md:40: "Git lint, deplint, repo lint, publint, and ESLint fixes".
    - The :158 git lint row says only "LF settings and case sensitivity".
    - `xy node lint` (:161) sits in the policy table without saying it runs on its own.
  - **Actual:**
    - `xy fix` runs git lint, deplint, repo lint, publint, `lint` and `lint lint`, each with `--fix`. It runs no packman, skills or agent fixes.
    - `xy node lint` runs in neither `xy check` nor `xy fix`.
    - Git lint also has `git.ignore-toolchain-cache` (warn, fixable): `.xy/cache` must be ignored in every package.
  - **Fix:**
    - Change :40 to "git lint, deplint, repo lint, publint, ESLint and ESLint-config (lint lint) fixes; does not run packman, skills or agent fixes — use `xy check --fix` for those".
    - In the policy table, mark which families `xy check` runs, and state that `xy node lint [--fix]` runs only on its own.
    - Add the per-package `.xy/cache` ignore (`git.ignore-toolchain-cache`) to the git lint row.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/fix.ts:17-27; ariestools/toolchain/packages/toolchain/src/actions/ruleCatalog.ts:330-354; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:14,49-74; `xy git lint --rules` (10.1.1).
  - <sub>ids: skills/xy-toolchain/commands.md#9, cov-cli#18, cov-toolchain-history#17</sub>

- 🟠 **The `dep.workspace.protocol` example fails to type-check, and its option only restates the default**
  - **Now:** commands.md:310: `'dep.workspace.protocol': ['error', { protocol: 'workspace:~' }],` inside `const config: XyConfig`.
  - **Actual:** The `DeplintRulesConfig` index signature also applies to the fresh literal and types rule options as `DeplintRuleCommonOptions`, which has only `ignore`. The literal therefore fails with TS2322. The runtime accepts `protocol`, but `workspace:~` is already the default, so the option changes nothing.
  - **Fix:** Use `'dep.workspace.protocol': 'error'` and add: "the default protocol is `workspace:~`; the option accepts `'workspace:*' | 'workspace:^' | 'workspace:~'`." File a toolchain item for the index-signature typing.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:346-352,386-393; ariestools/toolchain/packages/toolchain/src/actions/deplint/ruleConfig.ts:21; ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.ts:769; scratch tsc 6.0.3 against the 10.1.1 dist types reports "TS2322 … 'protocol' does not exist in type 'DeplintRuleCommonOptions'".
  - <sub>ids: cov-cli#5</sub>

- ⚪ **Global flag table: wrong `--jobs` default, no `--defer`, imprecise `--no-defer`**
  - **Now:** commands.md:21: "`--jobs <n>` | Limit parallel work; default is 16". commands.md:26: "`--no-defer` | Bypass a same-named local package script".
  - **Actual:**
    - `--jobs` defaults to `os.availableParallelism()`, so 16 appears only on a 16-core machine.
    - Deferral targets a same-named script in the root package.json. It fires for a top-level command with no subcommand, including a command given a declared positional such as `xy test <target>`; the target is forwarded to the script.
    - Since 10.1.1, `publish` and `deploy` never defer unless the new global `--defer` is passed. `--no-defer` or `XY_NO_DEFER=1` wins over `--defer`.
    - Resolved: one round-1 item said deferral requires no positional argument. The middleware checks only `argv._`, and a yargs 18.2.0 probe shows a declared target is not in `argv._`; subcommands such as `xy lint lint` do not defer.
  - **Fix:**
    - Change the `--jobs` default to "available CPU parallelism".
    - Reword `--no-defer`: "Run the built-in command even when the root package.json has a same-named script (env `XY_NO_DEFER=1`); overrides `--defer`".
    - Add `--defer`: "Let `publish` and `deploy` run a same-named root script (off by default since 10.1.1)".
    - Optionally add `-v/--verbose`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/xyParseOptions.ts:58-67,88-104,126-130; ariestools/toolchain/packages/toolchain/src/lib/tryRunLocalScript.ts:13-56 (commit b75077b16); `xy deploy --help` (10.1.1); yargs 18.2.0 probe `yargs(['test','@scope/pkg']).command('test [target]')` → middleware sees `_: ["test"]`.
  - <sub>ids: cov-cli#13, gap-tc1011-other#0</sub>

- ⚪ **Deplint classifier default, `pick` nuances and the remaining config fields are not stated**
  - **Now:** commands.md:50-54 lists legacy / aei / aei-next without a default or CLI flag. :116-123 describes `pick` and says choosing `none` "removes the entry".
  - **Actual:**
    - The default classifier is `legacy`. Precedence is the `--classifier` flag, then `commands.deplint.classifier`, then `legacy`. So `aei-review` rows appear in `pick` only under aei/aei-next.
    - In `pick`, `none` keeps existing `peer-with-default` and presence-only entries.
    - DeplintConfig also has `exclude` (globs skipped by source scanning), `plugins`, `hasImportConsumers`, `peerTarget` and `allowMoveToDev`. Per-package config adds `peerOptional`.
    - The CLI has `-d/-D/-P` section filters.
    - The old `deplint.*` rule ids are deprecated aliases of `dep.*`.
  - **Fix:**
    - State "default `legacy`; override per run with `--classifier` or per repo with `commands.deplint.classifier`".
    - Note the two `pick` nuances.
    - Add a compact field list with defaults, mentioning `exclude` for generated trees and `peerOptional`.
    - Note the `deplint.*` → `dep.*` alias.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/engine.ts:134-139,168; ariestools/toolchain/packages/toolchain/src/actions/deplint/interactivePick.ts:29,166-176; ariestools/toolchain/packages/toolchain/src/actions/deplint/loader.ts:32-44; ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts (DeplintConfig, DeplintPackageConfig); `xy deplint --help`.
  - <sub>ids: skills/xy-toolchain/commands.md#10, cov-config#11</sub>

- ⚪ **packman row does not separate the stable lint from the experimental convert/clean**
  - **Now:** commands.md:159: "Package-manager safety configuration, including pnpm release-age policy".
  - **Actual:** `xy packman lint` is stable and runs in `xy check`. Its rules are all errors and fixable once pnpm-workspace.yaml exists: `packman.pnpm.minimumReleaseAge`, `packman.pnpm.minimumReleaseAgeExclude`, `packman.pnpm.verifyDepsBeforeRun` and `packman.yarn.enableScripts`. `packman convert <pm>` and `packman clean` are experimental, and `packman clean` deletes node_modules and lockfiles.
  - **Fix:** Expand the row with those rules, and add: "`xyex packman convert <pm>` and `xyex packman clean` are experimental migration aids; `packman clean` wipes node_modules and lockfiles and is not a build-artifact cleaner (use `xy clean`)."
  - **Evidence:** ariestools/toolchain/docs/SKILLS-FOLLOWUP.md:9; ariestools/toolchain/docs/STABILITY.md:80-88; ariestools/toolchain/CHANGELOG.md:59; `xy packman --help`, `xy packman lint --rules` (10.1.1).
  - <sub>ids: cov-toolchain-history#11</sub>

- ⚪ **`xy skills lint` is described as catching "unnecessary installations", but it ignores non-catalog skills and never removes anything**
  - **Now:** commands.md:163: "Required project skills, versions, and duplicate/unnecessary installations"; :171.
  - **Actual:** `skills.unnecessary` considers only the 10 catalog names, so retired skills such as xylabs-xy-cli are never reported; 10 repos carry them. The rule is not fixable, and every `--fix` path only installs or updates. Removal goes through the Skills.sh passthrough `xy skills remove`.
  - **Fix:**
    - Change the row to: "Required catalog skills, versions, duplicate global installs, and catalog skills that are neither required/optional for the profile nor marked `allowed` in `commands.skillsLint.skills`".
    - Add to :171: "Skills outside the catalog, including retired xylabs-* skills, are never reported, and `--fix` only installs or updates. Remove unwanted skills with `xy skills remove <name> -y`."
    - Link the toolchain.md legacy-files subsection proposed below.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:202-205; ariestools/toolchain/packages/toolchain/src/actions/skills/lint.ts:296-401; `xy skills --help` (10.1.1, `remove [skills]`).
  - <sub>ids: gap-gap-legacy-xylabs-artifacts#4</sub>

### Add

- 🟠 **The stable `xy` / experimental `xyex` channels and `xy --stability` are not documented anywhere in the pack**
  - **Now:** absent.
    - `grep -rn xyex skills/` finds nothing.
    - Global behavior (commands.md:13-29) has no `--stability`.
    - SKILL.md:12-14, its routes at :26 and :34, and toolchain.md:49-66 describe only `xy`.
    - toolchain.md:21 points only to `--help`.
  - **Actual:**
    - Since 9.2.0 the toolchain ships two bins: `xy`, which is semver-stable, and `xyex`, an experimental superset that may change on a minor release.
    - `pnpm xy --stability [--json]` prints the stability tier of every command, package and experimental config surface.
    - Experimental commands: dead, work, plan, npm-org, enable, orphan, tsc-validate, sonar, packman convert/clean, and the React-only analyze/eject/sitemap. `relint` is deprecated.
    - Experimental config surfaces: `compile.validator: 'shared'`, `compile.mode: 'tsc'`, `compile.compiler: 'native'`, ESLint tier 4, `xy lint --mode shared-typecheck`, non-pnpm package managers, `commands.planLint` and `commands.npmOrgLint`.
    - Experimental commands still run under `xy`, with a warning that this "may become a hard error in a future major release".
    - The roadmap's hard-error phase is blocked until this skill documents xyex, and the promotion rubric requires flags and config to be "documented in xy-toolchain skills".
    - The toolchain's SKILLS-FOLLOWUP (2026-09-01) asks for exactly this, in commands.md and the SKILL.md router.
  - **Fix:**
    - At the top of Global behavior, add a "Stable vs experimental (`xy` / `xyex`)" subsection covering:
      - the semver contract;
      - using `pnpm xyex <cmd>` only for commands the catalog marks experimental (toolchain ≥9.2.0);
      - `pnpm xy --stability --json` as the source of truth;
      - a link to docs/STABILITY.md;
      - preferring `xy` in scripts, CI and examples.
    - Add `--stability` to the flag table.
    - In toolchain.md, add `--stability` and `--rules` next to `--help` at :21, and a one-line "xy vs xyex" note under "Root CLI versus package hooks".
    - In SKILL.md, add a short section after :14, "xy/xyex channels" to the toolchain.md and commands.md routes, and "xy/xyex CLI" to the description.
    - Then ask the toolchain to delete docs/SKILLS-FOLLOWUP.md.
  - **Evidence:** ariestools/toolchain/packages/toolchain/package.json:48-49 (`xy` and `xyex` bins); ariestools/toolchain/packages/toolchain/src/xy/stability.ts:13-75,135-185; ariestools/toolchain/packages/toolchain/src/xy/experimentalCommand.ts:8-13,45-57; ariestools/toolchain/docs/STABILITY.md:9-14,55-62,110-116; ariestools/toolchain/docs/ROADMAP.md:19,52,185,204,212; ariestools/toolchain/docs/SKILLS-FOLLOWUP.md:5-9; ariestools/toolchain/CHANGELOG.md [9.2.0]; `xy --stability --json` (10.1.1).
  - <sub>ids: skills/xy-toolchain/commands.md#0, cov-cli#0, cov-toolchain-history#2, skills/xy-toolchain/SKILL.md#1, cov-toolchain-history#3, skills/xy-toolchain/toolchain.md#2, arch-distribution#7</sub>

- 🟠 **The stable `xy agent` command family (new in 10.1.1) is undocumented, and the experimental `xyex plan` conflicts with it**
  - **Now:** absent. No `agent` or `plan` appears in commands.md, toolchain.md or the SKILL.md:34 router. xy-agent SKILL.md:45 sends readers to xy-toolchain for the xy CLI.
  - **Actual:**
    - 10.1.1 adds a stable command group, invoked as `pnpm xy agent …` (not through xyex) and run by `xy check`:
      - `lint [--fix] [--strict] [--rules]`
      - `audit [--strict]`, a five-rule subset
      - `init`, which never overwrites. It writes an AGENTS.md template, a CLAUDE.md containing `@AGENTS.md`, docs/{decisions,runbooks,plans,evidence,archive} and docs/README.md.
      - `index`
      - `archive <path>`
    - There are 18 rule ids, two of them fixable (`docs.front-matter`, `docs.index-current`). Config is `commands.agentLint.rules`, which sets levels only; unknown ids throw.
    - `agents.adapter-thin` accepts a CLAUDE.md adapter that is either only an `@AGENTS.md` import or a symlink to AGENTS.md.
    - Separately, `xyex plan init|lint` is experimental, is not part of `xy check`, and is configured by `commands.planLint.rules`. Its layout rules conflict with agent lint: it requires papers/WHITE-PAPER.md and a hand-templated docs/README.md and docs/ROADMAP.md, while `docs.index-current` requires docs/README.md to equal the generated index. Running both fixers makes them fight.
    - Resolved: some round-1 items routed xy-agent audits to `xyex plan lint`. The 10.1.1 source makes `xy agent lint` the stable enforcer and `plan lint` an experimental tool that conflicts with it.
  - **Fix:**
    - Add a "Documentation conventions" subsection to commands.md, led by the stable `xy agent` family: verbs, flags, `--rules`, fixers, `commands.agentLint.rules`, and membership in `xy check`. Point to the xy-agent skill for the convention itself.
    - Follow it with a brief `xyex plan init|lint` entry: experimental, not in `xy check`, configured by `commands.planLint.rules`. Warn that its layout rules differ from xy-agent's and from agent lint's generated index, so `plan lint --fix` must not be run in a repo that passes agent lint.
    - Add `agent` to the SKILL.md:34 router.
    - Have xy-agent SKILL.md:45 and auditing.md name `xy agent`, and drop "no xy agent command yet".
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/agent/index.ts:10-113; ariestools/toolchain/packages/toolchain/src/actions/agent/lint.ts:14-34; ariestools/toolchain/packages/toolchain/src/actions/agent/init.ts (`CLAUDE_ADAPTER = '@AGENTS.md\n'`, `writeIfMissing`); ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:69-112 ("use an @AGENTS.md import or a symlink"),245-258; ariestools/toolchain/packages/toolchain/src/actions/ruleRunner.ts:122-133; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:47,61; ariestools/toolchain/docs/xy-config.md:45,82-84; ariestools/toolchain/docs/plan-manifest.md:50-116; `xy agent --help`, `xy agent lint --rules`, `xyex plan --help` (10.1.1).
  - <sub>ids: gap-tc1011-xy-agent#19, cov-agent-docs#17</sub>

- 🟠 **`nodeTrack` is undocumented, so LTS-pinned repos fail `xy check`**
  - **Now:** absent. commands.md:160-161 mention engines and the root Volta pin but no configuration, and no skill mentions nodeTrack.
  - **Actual:**
    - Since 10.0.7, `commands.repoLint.nodeTrack` and `commands.nodeLint.nodeTrack` (`'current'` by default, or `'lts'`) choose the Node release that two rules compare against: `repo.engines-lts` (error, in `xy check`) and `node.volta-node-latest`.
    - With the default track:
      - an `engines` range that excludes the latest Current release errors;
      - an older `volta.node` warns, which blocks CI under `--strict`;
      - `xy node lint --fix` bumps an LTS `volta.node` pin to the latest Current release.
  - **Fix:** Under Repository policy, add: "Repos that deliberately track Node LTS set `commands: { repoLint: { nodeTrack: 'lts' }, nodeLint: { nodeTrack: 'lts' } }`. Both default to `'current'`." Follow it with the three consequences above.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:586-608; ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:306-307,403-408; ariestools/toolchain/packages/toolchain/src/actions/package-lint-engines.ts:199; ariestools/toolchain/packages/toolchain/src/actions/node-lint.ts:172-175; ariestools/toolchain/docs/xy-config.md:46-56; `xy repo lint --rules`; commit a2b5c6ea3 → v10.0.7.
  - <sub>ids: skills/xy-toolchain/commands.md#5, cov-config#6</sub>

- 🟠 **`xy skills` gets one sentence: no `defaults`, tiers, requirement sources, rule ids, or the 10.1.1 `pick`/presence surface**
  - **Now:** commands.md:163 row, and :171: "`xy skills` wraps the bundled Skills.sh CLI and adds XY-aware defaults, linting, and updates. Use `xy skills lint --fix` to install missing profile-required skills…". The word "profile" here means something unrelated to the package profiles in project-profiles.md.
  - **Actual:**
    - **Subcommands.**
      - Only `defaults`, `lint` and (10.1.1) `pick` are XY-specific.
      - Everything else passes through to Skills.sh: add, update, list, remove, find, experimental_install, experimental_sync.
      - `xy skills --help` prints Skills.sh help; use `xy skills lint --help` for the XY options.
    - **`defaults [-g] [-a <agent>] [--copy]`** installs every ariestools-skills skill plus the xyo-skills XYO/XL1 stack.
    - **Tiers.** `lint` detects a repo tier, none/xy/xyo/xl1:
      - xy requires xy-development and xy-toolchain;
      - xyo adds xyo-knowledge;
      - xl1 adds xl1-knowledge, xl1-patterns and xl1-testing, with xl1-dapp-kit, xl1-scaffold and xl1-build optional.

      It also auto-requires ariestools-sdk for sdk-js producers and consumers, and xl1-dapp-kit for dapp-kit users.
    - **Other requirement sources.**
      - package.json `xy.skills: [{ name, source? }]` on workspace packages and direct dependencies (10.0.8), enforced by the error-level `skills.package-recommended`.
      - `commands.skillsLint.additionalSkills`. Root and workspace lists are unioned, and unknown names are config errors.
    - **Rules:** required-installed, required-current, migrated-source (error), package-recommended, unnecessary, duplicate-install.
    - **`--fix`** installs missing skills, migrates xyo-skills-sourced xy-development and xy-toolchain to ariestools-skills, and updates outdated skills. The update part exists only from 9.2.0.
    - **10.1.1 presence map:** `commands.skillsLint.skills: { '<name>': { presence: 'required' | 'allowed' | 'off' } }`.
      - `required` adds the skill to the required set.
      - `off` drops a profile requirement. If the skill is still installed it warns as `skills.unnecessary`, and it never silences `package-recommended`.
      - `allowed` only suppresses `unnecessary`, and the skill is not version-checked.
    - **10.1.1 `xy skills pick [--skill <name> …]`.**
      - It accepts only the 10 catalog names (not xy-agent), validates all of them before installing, and records every pick as `required`.
      - It needs `--skill` when there is no TTY.
      - It rewrites xy.config.ts: the whole file when it has no `skills:` key, otherwise it replaces the existing block.
    - **Hazard:** cosmiconfig reads a package.json `xy` key before xy.config.ts. A package.json `xy.skills` therefore silently becomes that directory's entire xy config.
  - **Fix:** Replace :171, and extend the :163 row, with a "Skills" subsection that covers:
    - `pnpm xy skills defaults`;
    - `pnpm xy skills lint [--fix|--offline|--strict|--rules]`, with the rule-id table and what `--fix` does;
    - the tier table and auto-requirements, using "tier" rather than "profile" and noting it is unrelated to package profiles;
    - the requirement sources: `xy.skills`, `additionalSkills`, and the 10.1.1 presence map with its semantics;
    - `pnpm xy skills pick --skill <name>`, with a caution: commit first, or edit `commands.skillsLint.skills` by hand, which is the only way to record `allowed` or `off`;
    - that naming `xy-agent` in `skills`, `additionalSkills` or `pick` is a config error that makes `xy skills lint` and `xy check` exit 1; install it with `pnpm xy skills add ariestools/ariestools-skills --skill xy-agent -y` instead;
    - the passthrough subcommands;
    - the cosmiconfig warning: until the toolchain restricts searchPlaces, do not put `xy.skills` in a package that has an xy.config.ts.

    Extend the SKILL.md:34 router to mention `skills pick` and per-skill presence.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/skills/index.ts:7-8,13-77,102-120; ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:10-27,66-73; ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:22-73,99-145,190-206; ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-56; ariestools/toolchain/packages/toolchain/src/actions/skills/packageSkills.ts:90-170; ariestools/toolchain/packages/toolchain/src/actions/skills/lint.ts:145-178,322-341,474-479; ariestools/toolchain/packages/toolchain/src/actions/skills/pick.ts:58-131; ariestools/toolchain/packages/toolchain/src/lib/loadConfig.ts:52-57 with cosmiconfig@10.0.1 dist/defaults.js:5-28; ariestools/toolchain/docs/xy-config.md:62-101; `xy skills lint --rules`, `xy skills pick --help </dev/null` (10.1.1); commits a4cd25cdc, 881eede39 (10.0.8), b8653a52d (10.1.1).
  - <sub>ids: skills/xy-toolchain/commands.md#6, cov-cli#6, cov-config#7, cov-toolchain-history#12, arch-distribution#8, gap-tc1011-skills-pick#0, skills/xy-toolchain/project-profiles.md#7</sub>

- 🟠 **The release commands `xy deploy` and `xy publish` (with `--tag` and `--defer`) are undocumented**
  - **Now:** absent. No skill mentions deploy or publish. SKILL.md:3 says only "publishing checks", meaning publint.
  - **Actual:**
    - Both commands are stable.
    - `xy deploy [patch|minor|major|prerelease]` (default patch) bumps every lockstep package, runs `xy clean` and `xy build`, then applies the version.
    - `xy publish [--tag <dist-tag>] [--chunk-size n]` publishes to npm. Chunking is pnpm-only, and each chunk triggers a separate 2FA prompt.
    - STABILITY.md says prereleases publish with an explicit dist-tag (`--tag next`) so that `latest` stays on stable cuts.
    - Since 10.1.1, both commands ignore a same-named root package.json script and run the toolchain implementation, including its preflight, unless `--defer` is passed. For example, after XYOracleNetwork/xl1-faucet-twitter upgrades, its root `"deploy": "vercel …"` script will no longer run on `pnpm xy deploy`.
  - **Fix:** Add a short "Releasing (owner-directed)" subsection with:
    - the two commands and their flags;
    - the dist-tag rule;
    - the 10.1.1 `--defer` behavior, linked to the global flag table;
    - check the repository's release workflow first, because release-please or CI may own releases;
    - agents run deploy or publish only when the owner directs it.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:34-35; ariestools/toolchain/packages/toolchain/src/actions/deploy.ts:7-18; ariestools/toolchain/packages/toolchain/src/lib/tryRunLocalScript.ts:13,45-50; ariestools/toolchain/docs/STABILITY.md:26-32; ariestools/toolchain/CHANGELOG.md:42; `xy deploy --help`, `xy publish --help` (10.1.1).
  - <sub>ids: skills/xy-toolchain/commands.md#7, cov-cli#8, cov-toolchain-history#13</sub>

- 🟠 **No recommended CI gate set**
  - **Now:** commands.md:42: "Run the gates required by the target repository or CI rather than treating one aggregate command as universal." No skill file describes a workflow, and toolchain.md:111-122 has no CI step.
  - **Actual:**
    - The ariestools repos converge on this sequence, with `NODE_OPTIONS=--max-old-space-size=8192`:
      1. `pnpm install --frozen-lockfile`
      2. `pnpm xy build --jobs 1`
      3. `pnpm exec playwright install chromium`, in browser-realm repos only
      4. `pnpm xy test`
    - No repo runs `xy check` in CI yet, although the roadmap expects it to.
    - Toolchain facts a CI author needs:
      - **Incremental build.** `xy build` is incremental, but a fresh checkout has no `.xy/cache/incremental` snapshot, so it does a full build. Do not restore a stale `.xy/cache`.
      - **Order.** `xy check` must run after build, because publint's `pub.platform` and `pub.publint` compare export maps with compiled output.
      - **`xy check` is not hermetic.**
        - `skills.required-current` fetches upstream SKILL.md. Offline it silently passes; online, a new upstream skill release can fail CI with no repo change.
        - There is no `--offline` flag on `xy check`.
        - `docs.stale` depends on today's date.
        - `docs.evidence-immutable` needs full git history (`fetch-depth: 0`).
      - **Jobs.** `--jobs` defaults to the runner's core count, and each lint worker inherits NODE_OPTIONS, which is why the repos pass `--jobs 1`. `xy test` ignores `--jobs`, and no environment variable sets it.
  - **Fix:** Add a "CI gates" subsection under Lifecycle gates, or a routed ci.md if it grows past about 30 lines, containing:
    - the order above;
    - the `--jobs` memory note and the fresh-snapshot note;
    - an optional `pnpm xy check --strict` after build, with the git-config step and caveats from the `--strict` item above;
    - "never `--fix` in CI";
    - take Node from package.json (`node-version-file`).

    Leave generic GitHub Actions hygiene out (permissions, triggers, action pins). Link the subsection from toolchain.md New project baseline step 9.
  - **Evidence:** ariestools/sdk-js/.github/workflows/verify.yml:1-52 (also sdk-react, browser-kit and cli-kit verify.yml); ariestools/toolchain/docs/ROADMAP.md:37,132-136; ariestools/toolchain/packages/toolchain/src/actions/build.ts:46-48,69-84; ariestools/toolchain/packages/toolchain/src/actions/incremental.ts:339,513; ariestools/toolchain/packages/toolchain/src/actions/skills/versions.ts:8-10,29-39,63; ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:286-306; ariestools/toolchain/packages/toolchain/src/xy/xyParseOptions.ts:88-91; ariestools/toolchain/packages/toolchain/src/actions/lintNextWorker.ts:547-556; ariestools/toolchain/packages/toolchain/src/actions/test.ts:11-14.
  - <sub>ids: gap-gap-ci-guidance#2</sub>

- 🟠 **Stable command settings for publint, apiExposure, license and packman are undocumented**
  - **Now:** absent. commands.md:125-139 and :159 describe what these commands do, and the Configuration example (:293-317) shows only dead and deplint.
  - **Actual:**
    - `commands.publint`: `include`/`exclude` check names, `pack` (default true), `rules` keyed `pub.<check>`. `publint: false` type-checks but is ignored.
    - `commands.apiExposure`: `packages[name].classification`, `peerForwarding` (`'when-exposed'` by default, or `'always'` / `'when-used'`), `peerWithDefault`, `rules`, `thresholds` (39/79/119/179), `treeShaking` (default true). Deplint also reads it under the aei/aei-next classifiers.
    - `commands.license`: `allow`, `allowOnly`, `deny`, `ignorePackages`.
    - `commands.packman`: `minimumReleaseAge` (default 1440) and `minimumReleaseAgeExclude`. The lint requires exactly the @ariestools / @xylabs / @xyo-network scopes the repo imports, whatever the JSDoc default says.
    - 10.1.1 adds `commands.updo.ignoreDeps`.
    - Usage: 12 workspace xy.config.ts files set publint and 6 set apiExposure.
  - **Fix:** Add a "Command settings reference" table with fields, defaults and a one-line example per command, including an `updo` row for toolchain ≥10.1.1. Warn that `commands.publint: false` does nothing (use `rules` or `exclude`), and point to `pnpm xy <cmd> --rules` for rule ids.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/PublintConfig.ts:6-23,79-105; ariestools/toolchain/packages/toolchain/src/actions/publint.ts:96-98,124; ariestools/toolchain/packages/toolchain/src/actions/package/compile/ApiExposureConfig.ts:13-121; ariestools/toolchain/packages/toolchain/src/actions/deplint/engine.ts:135-138; ariestools/toolchain/packages/toolchain/src/lib/licenseCheck/checkLicenses.ts:57-85; ariestools/toolchain/packages/toolchain/src/actions/releaseAgeExcludeScopes.ts:6,107-124; ariestools/toolchain/packages/toolchain/src/actions/packman/lint.ts:216-234; ariestools/sdk-js/xy.config.ts:5; XYOracleNetwork/plugins/packages/payloadset/xy.config.ts:13-27.
  - <sub>ids: cov-config#5</sub>

- 🟠 **The `xy work` section lacks the triage flags, lint rule ids, the tracked-store rule and the sync identity guarantee**
  - **Now:** commands.md:177-201 lists subcommands only. :179 is `pnpm xy work add bug "Describe the problem"` with no flags. :201: "Store health (gitignore, GitHub availability, sync drift)".
  - **Actual:**
    - `work add` takes `--description`, `--area`, `--tag`, `--file`/`--line`/`--inline` (on `add` only), `--acceptance` and `--verify` (both repeatable), `--impact`/`--urgency`/`--effort`/`--risk`/`--confidence` (each 1-5), and the workspace flags. `work update` takes the triage flags.
    - An open item missing area, priority, acceptance or verification counts as under-triaged.
    - Filters: `work list --status/--type/--sort created|priority`; `work queue --name/--limit/--status`.
    - `work done` requires `--evidence`.
    - Lint rules:
      - `work.store-not-gitignored` (error): `.xy/work` must be committed, the opposite of `.xy/cache`.
      - `work.github-available` and `work.github-synced` (warn).
    - Since 10.1.0, sync edits or closes a GitHub issue only when its body marker and stored URL match the local item.
    - `claim` records only a timestamp; it is not a lease.
    - The toolchain repo's unpublished `.agents/skills/xy-work/SKILL.md` already documents all of this, and xy-agent/auditing.md:104 depends on the triage fields.
  - **Fix:**
    - Port the xy-work content into commands.md, or into a routed work.md:
      - a capture example: `pnpm xyex work add bug "…" --area <a> --file <path> --line <n> --acceptance "…" --verify "pnpm xy build" --impact 4 --urgency 2`;
      - the under-triaged rule;
      - the list and queue filters;
      - the lint rule table;
      - ".xy/work is tracked; ignore only `**/.xy/cache/`";
      - the sync identity guarantee and the claim caveat.
    - Link it from xy-agent/auditing.md, then retire the local xy-work skill.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/lint.ts:151-172,194,210; ariestools/toolchain/packages/toolchain/src/actions/work/list.ts:175-178; ariestools/toolchain/packages/toolchain/src/actions/gitlintIgnore.ts:7-9; ariestools/toolchain/.agents/skills/xy-work/SKILL.md:24-56,112-150,164-173; ariestools/toolchain/docs/code-review-2026-10-06.md:76-83; ariestools/toolchain/docs/STABILITY.md:113; `xyex work add|list|queue|update|done --help`, `xyex work lint --rules` (10.1.1).
  - <sub>ids: skills/xy-toolchain/commands.md#11, cov-cli#20, cov-toolchain-history#14, arch-layering#22</sub>

- 🟠 **`npm-org lint` docs exist only as an edit to the toolchain repo's installed copy of this skill**
  - **Now:** absent. `grep -rn npm-org skills/` finds nothing.
  - **Actual:**
    - ariestools/toolchain/.agents/skills/xy-toolchain/commands.md:151-169 adds an "`xy npm-org lint` (experimental)" section. It covers the `npm-org.stale-usage` and `npm-org.stale-development` rules, `commands.npmOrgLint`, and the cache details.
    - It was committed into the installed copy in toolchain commits 5beae1203 and 9fe120837 (2026-09-13).
    - That copy no longer matches its skills-lock.json hash, and the next `xy skills update` will erase it.
    - toolchain/AGENTS.md:63 says only "This repo's `.agents/skills/` is local development", which invites such edits.
  - **Fix:**
    - Move the section into skills/xy-toolchain/commands.md (it already uses `pnpm xyex npm-org lint`) and release.
    - Then restore the pristine installed copy in the toolchain repo with `xy skills update`.
    - Add to toolchain/AGENTS.md:63: "Never edit installed skill files; change ariestools/ariestools-skills and release."
  - **Evidence:** `diff ariestools/toolchain/.agents/skills/xy-toolchain/commands.md skills/xy-toolchain/commands.md`; `git log -- .agents/skills/xy-toolchain/commands.md` in ariestools/toolchain; ariestools/toolchain/packages/toolchain/src/actions/npm-org/rules.ts:27-47; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:54-55; ariestools/toolchain/skills-lock.json.
  - <sub>ids: arch-distribution#6</sub>

- ⚪ **Stable maintenance commands are missing: install, reinstall, up, updo (with `ignoreDeps`), gitignore, npmignore-gen, statics, copy-assets**
  - **Now:** absent. No skill mentions any of these commands.
  - **Actual:**
    - All of these commands are stable.
    - `xy reinstall` runs `packman clean`, which deletes node_modules and lockfiles, then installs.
    - `xy gitignore` rewrites the root .gitignore and deletes package .gitignore files.
    - `xy up` is an outdated-dependency report.
    - `xy updo [--latest] [--next] [--risk green|yellow|red]` is the interactive updater. It caps typescript at major 6.
    - 10.1.1 adds the stable setting `commands.updo.ignoreDeps`:
      - Entries are exact package.json keys or positive globs; an `npm:` alias is matched by its alias key.
      - Root and package lists add together.
      - Matching declarations are kept out of the chooser and never rewritten, but the setting does not pin the installed tree.
      - updo does not read pnpm's `update.ignoreDeps`, while pnpm's `minimumReleaseAge` still filters candidate versions.
      - Invalid entries throw before any manifest is written.
      - dapp-kit is already adopting it.
  - **Fix:** Add a "Dependency maintenance and utilities" table with these commands, marking `reinstall` and `gitignore` as destructive. Add a `commands.updo` block, e.g. `updo: { ignoreDeps: ['satori', '@vendor/*'] }`, with the notes above.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:15-46; ariestools/toolchain/packages/toolchain/src/actions/reinstall.ts:1-11; ariestools/toolchain/packages/toolchain/src/actions/up.ts; ariestools/toolchain/packages/toolchain/src/lib/updo/majorCeiling.ts:16-28; ariestools/toolchain/packages/toolchain/src/lib/updo/ignoreDeps.ts; ariestools/toolchain/packages/toolchain/src/lib/updo/runUpdo.ts:159-173; ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:666-675,706; ariestools/toolchain/docs/xy-config.md:45,62-80; ariestools/toolchain/docs/STABILITY.md:64; `xy updo --help` (10.1.1); commit 8688075c9.
  - <sub>ids: cov-cli#14, gap-tc1011-other#1</sub>

- ⚪ **The experimental `xyex` commands have no catalog entry**
  - **Now:** absent. compilation.md:90 alludes to the shared validator without naming `tsc-validate`, and `orphan` appears only in xy-agent prose.
  - **Actual:**
    - These are available through `xyex`:
      - `plan init|lint`, covered in the agent item above.
      - `npm-org lint [org]`.
      - `orphan list|clean`: leftover dist after package moves; overlaps `xy clean --full`.
      - `enable ts-native [--no-install]`.
      - `tsc-validate [package]`.
      - `packman convert <pm>` and `packman clean`; the latter deletes node_modules and lockfiles.
      - `sonar`: quarantined, needs a local sonar.eslintrc, may be removed.
    - React repos also get the stable `xy start` and the experimental analyze, eject and sitemap. `start` and `eject` wrap CRA `react-scripts` and do not apply to Vite or Next.
  - **Fix:** After the channel subsection, add a compact "Experimental (xyex) commands" table with one line per command: purpose, invocation and hazard. Distinguish `plan lint` from the stable `xy agent lint`. Point to `pnpm xy --stability` and `pnpm xyex <cmd> --help` for flags rather than copying them.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:13-75; ariestools/toolchain/docs/STABILITY.md:81-102; ariestools/toolchain/packages/toolchain/src/xy/xy.ts (React commands register only when `isReactProject()`); ariestools/toolchain/packages/toolchain/src/actions/start.ts, ariestools/toolchain/packages/toolchain/src/actions/eject.ts; `xyex plan|npm-org|orphan|enable --help`, `xy packman --help` (10.1.1).
  - <sub>ids: skills/xy-toolchain/commands.md#8, cov-cli#9</sub>

## `skills/xy-toolchain/compilation.md`

### Update

- 🔴 **Root `compile` config does not cascade into a package that has its own xy.config.ts**
  - **Now:** compilation.md:29: "Root configuration cascades to packages under that root. Package-level configuration overrides or deep-merges the applicable root settings."
  - **Actual:**
    - Only `commands.*` merges root and workspace config, through loadWorkspaceCommandConfig/mergeCommandConfig.
    - `xy compile` spawns `package-compile` in each package directory (`pnpm --filter <pkg> exec run-or-exec package-compile`). That loads the nearest xy.config through a cosmiconfig search from the package directory.
    - So a package xy.config.ts replaces the root `compile` block entirely (compiler, node, validate, mode, bundlePackages…), and a package without one inherits the root file unchanged.
    - `compile.validator` is read from the root config only. The shared validator falls back to the root `compile.validate`.
    - Publint's expected-output check deep-merges root and package config, so it can disagree with what compile actually emitted.
    - ariestools/sdk-js and the toolchain repeat `compiler: 'native'` in every package config for this reason. ariestools/toolchain/packages/tsconfig/xy.config.ts holds only `commands` and silently loses the root compiler setting.
    - The toolchain's docs/xy-config.md:15 makes the same wrong claim. 10.1.1 did not change any of this.
  - **Fix:**
    - Replace :29 with: "`commands.*` settings cascade: root and package configs merge (arrays union, maps merge, `rules` replace per rule id). `compile` does not merge: each package compiles with the nearest xy.config file, so a package xy.config.ts replaces the root `compile` block. Repeat shared compile fields such as `compiler` in every package config that exists. Set `compile.validator` at the root only."
    - File toolchain issues for docs/xy-config.md:15 and for making publint's expected outputs match compile.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/compile.ts:16-19; ariestools/toolchain/packages/toolchain/src/lib/loadConfig.ts:52-59,61-93,195-245; ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:180-188; ariestools/toolchain/packages/toolchain/src/actions/compile.ts:345-355,417-445; ariestools/toolchain/packages/toolchain/src/actions/tsc-validate/tscValidate.ts:28-31; ariestools/toolchain/packages/toolchain/src/actions/package/expectedCompileOutputs.ts:83-88; cosmiconfig@10.0.1 dist/index.js:104,120; ariestools/sdk-js/xy.config.ts:4 and `ariestools/sdk-js/packages/*/xy.config.ts`.
  - <sub>ids: skills/xy-toolchain/compilation.md#0, cov-config#0</sub>

- 🟠 **Workspace `xy compile` emits first and validates second; the skill says the opposite**
  - **Now:** compilation.md:82: "By default, `xy compile` performs a no-emit TypeScript validation pass over the full package, including specs, stories, configs, and Storybook files, then emits package output…"
  - **Actual:**
    - Validate-then-emit holds only for a single-package `package-compile`, which is what `xy compile <pkg>` runs. Monolith mode syncs the layout, validates, then emits.
    - A workspace `xy compile`, `build` or `recompile` runs two phases:
      1. **Emit.** Every package emits in topological order (dependencies and devDependencies) with `--emit-only`. This skips the full-package validation, but tsc declaration emit still runs for each compiled source folder, so source type errors still fail emit and stop dependents.
      2. **Validate.** `--validate-only` runs per package, or the shared host runs once.
    - A workspace compile that fails validation can therefore leave fresh dist output.
    - With `compile.validate: false` the workspace path runs no extra check, while a single-package compile still runs a per-folder check.
  - **Fix:** Reword the Type validation paragraph along those lines. Also correct :134: declaration emit runs before esbuild in each folder, so a declaration failure prevents that folder's JavaScript emit.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/compile.ts:417-445,556-570; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:401-414,461-478; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:135-171.
  - <sub>ids: skills/xy-toolchain/compilation.md#2</sub>

- 🟠 **`entryMode` semantics are wrong for `auto` and incomplete for `custom` and monolith**
  - **Now:** compilation.md:58-64: "`custom` accepts explicit `{ in, out }` entries." and "`auto` lets the compiler derive the applicable shape."
  - **Actual:**
    - buildEntries has no `auto` branch, so `auto` falls through to `['index.ts']`, exactly like `single`.
    - `platform` means `index-node.ts` + `index-browser.ts`.
    - `all` means every source file except specs, stories and .d.ts; it is the default for `transpile`.
    - `custom` starts empty and uses only `compile.<platform>.<srcDir>.entry`, given as strings or `{ in, out }`.
    - `{ in, out }` in any other mode throws. In other modes, string `entry` items are appended to the mode's defaults.
    - Monolith throws if `compile.entryMode` or a per-platform `entry` is set.
  - **Fix:**
    - Rewrite the list: `single` (default, `src/index.ts`); `all`; `platform`; `custom`, with an example `{ entryMode: 'custom', node: { src: { entry: ['index-node.ts', { in: 'worker/w.ts', out: 'worker' }] } } }`.
    - Add "`auto` currently behaves like `single`; do not use it".
    - Note that `{in,out}` requires `custom`, that extra entries append in other modes, and that monolith rejects `entryMode` and `entry`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/buildEntries.ts:17-48; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:128-158; ariestools/toolchain/packages/toolchain/src/actions/package/compile/entryOutputName.ts:9-19; ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompileBundleOptions.ts:90-93; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:19-32; ariestools/sdk-js/packages/crypto/xy.config.ts, ariestools/sdk-js/packages/pixel/xy.config.ts.
  - <sub>ids: skills/xy-toolchain/compilation.md#3, cov-config#3</sub>

- ⚪ **Target objects are source-directory maps, not "options objects"**
  - **Now:** compilation.md:36: "Enable a target with `true` or a non-empty options object." compilation.md:35: "If no target is enabled, build `neutral`."
  - **Actual:**
    - The keys of a target object are source directories, e.g. `{ src: {} }` or `{ src: { entry: [...], ...esbuildOptions } }`.
    - So `node: { minify: true }` enables node, turns neutral off, finds no `minify/` directory, and silently emits nothing.
    - An object with only the legacy `esbuildOptions` key counts as disabled.
    - Neutral is the default only when `neutral` is unset; `neutral: false` with no other target builds nothing.
    - Shared esbuild overrides go in `compile.esbuild.options`. `compile.tsup.options` is deprecated but still honored.
  - **Fix:** Change :36 to: "Enable a target with `true` or a source-directory map such as `{ src: {} }` or `{ src: { entry: [...] } }`; the keys are source directories, not esbuild options." Add the `compile.esbuild.options` and `neutral: false` notes. Show the srcDir-map shape only once, shared with the entryMode example.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompilePlatforms.ts:14-22,35-57,79-83; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:237-243,292-297,427-443; ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:243-272.
  - <sub>ids: skills/xy-toolchain/compilation.md#4</sub>

- ⚪ **The bundle-mode default and the vendor-mode field set are not stated**
  - **Now:** compilation.md:71 and :76 describe the `bundlePackages` controls without defaults. :116-130 shows a vendor example with only `vendorPackages.scopes` and `selfScope`, plus "Compile workspace dependencies first".
  - **Actual:**
    - **Bundle selection.**
      - `mode: 'bundle'` with no `bundlePackages` rules defaults to `{ all: true }`, which inlines every npm package.
      - `library` mode also honors `bundlePackages` for selective inlining. `transpile` ignores it.
    - **Vendor fields.**
      - `vendorPackages.exclude` and `vendorPackages.conditionalSubpaths`.
      - `vendorBarrel.{runtime,model}` (defaults src/index.ts and src/model.ts).
      - `vendorDir` (default `_pkg`).
      - `vendorSyncExports` (default true; rewrites package.json exports).
      - A self-check that fails the compile on any leftover private-scope import.
    - **Ordering.** Vendored private packages must be `workspace:~` devDependencies of the umbrella, so that the topological emit orders them first.
    - **Current use.** No current @ariestools umbrella uses vendor mode (the sdk uses `mode: 'monolith'`), so the sdk-js example in docs/vendor-mode.md is stale.
  - **Fix:**
    - State the bundle default, and say to always pair `bundle` with explicit `scopes`, `workspace` or `external`.
    - Note that `library` plus `bundlePackages` is how to inline only selected packages.
    - Add a vendor field table with defaults and the devDependency ordering requirement.
    - Note that monolith is the mode current SDK umbrellas use.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompileBundleOptions.ts:72-78,95-115; ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:75-78,98-140,201-216; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileVendor.ts:14-15,55-62; ariestools/toolchain/packages/toolchain/src/actions/compile.ts:417-424; ariestools/toolchain/docs/vendor-mode.md:132-166,301-316; ariestools/sdk-js/packages/sdk/xy.config.ts:11.
  - <sub>ids: skills/xy-toolchain/compilation.md#6, cov-config#12, skills/xy-toolchain/compilation.md#9</sub>

### Add

- 🟠 **The experimental native compiler (`compile.compiler: 'native'`), `xyex tsc-validate`, and the shared validator's limits are missing**
  - **Now:** absent. compilation.md:84-93 covers `compile.validate`, the package-compile flags and `compile.validator`. It never mentions `compile.compiler`, `nativePackage`, `xyex enable ts-native` or `tsc-validate`.
  - **Actual:**
    - **Native compiler.**
      - `compile.compiler: 'typescript' | 'native'` (default `typescript`) selects which tsc runs type-check and declaration emit.
      - `native` runs TypeScript 7 (Go) under the alias `typescript-native: npm:typescript@~7.0.2`; `compile.nativePackage` overrides the alias name.
      - `pnpm xyex enable ts-native [--no-install]` adds the alias, sets the field and clears a shared validator.
      - It is experimental ("public examples must not require it"). It shipped 2026-08-10 (9.0.0) and is set in every ariestools/sdk-js and toolchain config.
    - **Shared validator.**
      - With `compiler: 'native'`, `validator: 'shared'` falls back to per-package validation with a warning.
      - `xy recompile` also accepts `--validator`.
      - `compile.validator` is read from the root config only.
    - **`xyex tsc-validate [package]`** runs the shared-host engine standalone as a type-check-only pass. It respects `compile.validate: false` and skips packages without a tsconfig.
  - **Fix:**
    - Under Type validation, add an "Experimental: compiler implementation" subsection covering the native compiler. Say the alias sits beside the JS `typescript` install, not instead of it, because ESLint, deplint and api-exposure still need the JS package. Tell agents to keep the field when they find it, and to repeat it in every package config (see the cascade item above).
    - Add one bullet each for the shared-validator native fallback, `xy recompile --validator`, and `pnpm xyex tsc-validate`. typescript.md:117 can link to this section.
    - Rewording :78 for `mode: 'tsc'` is optional polish; see Refuted.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:142-157,171-177; ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveTscBin.ts:15-35; ariestools/toolchain/packages/toolchain/src/actions/compile.ts:337-356; ariestools/toolchain/packages/toolchain/src/xy/build/recompileCommand.ts:12-26; ariestools/toolchain/packages/toolchain/src/actions/tsc-validate/tscValidate.ts:14-60; ariestools/toolchain/packages/toolchain/src/actions/enable/tsNative.ts:36-80,144-153; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:20,50,140-151; ariestools/toolchain/docs/xy-config.md:33-39; ariestools/toolchain/docs/STABILITY.md:57-59,98-99; ariestools/sdk-js/package.json:54; commit c2b9db449.
  - <sub>ids: skills/xy-toolchain/compilation.md#1, cov-config#2, cov-cli#17, cov-toolchain-history#15, skills/xy-toolchain/compilation.md#7, skills/xy-toolchain/typescript.md#5</sub>

- 🟠 **The monolith section omits most of the MonolithConfig surface and the layout sync behavior**
  - **Now:** compilation.md:97-110 names `modules`, `platforms` and `moduleLinkage`, the module options `export`/`model`/`subpaths`/`internal`/`reexport`, `copyEntries`, and `package-sync-layout [--check]`.
  - **Actual:**
    - **Options in real use.** Every real monolith config uses options the skill omits (sdk-js, storage-adapters, testing, and 13 sdk-react packages):
      - Module options: `barrel` (re-export from src/index.ts), `barrelFrom`, `shimFrom`.
      - Top-level options: `modulesPlatform` (default `'neutral'`; `'browser'` for React, used by 11 sdk-react packages), `conditionalImports` (package / tsconfig / distImports), `platformEntries`, `aliasImports`, `barrelImports`, `barrelPlatforms`, and `index.custom` / `index.entries`.
    - **Defaults.** `platforms` is `['neutral','node','browser']` and `moduleLinkage` is `'bundle'`.
    - **External linkage.** Every conditional import needs `distImports` or layout sync throws. Monolith compile also fails on any retained `#module` specifier that does not resolve through dist imports.
    - **Layout sync.**
      - Emit-mode `package-compile`, and so `xy compile`, re-syncs the layout automatically: package.json `imports`, tsconfig `paths`, src/index.ts, src/model.ts and the shims.
      - `--validate-only` never writes, so the generated files must be committed.
      - `package-sync-layout` reads the config of the current directory.
  - **Fix:**
    - Expand the section into a module-option and package-option table with defaults.
    - State that compiles re-sync automatically, that generated files must be committed, and that the drift check runs inside the package: `pnpm --filter <pkg> exec package-sync-layout --check`.
    - State the `distImports` and retained-specifier rules.
    - Point to ariestools/sdk-js/packages/sdk/xy.config.ts as the full reference and to an sdk-react package as the browser/React reference.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/MonolithConfig.ts:30-187; ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithCompileLayout.ts:130-133,281-320; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:105-171; ariestools/toolchain/packages/toolchain/src/bin/package/sync-layout.ts:11-23; ariestools/sdk-js/packages/sdk/xy.config.ts; ariestools/sdk-react/packages/sdk-react-core/xy.config.ts:76; XYOracleNetwork/plugins/packages/payloadset/xy.config.ts:3-9.
  - <sub>ids: skills/xy-toolchain/compilation.md#5, cov-config#4</sub>

- ⚪ **The monolith identity invariant and the 10.0.9 declaration sharing are not mentioned**
  - **Now:** compilation.md:99 already explains choosing `moduleLinkage: 'external'` to preserve runtime identity across `instanceof`, contexts, registries and singletons. Nothing covers the 10.0.9 declaration sharing or the external-linkage requirements.
  - **Actual:**
    - The linkage decision is documented accurately, so following the text does not give a wrong result. Two additions remain.
    - Declaration sharing hides duplication. Since 10.0.9, platform declaration trees reuse the modules-platform declarations. Under bundle linkage, tsc therefore no longer flags root-vs-subpath class mismatches, while the runtime copies remain. A simulation on the sdk 9.0.1 dist removed 482 platform copies, tsc reported no errors, and `root.PromiseEx === /promise.PromiseEx` was still false.
    - External linkage has declaration rules. A real platform variant is declared in both `conditionalImports` and `platformEntries`, never as a forwarding shim. Layout sync warns on identity splits, and `pub.importsMatchExports` errors on them.
    - Resolved: a round-1 finding rated this medium. The 10.1.1 gap check showed that the existing linkage guidance is correct, so it is low.
  - **Fix:**
    - Add to the Monolith section: "Since 10.0.9, platform declaration trees reuse the modules-platform declarations, so each class has one declaration. Under bundle linkage this hides runtime duplication from tsc: choose `external` for any package that exports classes, contexts or module state across subpaths. External linkage requires `conditionalImports.<m>.distImports`, and a real platform variant must be declared in both `conditionalImports` and `platformEntries`; `pub.importsMatchExports` fails a mismatch."
    - Tell agents not to hand-copy .d.ts files.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:119-123; ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithDedupeDeclarations.ts:7-28; ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithLayoutLint.ts:91; ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithCompileLayout.ts:131; ariestools/toolchain/papers/YELLOW-PAPER.md:284-288; ariestools/toolchain/CHANGELOG.md:20-21,27; commits 6e056462a, 92cf6bce9, d0f17a92d → v10.0.9.
  - <sub>ids: cov-toolchain-history#6, gap-gap-sdk-subpath-identity#3</sub>

- ⚪ **The emit engine (esbuild plus tsc) and its override surface are not named**
  - **Now:** absent. compilation.md:56 only says not to describe the output as dist/esm + dist/cjs.
  - **Actual:**
    - `xy compile` emits JavaScript with esbuild: bundled, ESM `.mjs`, sourcemaps, `target: 'esnext'`, and `packages: 'external'` in library mode.
    - It emits `.d.ts` with tsc, or with the native compiler.
    - Overrides merge from `compile.esbuild.options`, the deprecated `compile.tsup.options`, and per-srcDir options. Legacy tsup keys (`dts`, `clean`, a top-level `entry`, …) are ignored.
    - Since 10.1.0, every configured source dir, entry, outdir/outfile and inject path must resolve inside the package, or compile throws.
  - **Fix:** Add a one-paragraph "Emit engine" note: esbuild for ESM `.mjs` plus tsc for `.d.ts`; put overrides in `compile.esbuild.options`, not `tsup.options`; every configured path must stay inside the package directory.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:38-46,119-126,214-230,252-271,354-378,436-443; ariestools/toolchain/architecture.md:40; commit e7ea93749 (10.1.0).
  - <sub>ids: skills/xy-toolchain/compilation.md#8</sub>

- ⚪ **Troubleshooting omits the publint rules that catch monolith export and `#alias` drift**
  - **Now:** compilation.md:134: "inspect packed files, export maps, and remaining bare internal imports."
  - **Actual:**
    - `pub.platform` (error, fixable) requires export maps to match every compiled output, including monolith barrels, model/value subpaths, platformEntries shims and copyEntries.
    - `pub.importsMatchExports` (error, not fixable) catches `#alias`/subpath identity splits.
    - Monolith compile itself fails on `#` specifiers left in dist that do not resolve.
  - **Fix:** Add: "run `pnpm xy publint` and read the `pub.platform` / `pub.importsMatchExports` findings before hand-editing exports; `xy publint --fix` can add missing monolith subpaths but will not add conditions that the `#alias` does not select."
  - **Evidence:** `xy publint --rules` (10.1.1); ariestools/toolchain/CHANGELOG.md:19,26; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:130-132.
  - <sub>ids: skills/xy-toolchain/compilation.md#11</sub>

- ⚪ **XyConfig fields that type-check but do nothing are not called out**
  - **Now:** absent.
  - **Actual:**
    - `dev.*` (`dev.compile`, `dev.build.*`), `compile.bundleTypes` and `compile.outDirAsBuildDir` type-check, but no xy command reads them. For example, XYOracleNetwork/xyo-chain/packages/cli/xy.config.ts:22-35 puts its entry and esbuild `define` under `dev.compile`, so neither is applied.
    - Top-level `liveShare` and `dynamicShare` are also not read by xy. They are pass-through settings for @xylabs/meta-server, which reads them from a generated build/xy.config.json.
  - **Fix:**
    - Under Configuration, add: "`dev` (including `dev.compile` and `dev.build.*`), `compile.bundleTypes` and `compile.outDirAsBuildDir` are not read by any xy command; put compile settings under `compile`."
    - Add: "`liveShare` and `dynamicShare` are meta-server pass-through settings; do not remove them as dead config."
    - Optionally tell the xyo-chain owners about their `dev.compile` block.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts (`dev`, `liveShare`, `dynamicShare`, `bundleTypes`, `outDirAsBuildDir` declarations); a grep of ariestools/toolchain/packages/toolchain/src finds no readers; XYOracleNetwork/xyo-chain/packages/cli/xy.config.ts:22-35.
  - <sub>ids: cov-config#13</sub>

## `skills/xy-toolchain/eslint.md`

### Update

- 🔴 **A local `no-restricted-imports` block silently replaces the shared barrel and `src/` import bans, including the block `xy lint init` generates**
  - **Now:** eslint.md:22: "derives root-barrel import restrictions from installed SDK barrels". eslint.md:130: "Place justified local overrides after the recommended config. Run `xy lint lint` to distinguish intentional additions from redundant shared rules and overrides requiring review."
  - **Actual:**
    - **The shared rule.** The tier-0 config sets `no-restricted-imports` at error with the `./index.ts` … `../../../../../../../index.ts` barrel paths, plus `**/src/**` patterns for files under `src/`.
    - **The replacement.** In flat config, a later entry with options replaces the earlier options entirely. Accepting a barrel prompt in `xy lint init` appends an unscoped `['warn', { paths: [...barrels] }]` block. For src/index.ts, the effective rule drops from `[2, {paths: [./index.ts…], patterns: [**/src/**…]}]` to `[1, {paths: [@xylabs/hex…]}]`.
    - **No workaround via scoping.** Scoping the block with `files` does not help; this was tested at error level in webble's form.
    - **Not reported.** `xy lint lint` deliberately exempts this block (isLintInitBarrelRestriction), so nothing reports it.
    - **Impact.** This defeats the workspace policy against barrel index.ts imports. XYOracleNetwork/xl1-faucet-twitter and XYOracleNetwork/webble already ship such blocks.
  - **Fix:**
    - Next to :22 and in "Overrides and troubleshooting" (:130), add a caution: any later `no-restricted-imports` entry with options replaces the shared `paths` and `patterns`, even when scoped with `files`. The block `lint init` generates does exactly this, and `xy lint lint` does not report it.
    - Tell agents to put barrel steering under a different rule id. `@typescript-eslint/no-restricted-imports` was tested and leaves the core rule intact.
    - The alternative is to rebuild the shared options from the exported `correctnessRulesConfig` (all files) and `srcImportsConfig` (src files only, same `files` glob) at error, adding the barrel paths to both.
    - Flag a toolchain fix for lint-init and for the lintlint exemption.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/rules/correctness.ts:5-28; ariestools/toolchain/packages/eslint-config-flat/src/rules/index.ts:19-56; ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:46; ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:132-138; ariestools/toolchain/packages/toolchain/src/actions/lintlint.ts:183-191,213; ESLint 10.12 `calculateConfigForFile('src/index.ts')` probes against the 10.1.1 dist; XYOracleNetwork/xl1-faucet-twitter/eslint.config.ts:145-150; XYOracleNetwork/webble/eslint.config.ts:67-70.
  - <sub>ids: skills/xy-toolchain/eslint.md#0</sub>

- 🟠 **`xy lint init` is described as automatic; it is interactive, offers deprecated or nonexistent barrels, and may install them**
  - **Now:** eslint.md:16-22: "It detects React, installs the applicable config package and ESLint, generates `eslint.config.ts`, … and derives root-barrel import restrictions from installed SDK barrels. Review the generated diff before accepting an overwrite."
  - **Actual:**
    - The command has no flags and no non-interactive mode.
    - It asks "Replace it with eslint.config.ts? (y/N)" before generating anything, so there is no diff to review at that point.
    - It then asks one y/N per hard-coded barrel:
      - @xylabs/sdk-js (deprecated; use @ariestools/sdk)
      - @xylabs/sdk-react (deprecated; use @ariestools/sdk-react)
      - @xyo-network/sdk-js (deprecated; use @xyo-network/sdk)
      - @xyo-network/react-chain (npm E404)
      - @xyo-network/xl1-sdk, @xyo-network/chain-sdk, @xyo-network/react-sdk
    - @ariestools/sdk is not offered.
    - Accepting a barrel that is not installed adds it at `latest` and runs install.
    - It deletes a legacy eslint.config.mjs and writes `eslint: ^10.0.0`, which is below the config packages' peer floor of ^10.3.
  - **Fix:**
    - Rewrite :22: the command is interactive (an overwrite confirmation plus per-barrel prompts).
    - Tell agents to decline the deprecated @xylabs/\* and @xyo-network/sdk-js barrels, since accepting installs them at `latest`, contrary to SKILL.md:12.
    - Say that @ariestools/sdk restrictions are not generated and that the legacy .mjs config is removed.
    - Review with `git diff` afterwards. In a non-interactive agent shell, ask the user to run it, or hand-write the documented template.
    - Raise the barrel list with the toolchain.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:21-29,56-82,201-215,243-268,280; ariestools/toolchain/packages/toolchain/src/xy/lint/lint/initCommand.ts:6-13; `npm view @xylabs/sdk-js deprecated`, `npm view @xylabs/sdk-react deprecated`, `npm view @xyo-network/sdk-js deprecated`, `npm view @xyo-network/react-chain` (E404).
  - <sub>ids: skills/xy-toolchain/eslint.md#1, cov-configpkgs#1</sub>

- 🟠 **Config-package peer ranges are not stated: eslint ^10.3, eslint-import-resolver-typescript ^4.4, vitest ^5**
  - **Now:** eslint.md:14: "The current packages target ESLint 10". testing.md:27: "(peer: `vitest`)". toolchain.md:41-44 lists only Node and TypeScript, and the install line leaves out eslint.
  - **Actual:**
    - @ariestools/eslint-config-flat and -react-flat peer on `eslint ^10.3` and `eslint-import-resolver-typescript ^4.4`; the import config sets `import-x/resolver: { typescript }`.
    - `xy lint init` adds neither the resolver nor eslint ≥10.3, and `xy deplint` reports the resolver missing.
    - @ariestools/vitest-config peers on `vitest ^5.0` (since 2026-09-05), so repos on Vitest 4 must upgrade vitest and @vitest/browser-playwright together.
    - @ariestools/toolchain peers on `eslint ^10.3` and `typescript ^5.9 || ^6.0`.
  - **Fix:**
    - Replace eslint.md:14 with the exact peers.
    - Add a manual install line `pnpm add -D @ariestools/eslint-config-flat eslint eslint-import-resolver-typescript` (React: use the react-flat package), and a note after :22 to add the resolver after running `lint init`.
    - Change testing.md:27 to "peer: `vitest` ^5.0; `@vitest/browser-playwright` must match the Vitest major".
    - Add `eslint` to the toolchain.md:44 install line.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/package.json:71-74; ariestools/toolchain/packages/eslint-config-react-flat/package.json:71-72; ariestools/toolchain/packages/eslint-config-flat/src/import/index.ts:24; ariestools/toolchain/packages/vitest-config/package.json:61-62; ariestools/toolchain/packages/toolchain/package.json:106-112; ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:76-82; ariestools/toolchain/packages/toolchain/src/actions/deplint/implicitDevDependencies.ts:100-105; `npm view @ariestools/eslint-config-flat@latest peerDependencies`, `npm view @ariestools/vitest-config@latest peerDependencies`, `npm view @ariestools/toolchain@latest peerDependencies`.
  - <sub>ids: skills/xy-toolchain/eslint.md#2, cov-configpkgs#12, skills/xy-toolchain/toolchain.md#5, skills/xy-toolchain/testing.md#6</sub>

- 🟠 **The tier severity description is stale after the unicorn v77 staging in 10.1.0**
  - **Now:** eslint.md:96: "Tier 3 and 4 additions commonly begin as warnings." eslint.md:94: "4 | Experimental/canary rules for migration testing".
  - **Actual:**
    - Moving from tier 2 to tier 3 turns 38 rules into errors (29 off→error, 9 warn→error) and adds only 22 warnings. The new errors include the opinionated unicorn preset, `@typescript-eslint/strict-boolean-expressions`, `unicorn/filename-case`, and `workspaces/no-relative-imports` / `require-dependency`.
    - Moving from tier 3 to tier 4 adds 68 warnings and promotes 22 unicorn v77 rules from warn to error. The v77 rules are off at tier 2, warn at tier 3 and error at tier 4.
    - So moving to tier 4 can fail lint even without `--strict`.
  - **Fix:** Replace :96 with that summary, and point to `xy lint --analyze` to preview the impact before changing tier.
  - **Evidence:** `calculateConfigForFile` against the eslint-config-flat 10.1.0 dist (tier 2→3: off→error 29, warn→error 9, off→warn 22; tier 3→4: off→warn 68, warn→error 22); ariestools/toolchain/packages/eslint-config-flat/src/tiers/tier-builder.ts:87-110; ariestools/toolchain/packages/eslint-config-flat/src/tiers/opinionated.ts:72-77,134-148; ariestools/toolchain/packages/eslint-config-flat/src/unicorn/index.ts:243-277,332-338; commit a499070cc (10.1.0).
  - <sub>ids: cov-configpkgs#2</sub>

- ⚪ **JSON linting is opt-in, and the template differs from the generator output it calls canonical**
  - **Now:**
    - eslint.md:109: "composes TypeScript ESLint, core JavaScript/JSON/Markdown rules, …".
    - :28-36: "Use the generator's output as canonical", followed by a minimal ignores list.
    - :70: "Add `configReactStorybook` explicitly only when Storybook files need that layer".
  - **Actual:**
    - recommendedConfig composes Markdown at tier 0 but no JSON.
    - `jsonConfig`, `jsoncConfig` and `json5Config` (duplicate-key checks) and `docsConfig` (Markdown plus JSON) are exported for opt-in, and nothing generates them.
    - The generator's ignores add `.yarn/**`, `**/node_modules/**`, `**/*.md` and `.claude/worktrees/*`. Generated configs, including those in sdk-js and cli-kit, therefore never lint Markdown, while the hand-written template would.
    - For React, the generator always spreads `...configReactStorybook`.
  - **Fix:**
    - Change :109 to "core JavaScript and Markdown rules", and note that JSON/JSONC/JSON5 checks are opt-in via `jsonConfig`/`jsoncConfig`/`json5Config` or `docsConfig`.
    - Either copy the generator's ignores into the template, or state that generated configs ignore `**/*.md`.
    - Say that `lint init` always adds `configReactStorybook` for React, and that it can be removed when there are no stories.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/tiers/tier-builder.ts:37-43,117-126; ariestools/toolchain/packages/eslint-config-flat/src/index.ts:9-14; ariestools/toolchain/packages/eslint-config-flat/src/json/index.ts:6-28; ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:107-114,129-130; ariestools/sdk-js/eslint.config.ts:14; ariestools/cli-kit/eslint.config.ts:14.
  - <sub>ids: skills/xy-toolchain/eslint.md#5, cov-configpkgs#11, skills/xy-toolchain/eslint.md#6</sub>

### Add

- 🟠 **No list of the high-impact rules agents hit at the default tier**
  - **Now:** absent. eslint.md:84-111 describes tiers and plugin families only, and skills/xy-development/typescript.md:5 defers lint-enforced opinions to ESLint.
  - **Actual:** At tier 3 with type checking, these rules are errors:
    - `strict-boolean-expressions` — this is why toolchain code writes `isVerbose === true`.
    - `no-explicit-any`.
    - `consistent-type-definitions` — use `interface`.
    - `unicorn/import-style` and `prefer-node-protocol` — `import PATH from 'node:path'`.
    - `unicorn/prefer-export-from`.
    - `no-restricted-imports` — no barrels, no other package's `src/`.
    - complexity 18, max-depth 6, max-lines 512, max-statements 32.
    - member-ordering.
    - `unicorn/filename-case`.
    - `workspaces/no-relative-imports` and `require-dependency`.
    - `no-floating-promises` and `no-misused-promises`.

    The catalog intends five more rules as tier-3 errors: `consistent-type-imports`, `simple-import-sort`, `@stylistic/max-len` 200, `explicit-member-accessibility` (no-public) and the enum ban. Today they resolve to warn because of `options ?? severity` in rule-catalog/index.ts:61.
  - **Fix:**
    - Add a section, "Rules you will hit at the default tier (3)", listing the errors with a one-line fix for each.
    - Add a "fix these too" list for the five-rule group, without stating a severity.
    - Tell agents to run `xy lint --rules` for current effective levels.
    - Add a cross-reference sentence in skills/xy-development/typescript.md.
    - Raise the managed-rules severity bug with the toolchain.
  - **Evidence:** effective tier-3 config via `calculateConfigForFile` (eslint-config-flat 10.1.0 dist); ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:46-58,64-131,149-152; ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/index.ts:61; ariestools/toolchain/packages/eslint-config-flat/src/rules/index.ts:8-56; ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:117-170.
  - <sub>ids: cov-configpkgs#3</sub>

- ⚪ **The commands table lacks `--mode`, `--meta`, `--no-cache`, `--skip-empty`, `xy cycle`, the `relint` deprecation and the performance controls**
  - **Now:** eslint.md:115-124 lists `--fix`, `--fresh`, `--analyze`, `--no-gitignore`, `lint lint` and `--rules`. SKILL.md:38 routes "diagnosing lint performance" to this file.
  - **Actual:**
    - `xy lint --mode` takes one of three values:
      - `package-workers`, the default;
      - `shared-typecheck`, an experimental config surface whose semantic phase skips the ESLint cache;
      - `workspace-eslint`, the direct ESLint CLI.

      The hidden `--next` and `--prev` flags are deprecated aliases.
    - Other flags: `--meta full|skip`, `-c/--no-cache`, and `--skip-empty` / `--no-skip-empty`.
    - `xy relint` is deprecated in favor of `xy lint --fresh`.
    - Since 10.0.8, lint workers are recycled when they pass an RSS budget, `XY_LINT_WORKER_MAX_RSS_MB` (default 2048). The toolchain does not document this variable.
    - The stable `xy cycle [package] [--depth 25]` runs `import-x/no-cycle` deeper than the shared tier-2 maxDepth of 5.
  - **Fix:**
    - Add rows for `--mode` (marking shared-typecheck experimental), `--meta skip`, `--no-cache`, `--no-skip-empty` and `xy cycle`, plus a note that `relint` is deprecated.
    - Add a short Performance note that cross-references the global `--profile` and `--jobs` flags in commands.md.
    - Mention the RSS variable only as an undocumented budget, or leave it out until the toolchain documents it.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/lint/lint/runCommand.ts:17-105; ariestools/toolchain/packages/toolchain/src/actions/lintMode.ts:1-44; ariestools/toolchain/packages/toolchain/src/actions/lintNextWorker.ts:381-382; ariestools/toolchain/packages/toolchain/src/xy/lint/cycleCommand.ts:9-50; ariestools/toolchain/packages/toolchain/src/actions/lint.ts:219-225; ariestools/toolchain/packages/eslint-config-flat/src/import/index.ts:35-38; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:25,30,160; ariestools/toolchain/docs/STABILITY.md:61; `xy lint --help`, `xy cycle --help`, `xy relint --help` (10.1.1); commit bc8e52802 (10.0.8).
  - <sub>ids: skills/xy-toolchain/eslint.md#3, cov-cli#15, cov-config#14, cov-configpkgs#13, cov-toolchain-history#16, skills/xy-toolchain/eslint.md#9</sub>

- ⚪ **An all-workspace `xy lint` is incremental by default and can lint nothing; troubleshooting does not say so**
  - **Now:** eslint.md:132: "If no files are linted, verify workspace discovery, source globs, meta-package handling, and `--skip-empty`." commands.md:27 limits `--no-incremental` to compile/build.
  - **Actual:**
    - With no package, no `--fix` and no `--analyze`, `xy lint` lints only the workspaces changed since the last clean snapshot.
    - When none changed, it prints "No changed packages to lint." and exits 0.
    - `--no-incremental` or `--fresh` forces a full run.
    - Publint is incremental by default as well.
  - **Fix:** Add this to the eslint.md troubleshooting section, and widen commands.md:27 so `--no-incremental` also covers lint and publint.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/lint/lint/runCommand.ts:27-32,77-88,124; ariestools/toolchain/packages/toolchain/src/actions/lint.ts:94-98,154-156; ariestools/toolchain/packages/toolchain/src/actions/relint.ts:53-57; ariestools/toolchain/packages/toolchain/README.md:262-263.
  - <sub>ids: skills/xy-toolchain/eslint.md#4</sub>

- ⚪ **`xy lint lint` coverage is thin**
  - **Now:** eslint.md:122-123: "Check the local config against toolchain conventions" / "Normalize supported config-package, rule, and `.gitignore` issues".
  - **Actual:**
    - Four rules, all at warn:
      - `lintlint.config-package` (fixable): rewrites `@xylabs/eslint-config(-react)-flat` imports and devDependencies to `@ariestools/*`, then runs install.
      - `lintlint.gitignore` (fixable).
      - `lintlint.redundant-rule` (fixable).
      - `lintlint.rule-override` (report only).
    - Levels are set via `commands.lintLint.rules`, and `xy check` runs lint lint.
    - Redundant-rule and override detection compares against the deprecated `config` export, which is tier 2 type-checked (plus Storybook for React), not the repo's chosen tier. Local settings for tier-3/4-only rules therefore show up as additions.
  - **Fix:**
    - List the four rule ids and `xy lint lint --rules`, and mention `commands.lintLint.rules`.
    - Say that `xy lint lint --fix` is the migration path off the retired @xylabs config packages; this also covers :24.
    - Note the tier-2 baseline.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/lintlint.ts:127-130,274-301,328-405; ariestools/toolchain/packages/toolchain/src/actions/barrel/restrictionHelpers.ts:28-33; ariestools/toolchain/docs/xy-config.md:45; ariestools/toolchain/packages/eslint-config-flat/src/tiers/index.ts:85; `xy lint lint --rules` (10.1.1).
  - <sub>ids: skills/xy-toolchain/eslint.md#7</sub>

- ⚪ **`--fresh` silently drops `--fix`, `--type-checked`, `--analyze`, `--skip-empty` and `--meta`**
  - **Now:** eslint.md:119: "Clear lint caches and run from a fresh snapshot". eslint.md:126 recommends `--fresh` after config changes.
  - **Actual:** With `--fresh`, runCommand calls only `relint({ gitignore, jobs, mode, pkg, verbose })`. That runs lint with `cache: false` and no fix, so `xy lint --fresh --fix` fixes nothing. This is a toolchain defect.
  - **Fix:** Note that `--fresh` should be run on its own, followed by a separate `xy lint --fix` or `--type-checked` run if needed. Optionally file the toolchain issue.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/lint/lint/runCommand.ts:108-116; ariestools/toolchain/packages/toolchain/src/actions/relint.ts:45-57.
  - <sub>ids: skills/xy-toolchain/eslint.md#8</sub>

- ⚪ **Troubleshooting omits the exported type-check gate layer for files outside every tsconfig**
  - **Now:** eslint.md:132: "verify the applicable tsconfig before disabling type checking."
  - **Actual:** eslint-config-flat exports `buildTypeCheckGateLayer()`, plus `collectTypeCheckedRuleNames` and `findEnabledTypeCheckedRules`, to switch off only the type-aware rules for a file glob. The toolchain's own eslint.config.ts uses it. eslint-config-react-flat does not re-export it.
  - **Fix:** Add an example: `{ files: [...], languageOptions: { parserOptions: { projectService: false, project: false } }, rules: buildTypeCheckGateLayer().rules }`, imported from @ariestools/eslint-config-flat. Note that React repos must then also list eslint-config-flat as a direct devDependency.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/index.ts; ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/index.ts:77-82; ariestools/toolchain/eslint.config.ts:17-28; ariestools/toolchain/packages/eslint-config-react-flat/src/index.ts:1-2.
  - <sub>ids: cov-configpkgs#14</sub>

## `skills/xy-toolchain/project-profiles.md`

### Update

- ⚪ **The role auto-detection rules are undocumented: library/cli, tooling, app, and the fallbacks**
  - **Now:** :25: "A package with both `bin` and an importable public API is **library/CLI**". Also :49. :63: "Deplint auto-detects a **role**… (`library`, `library/cli`, `cli`, `service`, `app`, `workspace-root`, `tooling`)". Also :79.
  - **Actual:**
    - **Detection order:**
      1. workspace-root
      2. library or library/cli
      3. cli
      4. private with a node/tsx start entry → service
      5. private with a framework dependency (vite, vite-node, next, nuxt, @sveltejs/kit, @remix-run/dev, react-scripts) → app
      6. any other private package → service
      7. otherwise → library
    - **library/cli.** With `bin`, `library/cli` is detected only from `main`, `module`, or an export subpath other than `.`, `./package.json` and `./README.md`. A bin with only a `.` export, a string `exports`, or only `types` is classified `cli`; the toolchain package itself is classified `cli`.
    - **tooling.** `tooling` is never auto-detected. Its defaults are runtimeEntry `'none'` and prodInstallMatters false.
  - **Fix:**
    - Add an "Auto-detect order" list after :63.
    - Note that a bin package whose `.` export is a real importable API should set `commands.deplint.role: 'library/cli'`.
    - State that `tooling` must be set explicitly, and that a tooling package with a shipped bin also needs `prodInstallMatters: true, runtimeEntry: 'manifest'`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/isTerminalPackage.ts:76-94,135-176,282-304; ariestools/toolchain/packages/toolchain/spec/deplint/isTerminalPackage.spec.ts:111-145; read-only classifier run (ariestools/toolchain/packages/toolchain → `cli`; ariestools/sdk-meta-server-nodejs → `library/cli`); toolchain doc drift at ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.md:84,113.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#1, skills/xy-toolchain/project-profiles.md#4</sub>

- ⚪ **The description of `prodInstallMatters` and the trusted graph is inaccurate**
  - **Now:** :75: "for roles where `prodInstallMatters` is true (`service`, many CLIs), demotion (`move-to-dev`) is allowed only when the analyzer has real entry roots (manifest, `bin`, start scripts, or framework entries → reachable files)". :71 for `app`: "test-only tooling may move to dev".
  - **Actual:**
    - prodInstallMatters defaults to true for `service`, `cli`, `library/cli` and `app` — every CLI, not "many".
    - runtimeEntry `'framework'` is currently the same as manifest plus start scripts; no framework entries are discovered.
    - Trust is based on declared root strings (or runtimeEntry `'none'`), not on reachable files.
    - A typical Vite or Next app therefore has an untrusted graph, and `move-to-dev` is suppressed until `runtimeRoots` is set.
  - **Fix:** Rewrite :75 as "prodInstallMatters defaults to true for `service`, `cli`, `library/cli` and `app`; `move-to-dev` is then allowed only when declared runtime roots exist (manifest/bin/start-script entries or `runtimeRoots`); framework entries are not auto-discovered." At :71, add "set `runtimeRoots` (e.g. `src/main.tsx`) for demotion to apply."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/isTerminalPackage.ts:99-149,388-395; ariestools/toolchain/packages/toolchain/src/actions/deplint/findFiles.ts:330,352-353,386-389; ariestools/toolchain/packages/toolchain/src/actions/deplint/snapshot.ts:259-261.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#5</sub>

- ⚪ **The role override example pairs `compile.node: true` with a `dist/neutral` runtime root**
  - **Now:** :86-96: `role: 'service'` with `// runtimeRoots: ['dist/neutral/index.mjs']`, next to `compile: { node: true }`.
  - **Actual:**
    - Enabling any target turns every unlisted target off, so `{ node: true }` emits `dist/node/…` and no `dist/neutral`.
    - A missing root still counts as declared and trusted, so the example points at a file that will not exist.
    - DeplintConfig also accepts `hasImportConsumers`, `allowMoveToDev` and `peerTarget`, which the example omits.
  - **Fix:** Use `runtimeRoots: ['dist/node/index.mjs']`, or a source entry such as `src/index.ts`. Add commented `hasImportConsumers`, `allowMoveToDev` and `peerTarget` lines, or link the facet list in commands.md.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:237-246,441-520; ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.md:135-145.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#6</sub>

### Add

- 🔴 **Single-package pnpm repos without exports or bin are auto-classified as `workspace-root`, and the skill never says to set a role**
  - **Now:** :63: "Deplint auto-detects a **role**". :70 implies a `scripts.start` service is detected. :72 describes `workspace-root` as "Monorepo root / meta package". The single-package steps (:108-115) never mention roles. See also :129.
  - **Actual:**
    - detectRole checks for a workspace marker (a `workspaces` field, or a pnpm-workspace.yaml/.yml) before it checks for service or app.
    - Any such package with no library or bin surface becomes `workspace-root`: runtimeEntry `'none'`, prodInstallMatters false, a trusted graph, and no source fallback.
    - Every pnpm repo must keep a pnpm-workspace.yaml, because packman lint errors without one.
    - A single-package private service or app is therefore classified `workspace-root`. `xy fix` (which runs `deplint --fix`) then demotes its runtime dependencies to devDependencies, breaking prod and Docker installs.
    - A read-only run reproduced this on xylabs/api-coin-xl1, xylabs/web-xylabs.com-react and XYOracleNetwork/app-portal.xyo.network-react. XYOracleNetwork/api-automation-witness-nodejs already works around it.
  - **Fix:**
    - Add to "Single-package repository": "If the root package has no `main`/`module`/`exports` and no `bin` (a typical service, app or tooling repo), set `commands.deplint.role` in the root xy.config.ts, e.g. `{ role: 'service', runtimeRoots: ['src/index.ts'] }`. Deplint classifies any package directory with pnpm-workspace.yaml (which packman lint requires) or a `workspaces` field and no library or bin surface as `workspace-root`, and that role demotes runtime dependencies aggressively."
    - Reword :72 and :129 to match.
    - Consider a toolchain issue: an empty `packages:` list should not mean workspace-root.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/isTerminalPackage.ts:142-148,234-242,282-285; ariestools/toolchain/packages/toolchain/src/actions/deplint/snapshot.ts:259-261,271-273; ariestools/toolchain/packages/toolchain/src/actions/deplint/getExternalImportsFromFiles.ts:126-128; ariestools/toolchain/packages/toolchain/src/actions/deplint/checkPackage/getUnusedDependencies.ts:40-55; ariestools/toolchain/packages/toolchain/src/actions/packman/lint.ts:147-152,170-172,321-333; ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:55-63; ariestools/toolchain/packages/toolchain/src/actions/fix.ts:21; XYOracleNetwork/api-automation-witness-nodejs/xy.config.ts:6.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#0</sub>

## `skills/xy-toolchain/testing.md`

### Update

- 🔴 **Workspace-scoped test runs skip the root `@ariestools/vitest-config` preset**
  - **Now:** testing.md:175: `pnpm xy test @scope/package`. :183: `pnpm xy retest @scope/package`. :186: "invoke the installed Vitest through the package manager in the correct package". The same file recommends one root preset config for monorepos (:25, :98).
  - **Actual:**
    - A workspace target runs `pnpm --filter <name> exec run-or-exec vitest .` (`retest` clears the cache first), so Vitest starts in the package directory.
    - Vitest 5.0.3 looks for a config file only in cwd or `--root`, never in parent directories. So the root preset is never loaded, and the run loses:
      - the browser project;
      - spec/node and spec/browser routing, so browser specs run in plain Node (e.g. sdk-js packages/sdk/src/spec/browser/readResponseText.spec.ts calls `document.createElement`);
      - `watch: false`, so `vitest .` starts watch mode in a TTY;
      - the `**/.claude/**` exclude;
      - root setup such as sdk-js's dotenv load.
    - A path that exactly matches a workspace location (e.g. `packages/foo`) also resolves as a workspace.
    - None of sdk-js, sdk-react, actor-kit, browser-kit or cli-kit has a package-level vitest config.
  - **Fix:**
    - State that under a root preset, scoped runs must start from the directory that holds vitest.config.ts. Use a path that is not exactly a workspace location (`pnpm xy test packages/example/src`), or run `pnpm exec vitest run packages/example/` from the root, adding `--project node|browser` when needed.
    - Change "in the correct package" to "from the directory containing vitest.config.ts (the repo root under the preset)".
    - Keep `xy test @scope/package` / `xy retest @scope/package` only with a caveat that they use only a package-level config.
    - Optionally raise a toolchain issue to pass `--root`/`--config` in workspace mode.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/test.ts:10-11; ariestools/toolchain/packages/toolchain/src/actions/retest.ts:10-14; ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:180-188; ariestools/toolchain/packages/toolchain/src/lib/runOrExecPlan.ts:12-17; ariestools/toolchain/packages/toolchain/src/pm/resolveWorkspace.ts:10-14; ariestools/toolchain/packages/toolchain/src/bin/run-or-exec.ts:21,32; vitest 5.0.3 dist/chunks/index.DpLw24bj.js:14267-14275,14823-14836; `find <repo>/packages -maxdepth 2 -name 'vitest.config.*'` returns nothing in each of the five repos.
  - <sub>ids: skills/xy-toolchain/testing.md#0</sub>

- 🟠 **The preset's default include is stale: two globs, ts/tsx/mts/cts, and package-root spec/ since 10.1.0**
  - **Now:** testing.md:73: "Default include: `packages/*/src/**/spec/**/*.spec.ts`." The options table at :77 says the same.
  - **Actual:**
    - Since 10.1.0, `XY_VITEST_DEFAULT_INCLUDE` is `['packages/*/src/**/spec/**/*.spec.{ts,tsx,mts,cts}', 'packages/*/spec/**/*.spec.{ts,tsx,mts,cts}']`.
    - Both realm projects always exclude `**/node_modules/**` and `**/.claude/**`.
    - Package-root `spec/` folders (the skill's own example at :148) and .tsx/.mts/.cts specs are now found by default. Copying the old glob as an explicit `include` drops them.
    - The old single glob is still correct for 8.7.23-10.0.9, which covers 38 of 49 consumer repos.
  - **Fix:**
    - Show both defaults: `packages/*/src/**/spec/**/*.spec.ts` for ≤10.0.9, and the two-glob array for ≥10.1.0.
    - Mention the exported constant, so overrides can extend it: `include: [...XY_VITEST_DEFAULT_INCLUDE, 'extra/**']`.
    - Note the built-in excludes, and that package-root `spec/` needs no override.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defaults.ts:1-4,12-22; ariestools/toolchain/packages/vitest-config/dist/node/index.mjs:2-6; ariestools/toolchain/packages/vitest-config/README.md:22,64; ariestools/toolchain/docs/profiles.md:56; commit e7ea93749 (v10.1.0); `git show v10.0.9:packages/vitest-config/src/defaults.ts`.
  - <sub>ids: skills/xy-toolchain/testing.md#1, skills/xy-development/testing.md#4, cov-configpkgs#6, cov-config#9, cov-toolchain-history#5</sub>

- 🟠 **Single-package repos are told to hand-roll Vitest; the preset with an explicit `include` is the documented and scaffolded path**
  - **Now:**
    - testing.md:98: "keep a hand-rolled config when the package is a single-package repo or deliberately diverges".
    - testing.md:104: "For single-package repos or intentional one-offs, a minimal Node config is…".
    - project-profiles.md:57 and :127, and toolchain.md:117, present the preset as monorepo-only.
  - **Actual:**
    - STABILITY.md lists vitest-config as stable with "monorepo default include; pass `include` for a single package", and its README says single-package repos must pass `include`.
    - Since 9.2.0, `xy repo init` scaffolds `defineXyVitestConfig({ include: ['src/**/spec/**/*.spec.{ts,tsx,mts,cts}'] })` for single-package repos.
    - The default include targets `packages/*`, so in a single-package repo it matches nothing unless overridden.
    - The preset does not enable `globals`; the hand-rolled examples do.
    - All five ariestools repos use the preset.
  - **Fix:**
    - Recommend the preset for both layouts, with the single-package example above.
    - Keep hand-rolled configs for deliberate divergence only.
    - Note that `globals` is off: import from 'vitest', or pass `test: { globals: true }`.
    - Make the same change at project-profiles.md:57, :112 and :127, and at toolchain.md:117.
  - **Evidence:** ariestools/toolchain/docs/STABILITY.md:44; ariestools/toolchain/docs/profiles.md:54-58; ariestools/toolchain/packages/vitest-config/README.md:24; ariestools/toolchain/packages/vitest-config/src/defineXyVitestConfig.ts:14-22; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/vitest.config.ts.tmpl:1-5; ariestools/toolchain/packages/toolchain/src/actions/repo-init/templateVars.ts:85-87; ariestools/toolchain/CHANGELOG.md:58 ([9.2.0]).
  - <sub>ids: skills/xy-toolchain/testing.md#2, cov-configpkgs#7, skills/xy-toolchain/project-profiles.md#3</sub>

- 🟠 **`xy test` and `xy retest` defer to a same-named root script, which breaks the suggested `"test": "vitest run"`**
  - **Now:** testing.md:130-139 shows the script surface `"test": "vitest run"`. toolchain.md:96-106 shows root scripts with `"test": "vitest run"`, which contradicts toolchain.md:23. Neither file explains deferral.
  - **Actual:**
    - A global middleware runs the root package.json script named after the command, unless `--no-defer` or `XY_NO_DEFER=1` is set.
    - Yargs removes a declared positional from `argv._`, so this also fires for `xy test <target>` and forwards the target to the script.
    - With `"test": "vitest run"`, `pnpm xy test @scope/package` becomes `vitest run @scope/package`. That is a filename filter that matches nothing, and Vitest exits 1.
    - Scripts of the form `"build": "xy build"` are safe, because `XY_LOCAL_SCRIPT=1` guards against recursion.
    - The scaffold and the package README map build/compile/lint/fix/test/check to `xy <cmd>`, and current ariestools repos define no root `test` script.
    - Resolved: a round-1 finding said deferral needs "no positional argument". The source and a yargs 18.2.0 probe show it also fires with a declared target; subcommands such as `xy lint lint` do not defer.
  - **Fix:**
    - Change both examples to the scaffold set: `"test": "xy test"`, `"fix": "xy fix"`, `"check": "xy check"`. `lint:fix` can stay.
    - In testing.md "Use the repository test surface" and toolchain.md "Root scripts", state that:
      - `xy <cmd>` delegates to a same-named root script and forwards a target;
      - `--no-defer` or `XY_NO_DEFER=1` forces the built-in command;
      - since 10.1.1, `publish` and `deploy` never defer without `--defer`.

      Link commands.md Global behavior.
    - If `vitest run` is kept for a hand-rolled single-package repo, warn about the target forwarding.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/xyParseOptions.ts:60-67; ariestools/toolchain/packages/toolchain/src/lib/tryRunLocalScript.ts:13-56; ariestools/toolchain/packages/toolchain/README.md:22-32; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:28-35; yargs 18.2.0 probe `yargs(['test','@scope/pkg']).command('test [target]')` → middleware sees `_: ["test"]`.
  - <sub>ids: skills/xy-toolchain/testing.md#4, skills/xy-toolchain/toolchain.md#4</sub>

- ⚪ **Realm routing is broader than the table states**
  - **Now:** testing.md:90-94 routes `…/spec/node/…` and `…/spec/browser/…`. testing.md:96: "exclude `**/spec/node/**` from the browser project if using a hand-rolled config".
  - **Actual:** The node project excludes `**/spec/**/browser/**` and the browser project excludes `**/spec/**/node/**`. Any `node/` or `browser/` directory anywhere beneath a `spec/` directory routes the spec; for example, `spec/feature/node/x.spec.ts` is Node-only.
  - **Fix:** Describe the segments as `…/spec/**/node/…` and `…/spec/**/browser/…`. Change :96 to exclude `**/spec/**/node/**` from the browser project and `**/spec/**/browser/**` from the node project.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defaults.ts:14-22.
  - <sub>ids: skills/xy-toolchain/testing.md#7</sub>

- ⚪ **The spec-layout rule and the commands that enforce it are not named**
  - **Now:** testing.md:161: "the current repository-layout rule and compiler exclusions are built around `.spec.ts` and `spec/` conventions".
  - **Actual:**
    - The rule is `repo.spec-layout` (error, "Spec files live in spec/ folders"). It runs in `xy repo lint`, and therefore in `xy check`.
    - It scans only `*.spec.ts` files in non-root workspaces, skipping node_modules, dist, build, .git, .claude and nested checkouts. Root-only single-package repos are not checked.
    - The compile emit filter drops `.spec.`, `/spec/`, `.stories.` and `.example.` files, but not `.test.` files.
  - **Fix:** Name `repo.spec-layout` at :161 and link commands.md's repo lint row. Add that it checks only `*.spec.ts` in workspace packages, and that `.spec.tsx/.mts/.cts` files, which the preset discovers, must follow the same `spec/` placement.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:345-349; ariestools/toolchain/packages/toolchain/src/actions/package-lint-specs.ts:13,29,49-52; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileTsc.ts:90; `xy repo lint --rules` (10.1.1).
  - <sub>ids: skills/xy-toolchain/testing.md#9</sub>

- ⚪ **The spec example imports `.js`, and the `.ts` relative-import house rule is never stated**
  - **Now:** testing.md:202: `import { validateMove } from '../validateMove.js'`. typescript.md:34 lists `allowImportingTsExtensions` with no usage rule.
  - **Actual:** The base tsconfig enables `allowImportingTsExtensions`. Toolchain source, the `xy repo init` templates and the org repos import relative modules with `.ts`: toolchain 1810 `.ts` / 0 `.js`, sdk-react 891 / 0, actor-kit 268 / 0.
  - **Fix:** Change testing.md:202 to `'../validateMove.ts'`. Under typescript.md "Understand the base config", add: "Use `.ts` extensions in relative imports; the toolchain rewrites them on emit."
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:4; ariestools/toolchain/packages/toolchain/templates/repo/cli/package/src/index.ts.tmpl; grep counts of relative-import extensions over `packages/*/src`.
  - <sub>ids: cov-configpkgs#19, cov-toolchain-history#19, arch-layering#21</sub>

### Add

- 🔴 **The browser-realm setup never says to download Chromium, so `xy test` fails on fresh machines and CI runners**
  - **Now:** testing.md:27-33 installs only `@vitest/browser-playwright playwright`. :43-49 enables `browser: { provider: playwright() }`. :219: "If the shared preset skips browser tests, verify `browser.provider` is set and Playwright is installed."
  - **Actual:**
    - Installing the npm packages does not download a browser. playwright@1.63.0 has no lifecycle scripts, and pnpm runs build scripts only for packages listed in allowBuilds.
    - Every repo with a browser realm (sdk-js, actor-kit, browser-kit) runs `pnpm exec playwright install chromium` between build and test in CI. Node-only repos (sdk-react, cli-kit) do not.
  - **Fix:**
    - After the install block, add: "The npm packages do not download browsers. Run `pnpm exec playwright install chromium` once per machine, and in CI after `pnpm install --frozen-lockfile` and before `pnpm xy test` (add `--with-deps` on runners missing system libraries). Rerun it after bumping `playwright`."
    - Split :219 into two cases:
      1. No browser tests run: the `browser` option was omitted or set to `false`. The preset creates the browser project only when `browser: { provider: playwright() }` is passed.
      2. The browser project fails to launch: the Chromium binary is missing.
    - Link the CI gates subsection proposed for commands.md.
  - **Evidence:** `jq '{version,scripts}'` on ariestools/sdk-js/node_modules/.pnpm/playwright@1.63.0/node_modules/playwright/package.json → `scripts: null`; ariestools/sdk-js/pnpm-workspace.yaml:3-5; ariestools/sdk-js/.github/workflows/verify.yml:48-49; ariestools/actor-kit/.github/workflows/verify.yml:41-42; ariestools/browser-kit/.github/workflows/verify.yml:41-42; ariestools/toolchain/packages/vitest-config/src/defineXyVitestProjects.ts:59-60; ariestools/toolchain/packages/vitest-config/src/options.ts:38; sdk-js commit 3c03e7856.
  - <sub>ids: gap-gap-ci-guidance#0</sub>

- 🟠 **The hand-rolled config examples lack the `**/.claude/**` exclude**
  - **Now:** testing.md:106-115 and :119-128 show hand-rolled `defineConfig({ test: { environment, globals } })` configs with no exclude.
  - **Actual:** Claude Code background sessions check out full git worktrees under `.claude/worktrees/**`, and Vitest discovery collects the specs in those checkouts. The preset excludes `**/node_modules/**` and `**/.claude/**`, and the toolchain's own root config uses `exclude: [...configDefaults.exclude, '**/.claude/**']`.
  - **Fix:** Add `exclude: [...configDefaults.exclude, '**/.claude/**']` (import `configDefaults` from 'vitest/config') to both examples, with a one-line reason. Note that the preset already does this.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defaults.ts:6-22; ariestools/toolchain/vitest.config.ts:1-14; commit be4726332.
  - <sub>ids: skills/xy-toolchain/testing.md#3</sub>

- ⚪ **Preset options and exports beyond the table are undocumented**
  - **Now:** testing.md:75-84 lists include, exclude, browser, node, projects and test. `defineXySerializedProject` is described with hookTimeout/testTimeout only.
  - **Actual:**
    - `browser` also takes `headless` (default true), `instances` (default `[{ browser: 'chromium' }]`) and `test`. `node` takes `test`.
    - `defineXySerializedProject` also takes `setupFiles` and `test`; it runs with `environment: 'node'` and `fileParallelism: false`.
    - Exports: `XY_VITEST_DEFAULT_INCLUDE`, `XY_VITEST_NODE_EXCLUDE`, `XY_VITEST_BROWSER_EXCLUDE` and the option types.
    - The projects are named `node` and `browser`.
    - `node.test` and `browser.test` are spread last, so setting `include` or `exclude` there replaces the built-ins.
  - **Fix:** Add these to the options table or a short sub-list. Warn readers to use the top-level `exclude` option, which appends, rather than a per-realm `test.exclude`.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/index.ts:1-18; ariestools/toolchain/packages/vitest-config/src/options.ts:25-50,85-110; ariestools/toolchain/packages/vitest-config/src/defineXyVitestProjects.ts:14-41; ariestools/toolchain/packages/vitest-config/src/defineXySerializedProject.ts:10-25.
  - <sub>ids: skills/xy-toolchain/testing.md#5, cov-configpkgs#16</sub>

- ⚪ **No `--project node|browser` filter**
  - **Now:** testing.md:186-191 shows only `pnpm exec vitest run <path>` and `-t` as direct-Vitest escapes.
  - **Actual:** The preset names its projects `node` and `browser`. Vitest 5 supports `--project <name>`, repeatable, with wildcards and `!` negation.
  - **Fix:** Add `pnpm exec vitest run --project node` and `pnpm exec vitest run --project browser <path>`, run from the repo root.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defineXyVitestProjects.ts:17,29; `vitest --help` (5.0.3).
  - <sub>ids: skills/xy-toolchain/testing.md#8</sub>

## `skills/xy-toolchain/toolchain.md`

### Update

- 🔴 **Every pnpm repo needs pnpm-workspace.yaml with the release-age and verify settings; the skill says "when needed"**
  - **Now:** toolchain.md:37: "For pnpm workspaces, keep `pnpm-workspace.yaml` at the repository root." toolchain.md:114: "create the correct workspace file when needed."
  - **Actual:**
    - `xy packman lint` is stable and runs in `xy check`. For any pnpm repo, single-package or monorepo, it errors unless pnpm-workspace.yaml has:
      - `minimumReleaseAge` of at least 1440;
      - a `minimumReleaseAgeExclude` that matches exactly the known scopes the repo imports (@ariestools/\*, @xylabs/\*, @xyo-network/\*); an unused scope is also an error;
      - `verifyDepsBeforeRun`.
    - A missing file reports "No pnpm-workspace.yaml found", and `--fix` cannot create it.
    - `xy repo init --no-monorepo --pm pnpm` itself omits the file, and the monorepo template's file has only `packages:`.
    - pnpm repos also may not declare package.json `workspaces` (`repo.workspaces-field-placement`).
  - **Fix:**
    - Say every pnpm repo has a root pnpm-workspace.yaml, with a `packages:` list only in monorepos.
    - Show a minimal block: `minimumReleaseAge: 1440`, `minimumReleaseAgeExclude: ['@ariestools/*']` (the scopes actually imported), `verifyDepsBeforeRun: warn`.
    - Say workspace globs go there, never in package.json `workspaces`.
    - Say that once the file exists, `pnpm xy packman lint --fix` (or `xy check --fix`) fills in the settings.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/packman/lint.ts:39,147-174,211,237-284,306-362; ariestools/toolchain/packages/toolchain/src/lib/pnpmConfig/readMinReleaseAge.ts:12; ariestools/toolchain/packages/toolchain/src/actions/releaseAgeExcludeScopes.ts:6,103-119; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:59-60; ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:176-197; ariestools/toolchain/packages/toolchain/src/actions/repo-init/scaffold.ts:43; ariestools/toolchain/docs/STABILITY.md:84; ariestools/toolchain/pnpm-workspace.yaml:7-10.
  - <sub>ids: skills/xy-toolchain/toolchain.md#1</sub>

- 🟠 **The install command fails at a multi-pattern pnpm workspace root because it lacks `-w`**
  - **Now:** toolchain.md:43-45: `pnpm add -D @ariestools/toolchain @ariestools/tsconfig typescript`. :51 says `xy` runs at repository/workspace scope.
  - **Actual:**
    - pnpm refuses to add to a workspace root (ERR_PNPM_ADDING_TO_ROOT) when pnpm-workspace.yaml lists more than one `packages` pattern. Org repos with several patterns include XYOracleNetwork/sdk-xyo-client-js (7), xl1-protocol (4), sdk-xyo-react-js (4), ariestools/ariestools (3) and dapp-kit (2).
    - Single-pattern repos succeed: the scaffold, toolchain, sdk-js, sdk-react and cli-kit.
    - The toolchain, config packages, eslint, typescript and vitest belong in root devDependencies, because `xy` runs from the root.
  - **Fix:**
    - Use `pnpm add -D -w @ariestools/toolchain @ariestools/tsconfig typescript@^6 eslint`.
    - Explain that `-w` is required with more than one `packages` pattern and harmless otherwise.
    - Add that toolchain, config, eslint, typescript and vitest devDependencies go on the root package.
  - **Evidence:** `pnpm add --help` (`-w, --workspace-root`; `--ignore-workspace-root-check`); pnpm 10.33.2 dist/pnpm.cjs:18886,165583; pnpm 11.25.0 dist/pnpm.mjs:171359,225456; ariestools/toolchain/packages/toolchain/README.md:54; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:39-51; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/pnpm-workspace.yaml.
  - <sub>ids: skills/xy-toolchain/toolchain.md#0</sub>

- 🟠 **The "Require Node.js 22" step ignores the enforced engines/volta placement policy**
  - **Now:** toolchain.md:115: "Require Node.js 22 or newer unless the consuming product imposes a newer version."
  - **Actual:**
    - **Monorepos.** These repo-lint rules are errors in `xy check`; repo lint is skipped outside monorepos.
      - The root must not declare `engines` ("use volta instead", `repo.engines-non-terminal`).
      - Only the root declares `volta` (`repo.volta-only-root`).
      - Private workspace packages must not declare `engines`; every non-private workspace package must.
      - `engines` ranges must include the latest Node (`repo.engines-lts`). An old volta pin only warns.
    - **`xy node lint`.** It is warn-only and not part of `xy check`.
      - It wants `engines.node` within `>=22` for packages with Node exports, and flags `engines.node` on browser/neutral packages.
      - But its fixer then deletes `engines`, which trips the error-level `repo.engines-non-terminal`.
      - The toolchain's own neutral packages keep `engines.node: ">=22"` and accept the warning.
    - **Single-package repos.** The root is the published package and declares `engines.node: ">=22"`.
  - **Fix:** Replace step 2 with:
    - Monorepo:
      - no `engines` on the root; pin Node with root `volta.node`;
      - no `engines` on private packages;
      - every publishable package declares `engines.node` such as `">=22"` that still includes the latest Node, or set `nodeTrack: 'lts'`;
      - do not strip `engines` from neutral or browser packages to satisfy `xy node lint`.
    - Single-package: `engines.node: ">=22"` at the root.
    - Verify with `pnpm xy repo lint` or `pnpm xy check`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package-lint-engines.ts:71-87,139-140,190-216; ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:534-537; ariestools/toolchain/packages/toolchain/src/actions/node-lint.ts:18,110-166; `xy repo lint --rules`, `xy node lint --rules` (10.1.1); `xy node lint` output in ariestools/toolchain (lib-neutral, tsconfig\*) and ariestools/sdk-js; ariestools/toolchain/package.json:50-52.
  - <sub>ids: skills/xy-toolchain/toolchain.md#6</sub>

- 🟠 **The new-project baseline omits the gates `xy check` enforces**
  - **Now:** toolchain.md:110-124 covers pnpm, Node 22, the installs, `type: module`, the configs and `xy lint init`, then "Run the actual compile, lint, test, and publish-policy gates". It does not mention `xy check`, skills, READMEs, release-age settings or AGENTS.md.
  - **Actual:** A baseline that passes `xy check` needs:
    - **All repos:**
      - the pnpm release-age settings (packman lint errors without them);
      - the profile-required skills (`skills.required-*` are errors);
      - since 10.1.1, a root AGENTS.md with orient / authority / repository map / commands / failures sections, and a CLAUDE.md that is only an `@AGENTS.md` import or a symlink to AGENTS.md. These agent-lint errors cannot be fixed with `--fix`; `xy agent init` scaffolds the files.
      - `.xy/cache` ignored in every package (a warning).
    - **Monorepos only:**
      - root `private: true`;
      - packages under `packages/` and specs in `spec/`;
      - Node pinned via root `volta`, with engines placed as above;
      - a consumer README.md in every workspace package, listed in `files` when publishable.
    - The toolchain's own profiles doc ends verification with `pnpm xy check`.
    - Resolved: one round-1 recommendation said "keep CLAUDE.md as a bare `@AGENTS.md` import". `agents.adapter-thin` also accepts a symlink to AGENTS.md.
  - **Fix:**
    - Extend the checklist and split it by topology:
      - all repos: the pnpm settings, `pnpm xy agent init` (10.1.1+; link xy-agent), `pnpm xy skills lint --fix`, and `.xy/cache` ignored;
      - monorepos: the repo-lint items above.
    - End with `pnpm xy check --fix`, then `pnpm xy check`, alongside build and test. Link commands.md repository policy rather than repeating rule details.
    - Do not apply monorepo-only items, such as root `private: true`, to a single-package published library.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:13-74; ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:332-361,534-537; ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:69-134; ariestools/toolchain/packages/toolchain/src/actions/agent/init.ts; `xy skills lint --rules`, `xy repo lint --rules`, `xy git lint --rules`, `xy agent lint --rules` (10.1.1); ariestools/toolchain/docs/profiles.md:60-66.
  - <sub>ids: skills/xy-toolchain/toolchain.md#7, cov-toolchain-history#10</sub>

- 🟠 **The migration section omits `@xylabs/ts-scripts-*`, the manual boundary, `packman convert` and skill-source migration**
  - **Now:** toolchain.md:128: "Replace retired `@xylabs/toolchain`, ESLint-config, and tsconfig package names with their `@ariestools/*` equivalents."
  - **Actual:**
    - docs/migrate-xylabs.md also retires `@xylabs/ts-scripts-*`: common, pnpm, yarn3, react-pnpm and react-yarn3.
    - It states that `xy` and `xyex` never call `deprecationMigrate` and never rewrite package.json, so migration is manual:
      1. swap the devDependencies;
      2. repoint ESLint and tsconfig;
      3. move scripts to `xy build/compile/lint/test`, run from the root;
      4. adopt pnpm (`packageManager` plus a lockfile).
    - `xyex packman convert pnpm` (experimental) helps with yarn→pnpm and swaps the managed @xylabs packages.
    - Skills must move too: `skills.migrated-source` (error) requires xy-development and xy-toolchain to come from ariestools-skills.
  - **Fix:**
    - List the legacy names, and state that no `xy` command auto-migrates.
    - Copy the four steps and link docs/migrate-xylabs.md.
    - Mention `xyex packman convert pnpm` as an experimental helper.
    - Add `pnpm xy skills lint --fix` to fix the skill source.
  - **Evidence:** ariestools/toolchain/docs/migrate-xylabs.md:3,7-24; ariestools/toolchain/architecture.md:56; ariestools/toolchain/packages/toolchain/src/actions/packman/swapTsScriptsDependency.ts:12-20; ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:14-19; `xyex packman convert --help`, `xy skills lint --rules` (10.1.1).
  - <sub>ids: skills/xy-toolchain/toolchain.md#8, cov-toolchain-history#18</sub>

- ⚪ **The `package-*` hooks are presented as a stable surface**
  - **Now:** toolchain.md:68-90: "Use `package-*` binaries as per-package hooks…", with seven hooks and the `-only` variants. compilation.md:103-108 tells agents to run `package-sync-layout` by hand.
  - **Actual:**
    - STABILITY.md calls the `package-*` bins an implementation detail of `xy` that may change on a minor, and asks docs and automation to prefer the `xy` CLI.
    - Root orchestration reaches each hook through `run-or-exec`, so package script overrides apply. Since 10.1.0, identity scripts keep `--emit-only`.
    - `xy compile` re-syncs the monolith layout itself. Running `package-sync-layout` by hand is needed only to sync without compiling, or for `--check` drift detection.
    - Resolved: one item suggested also listing package-relint, package-copy-assets-\* and run-or-exec. Since these are not a stable surface, the table should not grow.
  - **Fix:**
    - At :68, add: `package-*` bins are internal hooks for package-script extension, not semver-stable; prefer `xy` in docs and CI, except where no `xy` equivalent exists (e.g. `package-sync-layout --check`).
    - In compilation.md:103-108, say that `xy compile` regenerates the layout automatically.
  - **Evidence:** ariestools/toolchain/docs/STABILITY.md:53; ariestools/toolchain/packages/toolchain/package.json:31-50; ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:62,67,187; ariestools/toolchain/packages/toolchain/src/lib/runOrExecPlan.ts:7-32; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:157; ariestools/toolchain/packages/toolchain/src/bin/package/sync-layout.ts:11; ariestools/toolchain/docs/code-review-2026-10-06.md:11-18.
  - <sub>ids: skills/xy-toolchain/toolchain.md#9, cov-cli#19, cov-toolchain-history#20</sub>

- ⚪ **`xy repo init` guidance predates the wizard and the current defaults**
  - **Now:** toolchain.md:124: "Use `xy repo init cli` only after inspecting its generated output and passing an explicit scope."
  - **Actual:**
    - `xy repo init [template] [name]` runs an interactive wizard when the template is omitted, and `cli` is the only template.
    - Defaults: scope @ariestools (`none` for unscoped), license MIT, author Aries Tools, package manager pnpm (the others are experimental), monorepo true, skills tier xy.
    - Flags: `--scope`, `--license`, `--author*`, `--github-org`, `--pm`, `--monorepo/--no-monorepo`, `--react`, `--skills-tier none|xy|xyo|xl1`, `--skills-optional`, `-y`, `--skip-install`, `--skip-git`.
    - At 10.1.1 the template has three concrete problems:
      - it still pins `vitest ~4.1.10`, below vitest-config's ^5.0 peer;
      - it pins volta node 22.14.0, which `node.volta-node-latest` flags;
      - single-package pnpm output omits pnpm-workspace.yaml.
  - **Fix:**
    - Mention the wizard (`pnpm xy repo init`, or `npx --package=@ariestools/toolchain xy repo init` in a fresh directory) and the explicit form (`xy repo init cli <name> --scope <scope> --license <spdx> --skills-tier <tier> --yes`).
    - Keep "inspect the output", and name what to check: the vitest and volta pins against current peers.
    - Then run `xy check`.
  - **Evidence:** `xy repo init --help` (10.1.1); ariestools/toolchain/packages/toolchain/README.md:102-128; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:41-55; ariestools/toolchain/packages/vitest-config/package.json:61-62; ariestools/toolchain/packages/toolchain/src/actions/repo-init/scaffold.ts:43.
  - <sub>ids: skills/xy-toolchain/toolchain.md#10</sub>

### Add

- 🟠 **Legacy `xy claude` agent files are never addressed, and the router does not say this skill supersedes them**
  - **Now:** toolchain.md:126-132 covers package renames, 404/403 handling and recursion only. The SKILL.md:10-12 Authority paragraph mentions only the xyo-skills stubs and the retired `@xylabs/*` package names.
  - **Actual:**
    - 10 repos that install this skill also track retired `xy claude` output, and an 11th has it locally:
      - skills xylabs-e2e-setup, xylabs-refactor-cohesion, xylabs-xy-cli and xylabs-xy-deplint-fix;
      - `.claude/rules/xylabs-*.md`;
      - `.claude/commands/xy-*.md`.
    - These files contradict this skill on package (`@xylabs/ts-scripts-yarn3`), package manager (yarn), compiler (tsup) and command names.
    - They also claim the same triggers. xylabs-xy-cli's description says to use it "whenever the user asks how to build, lint, test, deploy, or run any tooling command".
    - `xy claude` and `xy claude-rules` were removed in 8.2.8, and neither `xy skills lint` nor `xy check` reports these files.
    - SKILL.md is the file that reliably loads, so that is where the precedence statement belongs.
  - **Fix:**
    - Add a "Legacy agent files from `xy claude`" subsection to toolchain.md that:
      - lists the names;
      - states that this skill wins where they conflict;
      - says not to follow their commands (compile-only, lintlint, gitlint, deploy-minor/major/next, gen-docs, readme, knip, dupdeps);
      - gives the removal steps: `pnpm xy skills remove <names> -y`, then `git rm` the rules and commands;
      - notes that `xy skills lint` and `xy check` will not flag them.
    - Add one sentence to the SKILL.md Authority paragraph: "If the repo also has xylabs-* skills, .claude/rules/xylabs-*.md or .claude/commands/xy-*.md, they are retired output of the removed `xy claude` command; this skill supersedes them (see toolchain.md)."
  - **Evidence:** XYOracleNetwork/plugins/.agents/skills/xylabs-xy-cli/SKILL.md:3-7; XYOracleNetwork/sdk-xyo-client-js/.claude/rules/xylabs-architecture.md:3-6; XYOracleNetwork/wallet-xl1-chrome/.claude/skills; ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:202-205; ariestools/toolchain/packages/toolchain/src/actions/skills/lint.ts:391-401; skills@1.7.1 dist/cli.mjs:1510,6791-6799.
  - <sub>ids: gap-gap-legacy-xylabs-artifacts#3, gap-gap-legacy-xylabs-artifacts#5</sub>

- 🟠 **No 9.x → 10.x upgrade note: the removed aliases now pass silently**
  - **Now:** absent. No skill mentions `gitlint`, `lintlint`, `node-lint`, `republint` or `skills updo`.
  - **Actual:**
    - 10.0.0 removed four top-level aliases, with these replacements:
      - `xy gitlint` → `xy git lint`
      - `xy lintlint` → `xy lint lint`
      - `xy node-lint` → `xy node lint`
      - `xy republint` → `xy publint --fresh`
    - On 10.1.1 each removed name prints "Command not found [...]" and exits 0, so a CI step or agent check that uses one now passes without linting anything.
    - 9.2.0 removed `xy skills updo` in favor of `xy skills lint --fix`, which updates skills only from 9.2.0 onward.
    - Neither removal is in CHANGELOG.md.
    - Six XYO repos on 10.0.7-10.1.1 track `.claude/commands/xy-gitlint.md`, as does sdk-xyoworld-js on 9.0.4. Legacy xylabs-xy-cli skills list `xy lintlint` and `xy gitlint`.
    - 10.0.x patch releases and 10.1.1 also add error-level gates: not-public (10.0.3), package READMEs (10.0.5), importsMatchExports (10.0.9) and agent lint (10.1.1).
  - **Fix:** Add an "Upgrading 9.x → 10.x" subsection to the migration section with:
    - the alias table above;
    - the exit-0 warning, plus a grep of package.json scripts, .github/workflows, .claude/commands and legacy skills for the old names;
    - `xy skills updo` → `xy skills lint --fix`;
    - rerun `xy check` and `xy build` after any toolchain bump, not only after a major.
  - **Evidence:** commits 13350616a and 78f3807d6 (`git describe --contains` → v10.0.0); ariestools/toolchain/packages/toolchain/src/xy/xy.ts:121-129; `xy gitlint|lintlint|node-lint|republint` in an empty directory (10.1.1) → exit 0; `git show v9.1.1:…/skills/index.ts` vs v9.2.0 (`CUSTOM_SKILLS_COMMANDS`); commit d37b662eb; `git ls-files` for `.claude/commands/xy-gitlint.md` in seven XYO repos.
  - <sub>ids: gap-gap-toolchain-version-scope#1</sub>

## `skills/xy-toolchain/typescript.md`

### Update

- 🔴 **Unversioned `typescript` installs now pull TypeScript 7, which the toolchain cannot use**
  - **Now:** toolchain.md:41-45 and typescript.md:14-23 run `pnpm add -D … typescript` with no version. typescript.md:25: "Use TypeScript 5.9 or 6 with the current toolchain." Nothing mentions TS 7, `typescript-native` or `compile.compiler`.
  - **Actual:**
    - npm `latest` for typescript is 7.0.2, published 2026-07-08, so no release-age window holds it back.
    - 7.0.2 is the Go compiler. Its root export is only ./lib/version.cjs, so it has no compiler API.
    - @ariestools/toolchain peers on `typescript ^5.9 || ^6.0`. ESLint, deplint, dead and api-exposure load the API from `typescript`.
    - `xy updo` caps typescript at major 6, even with `--latest`, and the scaffold pins `~6.0.3`.
    - TS 7 is supported only side by side, as `typescript-native: npm:typescript@~7.0.2` with `compile.compiler: 'native'`. That is experimental and is set up with `xyex enable ts-native`.
  - **Fix:**
    - Pin typescript in every install command (toolchain.md:44 and typescript.md:16-22), e.g. `typescript@^6`. That fits toolchain.md:47's advice not to copy exact patch versions.
    - Extend typescript.md:25: keep `typescript` within `^5.9 || ^6.0` and never upgrade it to 7. TS 7 is only an experimental side-by-side alias (`pnpm xyex enable ts-native`), incompatible with `compile.validator: 'shared'`, and must not be required by shared examples.
    - Link compilation.md for the compile fields.
  - **Evidence:** `npm view typescript dist-tags` (latest 7.0.2); `npm view typescript@7.0.2 exports`; `npm view @ariestools/toolchain@10.1.1 peerDependencies`; ariestools/toolchain/packages/toolchain/package.json:99-108; ariestools/toolchain/packages/toolchain/src/lib/updo/majorCeiling.ts:16-28; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:48; ariestools/toolchain/packages/toolchain/src/actions/enable/tsNative.ts:144-153; ariestools/toolchain/docs/STABILITY.md:59,98-99; `xy --stability --json` (`compile.compiler.native`).
  - <sub>ids: skills/xy-toolchain/typescript.md#2, cov-toolchain-history#1, cov-toolchain-history#0</sub>

- 🟠 **Per-platform type handling is vague: Node packages need `compile.node`, and Node types in non-node packages fail publint**
  - **Now:** typescript.md:82: "Keep browser and neutral packages free of Node types unless the source genuinely requires them. The compiler resolves platform-specific types when producing browser, neutral, and node targets." :64-80 add `types: ["node"]` without saying the node target must be opted in.
  - **Actual:**
    - **Per-target passes.**
      - `xy compile` writes a check tsconfig and a declaration tsconfig per target, at `build/tsconfig.package-{check|dts}-<platform>-<src>.json`.
      - Browser and neutral passes drop `node` from `types`, and use `[]` when `types` is unset.
      - Browser passes force `moduleResolution: Bundler` and `customConditions: ['browser']`.
      - `module` (ESNext for browser, NodeNext for node) is set only when the package tsconfig omits it.
    - **The opt-in trap.** Neutral is the only target built unless another is opted in. A package with `types: ["node"]` and no `compile.node: true` therefore fails declaration emit ("Compile:Declaration emit had N errors"), even though raw tsc passes.
    - **TS5095.** An explicit `module: NodeNext` in a package that also emits a browser target hits TS5095.
    - **Publint.** The `xy publint` `platform` rule (error, run by `xy build`) fails a package that has no node export target but lists `node` in its root tsconfig `types`. It also fails any browser or neutral export that imports `node:*` or exposes Node ambient types. So the escape clause "unless the source genuinely requires them" leads to a failing build.
  - **Fix:** Replace :82 with a "Per-target type passes" note:
    1. Browser and neutral passes drop Node types.
    2. A Node package pairs `types: ["node"]` with `compile.node: true`; link compilation.md target selection.
    3. Without a node target, do not list `node` in `types`. Even with one, browser and neutral entry points must stay Node-free (publint `platform`).
    4. Do not set `module` in a package that emits a browser target.
    5. When declaration emit fails but validation passes, inspect `build/tsconfig.package-dts-<platform>-<src>.json`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolvePlatformTypes.ts:32-41; ariestools/toolchain/packages/toolchain/src/actions/package/compile/createTypescriptConfig.ts:45-61,75-97,135-151; ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:304-310,360-370; ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompilePlatforms.ts:63-96; ariestools/toolchain/packages/toolchain/src/actions/package/platformPublint.ts:387-397,434-436,459-463; ariestools/toolchain/packages/toolchain/src/actions/package/publintRules.ts:51; typescript 6.0.3 lib/typescript.js:129880-129882 (TS5095).
  - <sub>ids: skills/xy-toolchain/typescript.md#0, cov-configpkgs#5</sub>

- 🟠 **The `include: ["src"]` examples shrink `xy compile` validation and contradict the templates**
  - **Now:** typescript.md:46-51, :55-60, :72-79 and :94-101 all show `"include": ["src"]`. :117 says to keep tsconfig.json broad for validation, and :123 says "full-package validation includes non-emitted TypeScript files by design."
  - **Actual:**
    - The validation pass takes the package tsconfig.json's file list (minus nested `packages/`) and forces noEmit. With `include: ["src"]`, package-root xy.config.ts, vitest.config.ts, eslint.config.ts and .storybook/ are never validated.
    - Emission inputs are derived separately: `src/**/*` minus spec, stories and example files.
    - The repo-init templates and the @ariestools repos use exclude-only configs.
    - A package with no tsconfig.json skips validation with only a warning.
  - **Fix:**
    - Change the four examples to the template shape `{ "extends": "@ariestools/tsconfig", "exclude": ["dist"] }`. For the root: `"exclude": ["dist", "docs", "**/dist", "**/docs", "coverage", "**/coverage"]`.
    - Add that narrowing `include` to `src` removes configs and Storybook from validation, while emission is derived from `src` automatically.
    - Add that every package needs its own tsconfig.json.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/validateFullPackage.ts:30-76; ariestools/toolchain/packages/toolchain/src/actions/package/compile/createTypescriptConfig.ts:123-131; ariestools/toolchain/packages/toolchain/templates/repo/cli/package/tsconfig.json.tmpl; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/tsconfig.json.tmpl; ariestools/sdk-js/tsconfig.json; ariestools/sdk-js/packages/crypto/tsconfig.json; ariestools/toolchain/papers/YELLOW-PAPER.md:263.
  - <sub>ids: skills/xy-toolchain/typescript.md#1</sub>

- ⚪ **The `types` explanation assumes TS 5.9 auto-inclusion; on TS 6, `types` defaults to `[]`**
  - **Now:** typescript.md:104: "Setting `compilerOptions.types` disables automatic `@types/*` inclusion."
  - **Actual:** TS 6 is the toolchain's dev compiler and the scaffold default. On TS 6, automatic type directives are `options.types ?? []`, and `@types/*` packages are discovered only when `types` contains "*". Setting `types` disables auto-inclusion only on TS 5.9.
  - **Fix:** Reword :104: on TS 5.9, setting `types` turns off automatic `@types/*` inclusion; on TS 6, nothing from `@types/*` is included unless it is listed (or `types` contains "*"). Either way, list Node, test-global and lib-neutral types explicitly. Optionally add to :123 that on TS 6 a missing `process` or `Buffer` usually means `types` was never declared.
  - **Evidence:** typescript 6.0.3 lib/typescript.js:21973-21975,44672-44675; ariestools/toolchain/packages/toolchain/package.json:99; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:48.
  - <sub>ids: skills/xy-toolchain/typescript.md#3</sub>

- ⚪ **The base-config summary omits options that change what compiles**
  - **Now:** typescript.md:29-38 lists target/lib, module/moduleResolution, the strict flags, allowImportingTsExtensions/allowJs/resolveJsonModule, isolatedModules/erasableSyntaxOnly, declarations/maps, outDir and noEmit. It does not say what `erasableSyntaxOnly` rejects.
  - **Actual:**
    - **Unlisted options.** The base also sets:
      - `experimentalDecorators: true`: legacy decorators, restored deliberately on 2026-05-20 and used by the SDK's `staticImplements`;
      - `importHelpers: true`;
      - `esModuleInterop`, `allowSyntheticDefaultImports` and `skipLibCheck`;
      - `removeComments: false` and `incremental: false`;
      - a base `exclude` list (.github, .vscode, .yarn, dist, node_modules, storybook-static, build), which a package-level `exclude` replaces.
    - **`erasableSyntaxOnly`.** It makes enums, constructor parameter properties, runtime namespaces and `import x = require()` TS1294 errors. sdk-js threads overrides it.
    - **tslib.** When decorators are present, deplint treats `tslib` as an implicit devDependency. It tolerates the declaration but does not require it.
    - Resolved: one item said deplint "enforces" tslib. implicitDevDependencies.ts is consumed only by getUnusedDevDependencies, so the effect is only that tslib is not reported as unused.
  - **Fix:**
    - Add `experimentalDecorators` (legacy semantics, not TC39) and `importHelpers` to the list.
    - Add one line on what `erasableSyntaxOnly` rejects, cross-referenced to skills/xy-development/typescript.md for alternatives, and say that overriding it needs a package-level reason.
    - Note that a package `exclude` replaces the base list.
    - Do not tell agents they must add tslib.
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:3-28; commit 417ebf827; ariestools/toolchain/packages/toolchain/src/actions/deplint/implicitDevDependencies.ts:32-44,107-110,151-162; ariestools/toolchain/packages/toolchain/src/actions/deplint/checkPackage/getUnusedDevDependencies.ts:8,56; scratch tsc 6.0.3 (TS1294); ariestools/sdk-js/packages/threads/tsconfig.json; ariestools/sdk-js/packages/sdk/src/modules/static-implements/staticImplements.ts.
  - <sub>ids: skills/xy-toolchain/typescript.md#4, cov-configpkgs#4</sub>

- ⚪ **The tsconfig chain's peers are pinned to the same lockstep minor**
  - **Now:** typescript.md:12: "The DOM and React packages declare their parent configs as peers. Install the complete chain explicitly". The commands at :14-23 are unversioned.
  - **Actual:** The published peer ranges are tilde ranges on the lockstep release: tsconfig-dom peers `@ariestools/tsconfig ~10.1.0`, and tsconfig-react peers tsconfig and tsconfig-dom at `~10.1.0`. Bumping one package alone leaves the peers unsatisfied.
  - **Fix:** After :12, add: "The parent-config peers are tilde ranges on the exact lockstep release (e.g. tsconfig-react@10.1.1 peers `@ariestools/tsconfig ~10.1.1`). Upgrade `@ariestools/tsconfig`, `-dom` and `-react` together (e.g. with `xy updo`), and keep `@ariestools/lib-neutral` and `@ariestools/toolchain` on the same release."
  - **Evidence:** `npm view @ariestools/tsconfig-react@10.1.0 peerDependencies`; `npm view @ariestools/tsconfig-dom peerDependencies`; ariestools/toolchain/packages/tsconfig-dom/package.json and ariestools/toolchain/packages/tsconfig-react/package.json (`workspace:~`); ariestools/toolchain/docs/STABILITY.md:18.
  - <sub>ids: skills/xy-toolchain/typescript.md#7</sub>

- ⚪ **Troubleshooting does not say that monolith tsconfig `paths` are generated**
  - **Now:** typescript.md:123 tells agents to inspect "path aliases".
  - **Actual:** In `compile.monolith` packages, layout sync regenerates tsconfig `compilerOptions.paths`, together with package.json `imports` and the barrels, and `package-sync-layout --check` reports hand edits as drift. sdk-js packages/sdk has dozens of generated `#module` paths.
  - **Fix:** After "path aliases", add "(in `compile.monolith` packages, tsconfig `paths` and package.json `imports` are generated; fix the monolith config and re-sync instead of editing them; see compilation.md monolith mode)". Optionally name the generated files at compilation.md:110.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithCompileLayout.ts:143-164,276-316; ariestools/toolchain/packages/toolchain/src/bin/package/sync-layout.ts:17-32; ariestools/sdk-js/packages/sdk/tsconfig.json.
  - <sub>ids: skills/xy-toolchain/typescript.md#8</sub>

### Add

- ⚪ **The lib-neutral section does not list the notable missing globals that lint rules push toward**
  - **Now:** typescript.md:106-111 lists the declared surface: timers and AbortController/AbortSignal.
  - **Actual:**
    - The declared surface is accurate, but it lacks `console`, `URL`, `TextEncoder`/`TextDecoder`, `queueMicrotask`, and the static `AbortSignal.timeout()` / `AbortSignal.any()`. All of these are compile errors in a neutral package.
    - `unicorn/prefer-abort-signal-any` warns from tier 2 and `prefer-abort-signal-timeout` at tier 4, so the linter suggests APIs that lib-neutral does not type. The warning then fails `xy lint --strict`.
  - **Fix:**
    - Add a "Not declared" line after the surface list.
    - Tell agents to inject these capabilities (e.g. a logger instead of `console`) or extend lib-neutral upstream with WinterTC common APIs, and never to add @types/node or DOM.
    - Where those unicorn rules fire in a neutral package, disable them with a scoped, commented override for that package's files.
    - Do not add a `stable-narrow` label here; that proposal was refuted (see below).
  - **Evidence:** ariestools/toolchain/packages/lib-neutral/globals.d.ts:21-37; scratch tsc 6.0.3 with lib-neutral types (TS2339, TS2584, TS2304); computed tier-3/4 ESLint config.
  - <sub>ids: cov-configpkgs#15</sub>

## Refuted during verification

- compile.mode 'tsc' now fails the compile; say so instead of "not wired" — `skills/xy-toolchain/compilation.md#10` — skill lens: compilation.md:78 already says `mode: 'tsc'` is not wired and must not be recommended, matching the toolchain's own error text. Since 9.2.0 it fails with exit 1, which only enforces that advice, so the rewording is optional polish.
- Missing the `stable-narrow` status of lib-neutral — `skills/xy-toolchain/typescript.md#6` — skill lens: typescript.md:88 and :106-111 already describe a curated WinterTC subset that grows only upstream, and the file forbids @types/node. No other package in the skill carries a stability label, and the proposed "never declare locally" rule is not in STABILITY.md or the lib-neutral README.
